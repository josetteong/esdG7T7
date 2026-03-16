FROM python:3.11-slim

WORKDIR /app

COPY reservation-service/requirements.txt .
RUN pip install -r requirements.txt

COPY reservation-service/src ./src
COPY shared ./shared
COPY reservation-service/tests ./tests

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]