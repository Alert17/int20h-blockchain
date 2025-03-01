// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RWANFT.sol";


contract NeverHold is Ownable {
    

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
    }

    uint256 private auctionIdCounter;
    mapping(uint256 => Auction) public auctions;
    uint256 public creationFee;
    uint256 public commissionPercent;
    RWANFT public rwaNFTContract;

    event AuctionCreated(uint256 indexed auctionId, address indexed seller, string name, AuctionType auctionType, uint256 createdAt);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed auctionId, address winner, uint256 finalPrice);
    event CommissionUpdated(uint256 newCreationFee, uint256 newCommissionPercent);

    modifier onlyAuctionOwner(uint256 _auctionId) {
        require(msg.sender == auctions[_auctionId].seller, "Only auction owner can call this");
        _;
    }

    constructor(address _rwaNFTAddress) {
        rwaNFTContract = RWANFT(_rwaNFTAddress);
    }

    function setCommission(uint256 _creationFee, uint256 _commissionPercent) external onlyOwner {
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
        string memory _rwaTokenURI
    ) external payable {
        require(msg.value >= creationFee, "Insufficient creation fee");
        auctionIdCounter.increment();
        uint256 auctionId = auctionIdCounter.current();
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
        emit AuctionCreated(auctionId, msg.sender, _name, _auctionType, block.timestamp);
    }

    function endAuction(uint256 _auctionId) external onlyAuctionOwner(_auctionId) {
        Auction storage auction = auctions[_auctionId];
        require(auction.active, "Auction already ended");
        require(block.timestamp >= auction.endTime || auction.canCloseEarly, "Cannot end auction yet");
        
        auction.active = false;
        address winner;
        uint256 finalPrice;
        if (auction.bidders.length > 0) {
            winner = auction.bidders[auction.bidders.length - 1];
            finalPrice = auction.bids[winner];
            uint256 commission = (finalPrice * commissionPercent) / 100;
            IERC20(auction.tokenAddress).transfer(auction.seller, finalPrice - commission);
            IERC20(auction.tokenAddress).transfer(owner(), commission);
            if (auction.isRWA) {
                rwaNFTContract.mintRWA(winner, _auctionId, auction.rwaTokenURI);
            } else if (auction.isERC721) {
                IERC721(auction.rewardToken).safeTransferFrom(address(this), winner, auction.rewardTokenId);
            } else if (auction.isERC1155) {
                IERC1155(auction.rewardToken).safeTransferFrom(address(this), winner, auction.rewardTokenId, auction.rewardAmount, "");
            } else {
                IERC20(auction.rewardToken).transfer(winner, auction.rewardAmount);
            }
        }
        emit AuctionEnded(_auctionId, winner, finalPrice);
    }
}
