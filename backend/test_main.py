import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "SilentVault TEE Enclave Running"
    assert "tee_address" in response.json()

def test_evaluate_strategy_success():
    payload = {
        "user_address": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        "asset_symbol": "FLR",
        "amount": 10000.0
    }
    response = client.post("/api/evaluate-strategy", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["asset"] == "FLR"
    assert "ecdsa_signature" in data["tee_attestation"]
    assert "execution_nonce" in data["tee_attestation"]
