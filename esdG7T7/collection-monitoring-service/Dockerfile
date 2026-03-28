FROM python:3.11-slim

WORKDIR /app

COPY collection-monitoring-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY collection-monitoring-service/src ./src

CMD ["python", "src/app.py"]
