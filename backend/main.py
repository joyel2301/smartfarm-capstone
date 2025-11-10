from fastapi import FastAPI
from app.routers.growth_router import router as growth_router

app = FastAPI(title="SmartFarm Backend (Supabase SDK)")
app.include_router(growth_router)

@app.get("/ping")
def ping():
    return {"ok": True}
