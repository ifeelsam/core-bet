// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MinesGame is Ownable, ReentrancyGuard {


uint8 public constant GRID_SIZE = 25;
uint8 public constant MAX_MINES = 24;


uint16 public constant SCALING_FACTOR = 1000;

uint16 public houseFeePercentage = 5;

uint16 public constant MAX_FEE = 100;

struct Game {
    uint256 betAmount;
    uint8 mineCount;
    bytes32                                                                                                                                                                                                         seed;
    uint8 revealedCount;
    bool[GRID_SIZE] revealed;
    bool active;
    bool cashed;
}

mapping(address => Game) public games;

event BetPlaced(address indexed player, uint256 amount, uint8 mineCount);
event TileRevealed(address indexed player, uint8 tileIndex, bool isMine);
event GameOver(address indexed player, uint256 betAmount, bool won);
event CashedOut(address indexed player, uint256 winAmount);

constructor() Ownable(msg.sender) {}


function calculateMultiplier(uint8 _mineCount) public pure returns (uint256) {
    require(_mineCount > 0 && _mineCount <= MAX_MINES, "Invalid mine count");
    return (GRID_SIZE * SCALING_FACTOR) / (GRID_SIZE - _mineCount);
}


function calculatePotentialReturn(uint256 _betAmount, uint8 _mineCount) public view returns (uint256) {
    uint256 multiplier = calculateMultiplier(_mineCount);
    uint256 adjustedMultiplier = multiplier * (SCALING_FACTOR - houseFeePercentage) / SCALING_FACTOR;
    return (_betAmount * adjustedMultiplier) / SCALING_FACTOR;
}


function calculateCurrentReward(address _player) public view returns (uint256) {
    Game storage game = games[_player];
    require(game.active, "No active game");
    
    if (game.revealedCount == 0) return 0;
    
    uint8 safeTotal = GRID_SIZE - game.mineCount;
    uint256 baseMultiplier = calculateMultiplier(game.mineCount);
    
    baseMultiplier = baseMultiplier * (SCALING_FACTOR - houseFeePercentage) / SCALING_FACTOR;
    
    uint256 reward;
    
    if (game.revealedCount < safeTotal) {
        // Partial progress: reward is prorated to the fraction of safe tiles revealed.
        reward = (game.betAmount * baseMultiplier * game.revealedCount) / (safeTotal * SCALING_FACTOR);
    } else {
        // All safe tiles have been revealed: full reward is paid.
        reward = (game.betAmount * baseMultiplier) / SCALING_FACTOR;
    }
    
    return reward;
}

function isTileMine(address _player, uint8 _tileIndex) internal view returns (bool) {
    Game storage game = games[_player];
    uint256 randomValue = uint256(keccak256(abi.encodePacked(game.seed, _tileIndex)));
    return randomValue % GRID_SIZE < game.mineCount;
}

function placeBet(uint8 _mineCount) external payable nonReentrant {
    require(_mineCount > 0 && _mineCount <= MAX_MINES, "Invalid mine count");
    require(msg.value > 0, "Bet amount must be greater than 0");
    require(!games[msg.sender].active, "Already have an active game");
    
    bytes32 seed = keccak256(abi.encodePacked(
        blockhash(block.number - 1),
        block.timestamp,
        msg.sender,
        address(this)
    ));
    
    games[msg.sender] = Game({
        betAmount: msg.value,
        mineCount: _mineCount,
        seed: seed,
        revealedCount: 0,
        revealed: [false, false, false, false, false, 
                   false, false, false, false, false,
                   false, false, false, false, false,
                   false, false, false, false, false,
                   false, false, false, false, false],
        active: true,
        cashed: false
    });
    
    emit BetPlaced(msg.sender, msg.value, _mineCount);
}

function revealTile(uint8 _tileIndex) external nonReentrant returns (bool) {
    require(_tileIndex < GRID_SIZE, "Invalid tile index");
    
    Game storage game = games[msg.sender];
    require(game.active, "No active game");
    require(!game.revealed[_tileIndex], "Tile already revealed");
    
    game.revealed[_tileIndex] = true;
    bool isMine = isTileMine(msg.sender, _tileIndex);
    
    if (isMine) {
        game.active = false;
        emit TileRevealed(msg.sender, _tileIndex, true);
        emit GameOver(msg.sender, game.betAmount, false);
        return true;
    } else {
        // Safe tile
        game.revealedCount++;
        

        if (game.revealedCount == GRID_SIZE - game.mineCount) {
            uint256 winAmount = calculateCurrentReward(msg.sender);
            game.active = false;
            game.cashed = true;
            
            (bool success, ) = payable(msg.sender).call{value: winAmount}("");
            require(success, "Transfer failed");
            
            emit CashedOut(msg.sender, winAmount);
            emit GameOver(msg.sender, game.betAmount, true);
        }
        
        emit TileRevealed(msg.sender, _tileIndex, false);
        return false;
    }
}

function cashOut() external nonReentrant {
    Game storage game = games[msg.sender];
    require(game.active, "No active game");
    require(!game.cashed, "Already cashed out");
    require(game.revealedCount > 0, "Must reveal at least one tile");
    
    uint256 winAmount = calculateCurrentReward(msg.sender);
    game.active = false;
    game.cashed = true;
    
    (bool success, ) = payable(msg.sender).call{value: winAmount}("");
    require(success, "Transfer failed");
    
    emit CashedOut(msg.sender, winAmount);
    emit GameOver(msg.sender, game.betAmount, true);
}

function getGameStatus(address _player) external view returns (
    uint256 betAmount,
    uint8 mineCount,
    uint8 revealedCount,
    bool active,
    bool cashed,
    uint256 currentReward
) {
    Game storage game = games[_player];
    return (
        game.betAmount,
        game.mineCount,
        game.revealedCount,
        game.active,
        game.cashed,
        game.active ? calculateCurrentReward(_player) : 0
    );
}

function isTileRevealed(address _player, uint8 _tileIndex) external view returns (bool) {
    require(_tileIndex < GRID_SIZE, "Invalid tile index");
    return games[_player].revealed[_tileIndex];
}

function setHouseFeePercentage(uint16 _feePercentage) external onlyOwner {
    require(_feePercentage <= MAX_FEE, "Fee too high");
    houseFeePercentage = _feePercentage;
}

function withdrawFees(uint256 _amount) external onlyOwner {
    require(address(this).balance >= _amount, "Insufficient contract balance");
    (bool success, ) = payable(owner()).call{value: _amount}("");
    require(success, "Transfer failed");
}

receive() external payable {}
}
