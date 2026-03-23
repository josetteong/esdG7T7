const express = require('express');
const amqp = require('amqplib');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api'); 

const app = express();
app.use(express.json());

// ─── CONFIG ──────────────────────────────────────────
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ;
const BOT_USERNAME = 'SFRB_Notif_BOt';

let channel;

// In-memory store
const userChatIds = {};
const pendingTokens = {};

// ─── TELEGRAM BOT ────────────────────────────────────
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Debug - log all messages
bot.on('message', (msg) => {
  console.log('Bot received:', msg.text, '| chatId:', msg.chat.id);
});

// Handle /start TOKEN
bot.onText(/\/start (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const token = match[1];
  console.log(`Start received - token: ${token}, chatId: ${chatId}`);

  if (pendingTokens[token]) {
    const { userId } = pendingTokens[token];
    userChatIds[userId] = chatId;
    delete pendingTokens[token];
    console.log(`User ${userId} linked to chatId ${chatId}`);
    bot.sendMessage(chatId, `Connected! You will now receive Food Rescue notifications.`);
  } else {
    console.log(`Token ${token} not found`);
    bot.sendMessage(chatId, `Invalid or expired link. Please generate a new one from the app.`);
  }
});

// ─── RABBITMQ SETUP ──────────────────────────────────
async function connectRabbitMQ(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting RabbitMQ connection... (${i + 1}/${retries})`);
      const conn = await amqp.connect(RABBITMQ_URL);
      channel = await conn.createChannel();

      await channel.assertExchange('food_rescue', 'topic', { durable: true });

      const queues = [
        'reservation.created',
        'reservation.collected',
        'reservation.cancelled',
        'listing.expired',
        'claimant.penalty_assigned'
      ];

      for (const queue of queues) {
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, 'food_rescue', queue);
      }

      console.log('Connected to RabbitMQ!');

      // ─── CONSUMERS ─────────────────────────────────
      channel.consume('reservation.created', async (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          console.log('reservation.created:', data);
          await sendTelegramToUser(data.recipientId, data.message);
          channel.ack(msg);
        }
      });

      channel.consume('reservation.cancelled', async (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          console.log('reservation.cancelled:', data);
          await sendTelegramToUser(data.recipientId, data.message);
          channel.ack(msg);
        }
      });

      channel.consume('reservation.collected', async (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          console.log('reservation.collected:', data);
          await sendTelegramToUser(data.recipientId, data.message);
          channel.ack(msg);
        }
      });

      channel.consume('listing.expired', async (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          console.log('listing.expired:', data);
          await sendTelegramToUser(data.recipientId, data.message);
          channel.ack(msg);
        }
      });

      channel.consume('claimant.penalty_assigned', async (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          console.log('claimant.penalty_assigned:', data);
          await sendTelegramToUser(data.recipientId, data.message);
          channel.ack(msg);
        }
      });

      return;
    } catch (err) {
      console.log(`Retrying in ${delay/1000}s...`, err.message);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Could not connect to RabbitMQ');
}

// ─── SEND TELEGRAM ───────────────────────────────────
async function sendTelegramToUser(userId, text) {
  const chatId = userChatIds[userId];
  if (!chatId) {
    console.log(`No Telegram registered for user ${userId}`);
    return;
  }
  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      { chat_id: chatId, text, parse_mode: 'HTML' }
    );
    console.log(`Telegram sent to ${userId}`);
  } catch (err) {
    console.error(`Failed to send Telegram:`, err.message);
  }
}

// ─── REST ENDPOINTS ──────────────────────────────────

// OutSystems calls this to publish to RabbitMQ
app.post('/publish', (req, res) => {
  const { routingKey, payload } = req.body;
  if (!channel) {
    return res.status(503).json({ error: 'RabbitMQ not connected' });
  }
  channel.publish(
    'food_rescue',
    routingKey,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }
  );
  console.log(`Published to ${routingKey}:`, payload);
  res.json({ status: 'published', routingKey });
});

// Direct Telegram for testing
app.post('/notify/telegram', async (req, res) => {
  const { message, userId } = req.body;
  if (userId) {
    await sendTelegramToUser(userId, message);
  } else {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      { chat_id: process.env.TELEGRAM_CHAT_ID, text: message }
    );
  }
  res.json({ status: 'sent' });
});

// Generate Telegram registration link
app.post('/register/generate-link', (req, res) => {
  const { userId, username } = req.body;
  const token = Math.random().toString(36).substring(2, 10).toUpperCase();
  pendingTokens[token] = { userId, username };
  console.log(`Token ${token} for user ${userId}`);
  res.json({
    success: true,
    telegramLink: `https://t.me/${BOT_USERNAME}?start=${token}`
  });
});

// Check registration status
app.get('/register/status/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({ connected: !!userChatIds[userId] });
});

// ─── START ────────────────────────────────────────────
app.listen(3000, () => console.log('Bridge running on port 3000'));
connectRabbitMQ();