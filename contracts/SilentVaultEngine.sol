// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SilentVaultEngine
 * @notice Confidential Yield & Risk Automator on Flare Network
 * @dev Integrates Flare FTSO v2 Price Feeds with TEE Policy Enforcement
 */

interface IFtsoRegistry {
    function getCurrentPriceWithDecimals(string memory _symbol) external view returns (uint256 value, uint256 timestamp, uint8 decimals);
}

contract SilentVaultEngine {
    
    address public owner;
    address public teeEnforcer;
    IFtsoRegistry public ftsoRegistry;

    enum AssetStatus { NORMAL, HEDGED, LIQUIDATED }

    struct VaultPosition {
        uint256 depositedAmount;
        uint256 maxRiskThreshold;
        AssetStatus status;
        uint256 lastExecution;
    }

    mapping(address => mapping(string => VaultPosition)) public userPositions;
    mapping(bytes32 => bool) public executedExecutionHashes;

    event PositionDeposited(address indexed user, string assetSymbol, uint256 amount);
    event StrategyExecuted(address indexed user, string assetSymbol, AssetStatus newStatus, uint256 currentPrice);
    event TeeEnforcerUpdated(address indexed newEnforcer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier onlyTeeEnforcer() {
        require(msg.sender == teeEnforcer, "Caller is not authorized TEE Enforcer");
        _;
    }

    constructor(address _ftsoRegistry, address _teeEnforcer) {
        owner = msg.sender;
        ftsoRegistry = IFtsoRegistry(_ftsoRegistry);
        teeEnforcer = _teeEnforcer;
    }

    function setTeeEnforcer(address _newEnforcer) external onlyOwner {
        require(_newEnforcer != address(0), "Invalid TEE address");
        teeEnforcer = _newEnforcer;
        emit TeeEnforcerUpdated(_newEnforcer);
    }

    function depositAsset(string memory _symbol, uint256 _maxRiskThreshold) external payable {
        require(msg.value > 0, "Deposit value must be > 0");
        require(_maxRiskThreshold <= 100, "Risk threshold 0-100");

        VaultPosition storage pos = userPositions[msg.sender][_symbol];
        pos.depositedAmount += msg.value;
        pos.maxRiskThreshold = _maxRiskThreshold;
        pos.status = AssetStatus.NORMAL;
        pos.lastExecution = block.timestamp;

        emit PositionDeposited(msg.sender, _symbol, msg.value);
    }

    function executePrivateStrategy(
        address _user,
        string memory _symbol,
        AssetStatus _recommendedStatus,
        uint256 _computedRiskScore,
        bytes32 _executionNonce,
        bytes memory _signature
    ) external onlyTeeEnforcer {
        require(!executedExecutionHashes[_executionNonce], "Strategy nonce already executed");
        
        VaultPosition storage pos = userPositions[_user][_symbol];
        require(pos.depositedAmount > 0, "No active position found");

        (uint256 ftsoPrice, , ) = ftsoRegistry.getCurrentPriceWithDecimals(_symbol);

        bytes32 messageHash = keccak256(abi.encodePacked(_user, _symbol, _recommendedStatus, _computedRiskScore, _executionNonce));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        
        require(recoverSigner(ethSignedMessageHash, _signature) == teeEnforcer, "Invalid TEE Signature");

        executedExecutionHashes[_executionNonce] = true;
        pos.status = _recommendedStatus;
        pos.lastExecution = block.timestamp;

        emit StrategyExecuted(_user, _symbol, _recommendedStatus, ftsoPrice);
    }

    function getFlarePriceFeed(string memory _symbol) public view returns (uint256 price, uint256 timestamp, uint8 decimals) {
        return ftsoRegistry.getCurrentPriceWithDecimals(_symbol);
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _sig) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_sig);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
