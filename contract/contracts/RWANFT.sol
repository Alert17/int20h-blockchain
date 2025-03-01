// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RWANFT is ERC721URIStorage, Ownable {
    address public auctionHouse;

    struct NFTMetadata {
        uint256 auctionId;
        string tokenURI;
    }

    mapping(uint256 => NFTMetadata) public nftData;
    uint256 private nextTokenId;

    modifier onlyAuctionHouse() {
        require(msg.sender == auctionHouse, "Only auction house can mint");
        _;
    }

    constructor(address _auctionHouse) ERC721("RWA NFT", "RWANFT") Ownable(msg.sender) {
        auctionHouse = _auctionHouse;
    }

    function setAuctionHouse(address _auctionHouse) external onlyOwner {
        auctionHouse = _auctionHouse;
    }

    function mintRWA(address _winner, uint256 _auctionId, string memory _tokenURI) external onlyAuctionHouse returns (uint256) {
        uint256 newTokenId = nextTokenId++;
        _mint(_winner, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        nftData[newTokenId] = NFTMetadata({ auctionId: _auctionId, tokenURI: _tokenURI });
        return newTokenId;
    }

    function updateTokenURI(uint256 _tokenId, string memory _newTokenURI) external onlyOwner {
        _setTokenURI(_tokenId, _newTokenURI);
        nftData[_tokenId].tokenURI = _newTokenURI;
    }

    function getAuctionId(uint256 _tokenId) external view returns (uint256) {
        return nftData[_tokenId].auctionId;
    }
}
