# 📘 SilentVault AI — Technical Litepaper

## 1. Abstract
SilentVault AI is an automated, confidential risk management protocol built on the **Flare Network**. By marrying **Flare Confidential Compute (TEE)** and real-time oracle feeds from **Flare FTSO v2**, SilentVault AI resolves the fundamental dilemma of public DeFi strategies: execution parameter leakage leading to front-running and MEV exploitation.

## 2. Threat Model & Solution
### Public Execution (Traditional Vaults)
1. On-chain strategy parameters are observable in the mempool.
2. MEV bots front-run rebalancing calls, diluting yield for vault depositors.

### Confidential Execution (SilentVault AI)
1. Strategy thresholds, leverage ratios, and risk score matrices are evaluated inside isolated TEE hardware enclaves.
2. The enclave emits a cryptographic ECDSA attestation proof (`eth_account.sign_message`).
3. `SilentVaultEngine.sol` verifies the proof on-chain via native `ecrecover` before executing state changes.

## 3. Financial & Revenue Model
* **Management Fee:** 0.00% (Free base layer for individual vaults).
* **Performance Fee:** 10% on yield generated via automated delta-neutral hedging.
* **Auto-Hedge Protection Fee:** 0.10% per emergency liquidation / hedge trigger upon market dumps.

## 4. Security & Compliance
* Replay Protection via randomized single-use 256-bit nonces.
* Cryptographic signature matching tied directly to the enclave deployer wallet on Flare Coston2.
