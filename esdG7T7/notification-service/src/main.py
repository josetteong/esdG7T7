from contextlib import asynccontextmanager
from fastapi import FastAPI
from .routes import router
from .consumer import start_consumer


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_consumer()
    yield


app = FastAPI(title="Notification Service", lifespan=lifespan)
app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}
