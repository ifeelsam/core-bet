// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MinesGame is Ownable, ReentrancyGuard {
    uint8 public constant GRID_SIZE = 25;
    uint8 public constant MAX_MINES = 24;

    uint16 public houseFeePercentage = 50; // 0.5% with 2 decimals
    uint16 public constant MAX_FEE = 1000; // Max 10%

    struct Tile {
        bool actual_value; // true = mine, false = safe
        bool isreveal; // true = revealed, false = hidden
    }

    struct Game {
        uint256 betAmount;
        uint8 mineCount;
        bytes32 seed;
        uint8 revealedCount;
        Tile[GRID_SIZE] revealed;
        bool active;
        bool cashed;
    }

    mapping(address => Game) public games;

    event BetPlaced(address indexed player, uint256 amount, uint8 mineCount);
    event TileRevealed(address indexed player, uint8 tileIndex, bool isMine);
    event GameOver(address indexed player, uint256 betAmount, bool won);
    event CashedOut(address indexed player, uint256 winAmount);

    constructor() Ownable(msg.sender) {}

    function calculateMultiplier(
        uint8 _mineCount
    ) public pure returns (uint256) {
        require(
            _mineCount > 0 && _mineCount <= MAX_MINES,
            "Invalid mine count"
        );

        return (GRID_SIZE * 10000) / (GRID_SIZE - _mineCount);
    }

    function calculatePotentialReturn(
        uint256 _betAmount,
        uint8 _mineCount
    ) public view returns (uint256) {
        uint256 multiplier = calculateMultiplier(_mineCount);
        uint256 adjustedMultiplier = (multiplier *
            (10000 - houseFeePercentage)) / 10000;
        return (_betAmount * adjustedMultiplier) / 10000;
    }

    function calculateCurrentReward(
        address _player
    ) public view returns (uint256) {
        Game storage game = games[_player];
        require(game.active, "No active game");

        if (game.revealedCount == 0) return 0;

        uint8 safeTotal = GRID_SIZE - game.mineCount;

        uint256 baseMultiplier = calculateMultiplier(game.mineCount);

        baseMultiplier =
            (baseMultiplier * (10000 - houseFeePercentage)) /
            10000;

        uint256 reward = game.betAmount;

        if (game.revealedCount < safeTotal) {
            // Partial completion - calculate fair reward based on progress
            reward =
                (game.betAmount * baseMultiplier * game.revealedCount) /
                (safeTotal * 10000);
        } else {
            // All safe tiles revealed - full reward
            reward = (game.betAmount * baseMultiplier) / 10000;
        }

        return reward;
    }

    function placeBet(uint8 _mineCount) external payable nonReentrant {
        require(
            _mineCount > 0 && _mineCount <= MAX_MINES,
            "Invalid mine count"
        );
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(!games[msg.sender].active, "Already have an active game");

        // Generate seed from current block values and player address
        bytes32 seed = keccak256(
            abi.encodePacked(
                blockhash(block.number - 1),
                block.timestamp,
                msg.sender,
                address(this)
            )
        );

        // Initialize a new game with all tiles as safe and not revealed
        Game storage newGame = games[msg.sender];
        newGame.betAmount = msg.value;
        newGame.mineCount = _mineCount;
        newGame.seed = seed;
        newGame.revealedCount = 0;
        newGame.active = true;
        newGame.cashed = false;

        // Initialize all tiles as safe and not revealed
        for (uint8 i = 0; i < GRID_SIZE; i++) {
            newGame.revealed[i] = Tile({actual_value: false, isreveal: false});
        }

        // Place mines randomly based on the seed
        uint8 minesPlaced = 0;
        while (minesPlaced < _mineCount) {
            // Generate a deterministic but random-looking index for each mine
            uint8 tileIndex = uint8(
                uint256(keccak256(abi.encodePacked(seed, minesPlaced))) %
                    GRID_SIZE
            );

            // If this tile is not already a mine, place a mine
            if (!newGame.revealed[tileIndex].actual_value) {
                newGame.revealed[tileIndex].actual_value = true;
                minesPlaced++;
            }
        }

        emit BetPlaced(msg.sender, msg.value, _mineCount);
    }

    // Reveal a tile
    function revealTile(uint8 _tileIndex) external nonReentrant returns (bool) {
        require(_tileIndex < GRID_SIZE, "Invalid tile index");

        Game storage game = games[msg.sender];
        require(game.active, "No active game");
        require(!game.revealed[_tileIndex].isreveal, "Tile already revealed");

        // Mark the tile as revealed
        game.revealed[_tileIndex].isreveal = true;

        bool isMine = game.revealed[_tileIndex].actual_value;

        if (isMine) {
            // Game over - hit a mine
            game.active = false;
            emit TileRevealed(msg.sender, _tileIndex, true);
            emit GameOver(msg.sender, game.betAmount, false);
            return true; // Is a mine
        } else {
            // Safe tile
            game.revealedCount++;

            // Check if all safe tiles have been revealed
            if (game.revealedCount == GRID_SIZE - game.mineCount) {
                // Automatically cash out if all safe tiles are revealed
                uint256 winAmount = calculateCurrentReward(msg.sender);
                game.active = false;
                game.cashed = true;

                (bool success, ) = payable(msg.sender).call{value: winAmount}(
                    ""
                );
                require(success, "Transfer failed");

                emit CashedOut(msg.sender, winAmount);
                emit GameOver(msg.sender, game.betAmount, true);
            }

            emit TileRevealed(msg.sender, _tileIndex, false);
            return false; // Is safe
        }
    }

    function cashOut() external nonReentrant {
        Game storage game = games[msg.sender];

        if (!game.active) {
            revert("No active game");
        }

        if (game.cashed) {
            revert("Already cashed out");
        }

        if (game.revealedCount == 0) {
            revert("Must reveal at least one tile");
        }

        uint256 winAmount = calculateCurrentReward(msg.sender);

        if (address(this).balance < winAmount) {
            revert("Insufficient contract balance");
        }

        game.active = false;
        game.cashed = true;
        // game.lastWinningAmount = winAmount;

        // Open all tiles
        for (uint8 i = 0; i < GRID_SIZE; i++) {
            game.revealed[i].isreveal = true;
        }

        // Transfer with more detailed error handling
        (bool success, bytes memory returnData) = payable(msg.sender).call{
            value: winAmount
        }("");
        if (!success) {
            if (returnData.length > 0) {
                // If there's return data, forward the error message
                assembly {
                    let returnDataSize := mload(returnData)
                    revert(add(32, returnData), returnDataSize)
                }
            } else {
                revert("Transfer failed with no error message");
            }
        }

        emit CashedOut(msg.sender, winAmount);
        emit GameOver(msg.sender, game.betAmount, true);
    }

    function getGameStatus(
        address _player
    ) external view returns (Game memory) {
        return games[_player];
    }

    function isTileRevealed(
        address _player,
        uint8 _tileIndex
    ) external view returns (bool) {
        require(_tileIndex < GRID_SIZE, "Invalid tile index");
        return games[_player].revealed[_tileIndex].isreveal;
    }

    function setHouseFeePercentage(uint16 _feePercentage) external onlyOwner {
        require(_feePercentage <= MAX_FEE, "Fee too high");
        houseFeePercentage = _feePercentage;
    }

    function withdrawFees(uint256 _amount) external onlyOwner {
        require(
            address(this).balance >= _amount,
            "Insufficient contract balance"
        );
        (bool success, ) = payable(owner()).call{value: _amount}("");
        require(success, "Transfer failed");
    }

    receive() external payable {}
}
