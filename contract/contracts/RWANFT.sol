// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RWANFT is ERC721, ERC721URIStorage, Ownable {
    address public auctionHouse;
    mapping(uint256 => uint256) public auctionIds;
    mapping(uint256 => bool) public claimed;
    uint256 private nextTokenId;

    event RewardClaimed(uint256 indexed tokenId, address indexed winner);

    modifier onlyAuctionHouse() {
        require(msg.sender == auctionHouse, "Only auction house can mint");
        _;
    }

    constructor() ERC721("RWA NFT", "RWANFT") Ownable(msg.sender) {
        auctionHouse = address(0);
    }

    function setAuctionHouse(address _auctionHouse) external onlyOwner {
        require(_auctionHouse != address(0), "Invalid auction house address");
        require(auctionHouse == address(0), "Auction house already set");
        auctionHouse = _auctionHouse;
    }

    function mintRWA(address _winner, uint256 _auctionId, string memory _tokenURI) 
        external 
        onlyAuctionHouse 
        returns (uint256) 
    {
        require(_winner != address(0), "Invalid winner address");
        uint256 newTokenId = nextTokenId++;
        _mint(_winner, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        auctionIds[newTokenId] = _auctionId;
        return newTokenId;
    }

    function claimReward(uint256 _tokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "Not token owner");
        require(!claimed[_tokenId], "Reward already claimed");
        claimed[_tokenId] = true;
        emit RewardClaimed(_tokenId, msg.sender);
    }

    function updateTokenURI(uint256 _tokenId, string memory _newTokenURI) external onlyOwner {
        require(ownerOf(_tokenId) != address(0), "Token does not exist");
        _setTokenURI(_tokenId, _newTokenURI);
    }

    function getAuctionId(uint256 _tokenId) external view returns (uint256) {
        require(ownerOf(_tokenId) != address(0), "Token does not exist");
        return auctionIds[_tokenId];
    }

    function isClaimed(uint256 _tokenId) external view returns (bool) {
        require(ownerOf(_tokenId) != address(0), "Token does not exist");
        return claimed[_tokenId];
    }

    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}