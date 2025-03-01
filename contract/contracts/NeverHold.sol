// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RWANFT.sol";

contract NeverHold is Ownable {
    uint256 private auctionIdCounter;

    enum AuctionType { ENGLISH, DUTCH, SEALED_BID, TIME_BASED, CHARITY }

    struct Auction {
        address seller;
        string name;
        AuctionType auctionType;
        address tokenAddress;
        uint256 startPrice;
        uint256 currentPrice;
        uint256 minBidIncrement;
        uint256 maxPrice;
        uint256 endTime;
        uint256 createdAt;
        bool active;
        address rewardToken;
        uint256 rewardTokenId;
        uint256 rewardAmount;
        bool isERC721;
        bool isERC1155;
        uint256 numWinners;
        bool canCloseEarly;
        bool isRWA;
        string rwaTokenURI;
        address[] bidders;
        mapping(address => uint256) bids;
        uint256 dutchPriceDecrement;
        uint256 sealedBidRevealTime;
        mapping(address => bytes32) sealedBids;
    }

    mapping(uint256 => Auction) public auctions;
    uint256 public creationFee;
    uint256 public commissionPercent;
    RWANFT public rwaNFTContract;

    event AuctionCreated(uint256 indexed auctionId, address indexed seller, string name, AuctionType auctionType, uint256 createdAt);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed auctionId, address[] winners, uint256[] finalPrices);
    event RWANFTMinted(uint256 indexed auctionId, uint256 tokenId, address winner);
    event CommissionUpdated(uint256 newCreationFee, uint256 newCommissionPercent);

    modifier onlyAuctionOwner(uint256 _auctionId) {
        require(msg.sender == auctions[_auctionId].seller, "Only auction owner can call this");
        _;
    }

    constructor() Ownable(msg.sender) {
        creationFee = 0.01 ether;
        commissionPercent = 5;
        auctionIdCounter = 0;
        rwaNFTContract = RWANFT(address(0));
    }

    function setRWANFTContract(address _rwaNFTAddress) external onlyOwner {
        require(_rwaNFTAddress != address(0), "Invalid RWANFT address");
        require(address(rwaNFTContract) == address(0), "RWANFT already set");
        rwaNFTContract = RWANFT(_rwaNFTAddress);
    }

    function setCommission(uint256 _creationFee, uint256 _commissionPercent) external onlyOwner {
        require(_commissionPercent <= 100, "Commission percent too high");
        creationFee = _creationFee;
        commissionPercent = _commissionPercent;
        emit CommissionUpdated(_creationFee, _commissionPercent);
    }

    function createAuction(
        string memory _name,
        AuctionType _auctionType,
        address _tokenAddress,
        uint256 _startPrice,
        uint256 _minBidIncrement,
        uint256 _maxPrice,
        uint256 _endTime,
        address _rewardToken,
        uint256 _rewardTokenId,
        uint256 _rewardAmount,
        bool _isERC721,
        bool _isERC1155,
        uint256 _numWinners,
        bool _canCloseEarly,
        bool _isRWA,
        string memory _rwaTokenURI,
        uint256 _dutchPriceDecrement,
        uint256 _sealedBidRevealTime
    ) external payable {
        require(msg.value >= creationFee, "Insufficient creation fee");
        require(_startPrice > 0, "Start price must be greater than 0");
        require(_endTime > block.timestamp, "End time must be in future");
        require(_numWinners > 0, "Number of winners must be greater than 0");
        if (_tokenAddress != address(0)) {
            require(!_isERC721 && !_isERC1155, "Invalid token config");
        }
        if (_isRWA) {
            require(bytes(_rwaTokenURI).length > 0, "RWA requires token URI");
        }
        if (_auctionType == AuctionType.DUTCH) {
            require(_dutchPriceDecrement > 0, "Dutch auction requires price decrement");
        }
        if (_auctionType == AuctionType.SEALED_BID) {
            require(_sealedBidRevealTime > block.timestamp && _sealedBidRevealTime < _endTime, "Invalid reveal time");
        }

        auctionIdCounter++;
        uint256 auctionId = auctionIdCounter;

        Auction storage auction = auctions[auctionId];
        auction.seller = msg.sender;
        auction.name = _name;
        auction.auctionType = _auctionType;
        auction.tokenAddress = _tokenAddress;
        auction.startPrice = _startPrice;
        auction.currentPrice = _startPrice;
        auction.minBidIncrement = _minBidIncrement;
        auction.maxPrice = _maxPrice;
        auction.endTime = _endTime;
        auction.createdAt = block.timestamp;
        auction.active = true;
        auction.rewardToken = _rewardToken;
        auction.rewardTokenId = _rewardTokenId;
        auction.rewardAmount = _rewardAmount;
        auction.isERC721 = _isERC721;
        auction.isERC1155 = _isERC1155;
        auction.numWinners = _numWinners;
        auction.canCloseEarly = _canCloseEarly;
        auction.isRWA = _isRWA;
        auction.rwaTokenURI = _rwaTokenURI;
        auction.dutchPriceDecrement = _dutchPriceDecrement;
        auction.sealedBidRevealTime = _sealedBidRevealTime;

        if (msg.value > creationFee) {
            (bool sent, ) = payable(msg.sender).call{value: msg.value - creationFee}("");
            require(sent, "Refund failed");
        }

        emit AuctionCreated(auctionId, msg.sender, _name, _auctionType, block.timestamp);
    }

    function placeBid(uint256 _auctionId, bytes32 _sealedBid) external payable {
        Auction storage auction = auctions[_auctionId];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(auction.tokenAddress == address(0), "Only ETH bids supported");

        if (auction.auctionType == AuctionType.ENGLISH) {
            require(msg.value >= auction.currentPrice + auction.minBidIncrement, "Bid too low");
            if (auction.maxPrice > 0) require(msg.value <= auction.maxPrice, "Bid exceeds max price");
            if (auction.bids[msg.sender] > 0) {
                (bool sent, ) = payable(msg.sender).call{value: auction.bids[msg.sender]}("");
                require(sent, "Refund failed");
            }
            auction.bidders.push(msg.sender);
            auction.bids[msg.sender] = msg.value;
            auction.currentPrice = msg.value;
        } else if (auction.auctionType == AuctionType.DUTCH) {
            uint256 currentDutchPrice = getDutchCurrentPrice(_auctionId);
            require(msg.value >= currentDutchPrice, "Bid too low");
            auction.bidders.push(msg.sender);
            auction.bids[msg.sender] = msg.value;
            auction.currentPrice = currentDutchPrice;
            auction.active = false;
        } else if (auction.auctionType == AuctionType.SEALED_BID) {
            require(block.timestamp < auction.sealedBidRevealTime, "Reveal period started");
            require(_sealedBid != bytes32(0), "Invalid sealed bid");
            auction.sealedBids[msg.sender] = _sealedBid;
            auction.bidders.push(msg.sender);
            auction.bids[msg.sender] = msg.value;
        } else if (auction.auctionType == AuctionType.TIME_BASED) {
            require(msg.value >= auction.minBidIncrement, "Bid too low");
            if (auction.bids[msg.sender] > 0) {
                (bool sent, ) = payable(msg.sender).call{value: auction.bids[msg.sender]}("");
                require(sent, "Refund failed");
            }
            auction.bidders.push(msg.sender);
            auction.bids[msg.sender] = msg.value;
            if (block.timestamp + 300 > auction.endTime) {
                auction.endTime = block.timestamp + 300;
            }
        } else if (auction.auctionType == AuctionType.CHARITY) {
            require(msg.value > 0, "Donation must be greater than 0");
            if (auction.bids[msg.sender] == 0) {
                auction.bidders.push(msg.sender);
            }
            auction.bids[msg.sender] += msg.value;
        }

        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }

    function revealSealedBid(uint256 _auctionId, uint256 _amount, bytes32 _secret) external {
        Auction storage auction = auctions[_auctionId];
        require(auction.auctionType == AuctionType.SEALED_BID, "Not a sealed bid auction");
        require(block.timestamp >= auction.sealedBidRevealTime, "Reveal period not started");
        require(block.timestamp < auction.endTime, "Auction ended");

        bytes32 sealedBid = keccak256(abi.encodePacked(_amount, _secret));
        require(sealedBid == auction.sealedBids[msg.sender], "Invalid bid reveal");
        require(_amount <= auction.bids[msg.sender], "Cannot reveal more than deposited");

        auction.bids[msg.sender] = _amount;
        if (_amount > auction.currentPrice) {
            auction.currentPrice = _amount;
        }
    }

    function endAuction(uint256 _auctionId) external onlyAuctionOwner(_auctionId) {
        Auction storage auction = auctions[_auctionId];
        require(auction.active, "Auction already ended");
        require(block.timestamp >= auction.endTime || auction.canCloseEarly, "Cannot end auction yet");
        require(address(rwaNFTContract) != address(0), "RWANFT not set");

        auction.active = false;
        address[] memory winners = new address[](auction.numWinners);
        uint256[] memory finalPrices = new uint256[](auction.numWinners);
        uint256 totalAmount = 0;

        if (auction.bidders.length > 0) {
            if (auction.auctionType == AuctionType.CHARITY) {
                address[] memory sortedBidders = sortBiddersByBid(_auctionId);
                uint256 winnerCount = auction.numWinners > sortedBidders.length ? sortedBidders.length : auction.numWinners;

                for (uint256 i = 0; i < winnerCount; i++) {
                    winners[i] = sortedBidders[i];
                    finalPrices[i] = auction.bids[sortedBidders[i]];
                    totalAmount += finalPrices[i];
                }
            } else {
                winners[0] = auction.bidders[auction.bidders.length - 1];
                finalPrices[0] = auction.bids[winners[0]];
                totalAmount = finalPrices[0];
            }

            uint256 commission = (totalAmount * commissionPercent) / 100;
            uint256 sellerAmount = totalAmount - commission;

            (bool commissionSent, ) = payable(owner()).call{value: commission}("");
            require(commissionSent, "Commission transfer failed");
            (bool sellerSent, ) = payable(auction.seller).call{value: sellerAmount}("");
            require(sellerSent, "Seller transfer failed");

            for (uint256 i = 0; i < winners.length && winners[i] != address(0); i++) {
                uint256 tokenId = rwaNFTContract.mintRWA(winners[i], _auctionId, auction.rwaTokenURI);
                emit RWANFTMinted(_auctionId, tokenId, winners[i]);
            }

            if (auction.auctionType != AuctionType.CHARITY) {
                for (uint256 i = 0; i < auction.bidders.length; i++) {
                    bool isWinner = false;
                    for (uint256 j = 0; j < winners.length; j++) {
                        if (auction.bidders[i] == winners[j]) {
                            isWinner = true;
                            break;
                        }
                    }
                    if (!isWinner && auction.bids[auction.bidders[i]] > 0) {
                        (bool sent, ) = payable(auction.bidders[i]).call{value: auction.bids[auction.bidders[i]]}("");
                        require(sent, "Refund failed");
                        auction.bids[auction.bidders[i]] = 0;
                    }
                }
            }
        }

        emit AuctionEnded(_auctionId, winners, finalPrices);
    }

    function getDutchCurrentPrice(uint256 _auctionId) public view returns (uint256) {
        Auction storage auction = auctions[_auctionId];
        if (auction.auctionType != AuctionType.DUTCH || !auction.active) return 0;
        uint256 timeElapsed = block.timestamp - auction.createdAt;
        uint256 priceDecrease = timeElapsed * auction.dutchPriceDecrement;
        return auction.startPrice > priceDecrease ? auction.startPrice - priceDecrease : 0;
    }

    function sortBiddersByBid(uint256 _auctionId) internal view returns (address[] memory) {
        Auction storage auction = auctions[_auctionId];
        address[] memory sorted = new address[](auction.bidders.length);
        for (uint256 i = 0; i < auction.bidders.length; i++) {
            sorted[i] = auction.bidders[i];
        }
        for (uint256 i = 0; i < sorted.length - 1; i++) {
            for (uint256 j = 0; j < sorted.length - i - 1; j++) {
                if (auction.bids[sorted[j]] < auction.bids[sorted[j + 1]]) {
                    (sorted[j], sorted[j + 1]) = (sorted[j + 1], sorted[j]);
                }
            }
        }
        return sorted;
    }

    function getAuctionCounter() external view returns (uint256) {
        return auctionIdCounter;
    }
}