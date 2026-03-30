FROM python:3.11-slim

WORKDIR /app

COPY vendor-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY vendor-service/src ./src
COPY shared ./shared

ENV PYTHONPATH=/app

CMD ["python", "-m", "src.app"]
