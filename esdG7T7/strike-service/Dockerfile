FROM python:3.11-slim

WORKDIR /app

COPY strike-service/requirements.txt .
RUN pip install -r requirements.txt

COPY strike-service/src ./src
COPY shared ./shared
COPY strike-service/tests ./tests

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]