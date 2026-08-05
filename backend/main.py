import random
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="SilentVault AI - Confidential Execution Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvaluateStrategyRequest(BaseModel):
    user_address: str
    asset_symbol: str
    amount: float

@app.get("/")
def root():
    return {
        "service": "SilentVault Confidential Compute Engine",
        "network": "Flare Coston2 Testnet",
        "status": "Attested & Active (TEE Node Online)"
    }

@app.post("/api/evaluate-strategy")
def evaluate_strategy(req: EvaluateStrategyRequest):
    # Симуляция работы изолированной TEE-среды (Flare Confidential Compute)
    volatility = round(random.uniform(1.2, 8.5), 2)
    ftso_oracle_price = round(random.uniform(0.02, 0.05), 4) if req.asset_symbol == "FLR" else round(random.uniform(60000, 68000), 2)
    
    # Расчет конфиденциального риска
    risk_score = random.randint(15, 88)
    
    status = "NORMAL"
    if risk_score > 70:
        status = "HEDGED"
    elif risk_score > 85:
        status = "LIQUIDATED"

    nonce = f"0x{random.getrandbits(256):064x}"
    
    return {
        "user_address": req.user_address,
        "asset": req.asset_symbol,
        "ftso_price": ftso_oracle_price,
        "confidential_risk_score": risk_score,
        "recommended_action": status,
        "tee_attestation": {
            "attested_by": "Flare-Confidential-Compute-v1",
            "execution_nonce": nonce,
            "signature": f"0x{'a'*130}"  # Мок-подпись TEE для интерфейса
        }
    }
