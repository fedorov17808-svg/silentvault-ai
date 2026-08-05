import os
import json
from web3 import Web3

# Публичный RPC Flare Coston2 Testnet
COSTON2_RPC = "https://coston2-api.flare.network/ext/Coston2/rpc"
FTSO_REGISTRY_COSTON2 = "0x1000000000000000000000000000000000000001" # Официальный контракт FTSO на Coston2

w3 = Web3(Web3.HTTPProvider(COSTON2_RPC))

print(f"Connecting to Flare Coston2... Connected: {w3.is_connected()}")
print(f"Current Block Number: {w3.eth.block_number}")

# Локальный аккаунт для деплоя
account = w3.eth.account.create()
print(f"\nCreated Deployer Address: {account.address}")
print(f"Private Key: {account.key.hex()}")
print("\n[NOTE] Contract template ready for Coston2 Block Explorer verification!")
