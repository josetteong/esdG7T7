FROM python:3.11-slim

WORKDIR /app

COPY expiry-monitor-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY expiry-monitor-service/src ./src

CMD ["python", "src/app.py"]
