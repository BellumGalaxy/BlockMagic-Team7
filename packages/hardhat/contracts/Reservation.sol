// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Reservation is ERC721, Ownable {
	uint256 private _nextTokenId;

	mapping(address => uint) public confirmationrRating;
	struct NftData {
		bool paid;
		uint safeGuardValue;
		uint dateMaxToTrade;
	}
	mapping(uint256 => NftData) public nftData;

	constructor(address initialOwner) ERC721("MyToken", "MTK") Ownable() {}

	function safeMint(
		uint _safeGuardValue,
		uint _dateMaxToTrade
	) public returns (uint256) {
		uint256 tokenId = _nextTokenId++;
		_safeMint(msg.sender, tokenId);
		nftData[tokenId] = NftData(false, _safeGuardValue, _dateMaxToTrade);

		return tokenId;
	}

	function getDateMaxToTrade(uint256 tokenId) public view returns (uint) {
		return nftData[tokenId].dateMaxToTrade;
	}

	function confirmTransaction(uint256 tokenId) public {
		require(ownerOf(tokenId) == msg.sender, "Only token owner can confirm");
		confirmationrRating[msg.sender]++;
	}
}
