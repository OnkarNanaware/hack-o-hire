from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import simulate, attachments

app = FastAPI(
    title="FraudSentinel API",
    description="Agentic AI Fraud Detection Platform - Barclays Layer",
    version="1.0.0"
)

# CORS configuration for Barclays Internal VNet
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to internal domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(simulate.router)
app.include_router(attachments.router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "mode": "offline", "provider": "Barclays Agentic AI Layer"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
