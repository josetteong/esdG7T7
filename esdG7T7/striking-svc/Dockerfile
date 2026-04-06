FROM python:3.11-slim

WORKDIR /app

COPY striking-svc/requirements.txt .
RUN pip install -r requirements.txt

COPY striking-svc/src ./src
COPY shared ./shared

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
