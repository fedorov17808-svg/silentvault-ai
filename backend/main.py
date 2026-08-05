import secrets
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from eth_account import Account
from eth_account.messages import encode_defunct

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEE_PRIVATE_KEY = "0x" + secrets.token_hex(32)
tee_account = Account.from_key(TEE_PRIVATE_KEY)

class StrategyRequest(BaseModel):
    user_address: str
    asset_symbol: str
    amount: float

# Данные под активы Flare FTSO v2
ASSET_DATA = {
    "FBTC": {"price": 64250.00, "risk_base": 42, "change": "+1.8%"},
    "FXRP": {"price": 0.5840, "risk_base": 55, "change": "-0.4%"},
    "FLR": {"price": 0.0309, "risk_base": 28, "change": "+3.2%"},
    "ETH": {"price": 3450.00, "risk_base": 38, "change": "+1.1%"},
    "USDC": {"price": 1.0000, "risk_base": 5, "change": "0.0%"},
    "SGB": {"price": 0.0085, "risk_base": 72, "change": "-2.1%"}
}

@app.get("/")
def read_root():
    return {"status": "SilentVault TEE Enclave Running", "tee_address": tee_account.address}

@app.post("/api/evaluate-strategy")
def evaluate_strategy(req: StrategyRequest):
    # Очищаем символ актива от префиксов (например FBTC -> FBTC)
    symbol = req.asset_symbol.split()[0].replace("(", "").replace(")", "")
    
    asset_info = ASSET_DATA.get(symbol, {"price": 100.0, "risk_base": 50, "change": "+0.0%"})
    
    # Считаем динамческий риск в зависимости от размера позиции и типа монеты
    volume_risk = min(30, int(req.amount / 5000))
    total_risk = min(99, asset_info["risk_base"] + volume_risk)
    
    recommendation = "SAFE_AUTO_YIELD" if total_risk < 50 else ("HEDGE_REQUIRED" if total_risk < 75 else "EMERGENCY_PROTECTION")
    execution_nonce = "0x" + secrets.token_hex(16)

    message_text = f"{req.user_address}:{symbol}:{recommendation}:{total_risk}:{execution_nonce}"
    message = encode_defunct(text=message_text)
    signed_message = Account.sign_message(message, private_key=TEE_PRIVATE_KEY)

    return {
        "status": "success",
        "asset": symbol,
        "ftso_price": asset_info["price"],
        "price_change_24h": asset_info["change"],
        "confidential_risk_score": total_risk,
        "recommended_action": recommendation,
        "tee_attestation": {
            "attested_by": f"Flare-TEE-Enclave ({tee_account.address[:8]}...)",
            "tee_signer_address": tee_account.address,
            "execution_nonce": execution_nonce,
            "ecdsa_signature": signed_message.signature.hex()
        }
    }
