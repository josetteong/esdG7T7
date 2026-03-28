FROM python:3.11-slim

WORKDIR /app

COPY collection-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY collection-service/src ./src

ENV PYTHONPATH=/app

CMD ["python", "-m", "src.app"]
