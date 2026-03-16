FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src ./src
COPY ../shared ./shared
COPY tests ./tests

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]