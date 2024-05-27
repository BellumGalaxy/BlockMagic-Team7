// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

/////////////
///Imports///
/////////////

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Reservation.sol";

/// @title Reservation MarketPlace
/// @author @cesarsst && @YanVictorSN
/// @notice This contract is a marketplace for the Reservation NFTs
contract ReservationMarketplace is Ownable, IERC721Receiver, ReentrancyGuard {
	////////////////
	///Data Types///
	////////////////

	///@notice Represents a listing of an NFT
	struct Listing {
		address payable seller;
		uint tokenId;
		uint price;
		uint dateMaxToSell; // max date to sell the NFT
	}

	///////////////
	///Variables///
	///////////////

	using EnumerableSet for EnumerableSet.UintSet;

	Reservation public nftContract;

	mapping(uint => Listing) public listings;
	mapping(address => EnumerableSet.UintSet) private sellerListings;
	mapping(address => uint) public sellerRating;
	uint public totalFeeValueAccumulated = 0;

	// Fee values by rating
	uint public defaultFee = 5; // default fee for unrated sellers
	uint256[6] public feesReduction = [10, 20, 30, 40, 50]; // [default, oneStar 10%, twoStar 20%, threeStar 30%, fourStar 40%, fiveStar 50%];

	////////////
	///Events///
	////////////

	event NFTListed(uint indexed tokenId, address indexed seller, uint price);
	event NFTSold(
		uint indexed tokenId,
		address indexed seller,
		address indexed buyer,
		uint price,
		uint fee
	);
	event NFTUnlisted(uint indexed tokenId);

	/////////////////
	///Constructor///
	/////////////////

	constructor(address _nftContract) {
		nftContract = Reservation(_nftContract);
	}

	///////////////
	///Functions///
	///////////////

	//////////////
	///External///
	//////////////
	/**
	 * @dev Buy an NFT listed for sale
	 * @param _tokenId  The ID of the token being bought
	 */
	function buyNFT(uint _tokenId) external payable nonReentrant {
		Listing memory listing = listings[_tokenId];

		require(listing.seller != address(0), "Token not listed");
		require(msg.value >= listing.price, "Insufficient payment");
		require(block.timestamp <= listing.dateMaxToSell, "Listing expired");
		require(msg.sender != listing.seller, "Seller cannot buy own token");

		address payable seller = payable(listing.seller);
		uint256 price = listing.price;

		// Transfer token to buyer
		nftContract.safeTransferFrom(
			address(this),
			msg.sender,
			listing.tokenId
		);

		// Clear listing
		delete listings[_tokenId];
		sellerListings[seller].remove(_tokenId);

		// Transfer payment to seller
		uint256 valueToSend = getValueWithFeeApplied(seller, price); // maybe this function need to be at the NFT contract
		uint256 fee = price - valueToSend;
		totalFeeValueAccumulated += fee; // fee value accumulated for the marketplace owner

		payable(owner()).transfer(fee); // transfer the fee to the marketplace owner
		payable(seller).transfer(valueToSend);

		emit NFTSold(_tokenId, seller, msg.sender, price, price - valueToSend);
	}

	/**
	 * @dev Unlist an NFT listed for sale
	 * @param _tokenId The ID of the token being unlisted
	 */
	function unlistNFT(uint _tokenId) external {
		require(listings[_tokenId].seller == msg.sender, "Not the seller");

		delete listings[_tokenId];
		sellerListings[msg.sender].remove(_tokenId);
		nftContract.safeTransferFrom(address(this), msg.sender, _tokenId);

		emit NFTUnlisted(_tokenId);
	}

	/**
	 * @dev Get all listings by seller
	 * @param _seller The seller address
	 */
	function getAllListingsBySeller(
		address _seller
	) external view returns (uint256[] memory) {
		uint256[] memory result = new uint256[](
			sellerListings[_seller].length()
		);
		for (uint256 i = 0; i < sellerListings[_seller].length(); ++i) {
			result[i] = sellerListings[_seller].at(i);
		}
		return result;
	}

	///@dev Get all active listings by seller, i.e. listings that have not expired
	///@param _seller The seller address
	function getAllActiveListingsBySeller(
		address _seller
	) external view returns (uint[] memory) {
		uint256[] memory result = new uint256[](
			sellerListings[_seller].length()
		);
		uint256 count = 0;
		for (uint256 i = 0; i < sellerListings[_seller].length(); i++) {
			uint256 tokenId = sellerListings[_seller].at(i);
			if (listings[tokenId].dateMaxToSell > block.timestamp) {
				result[count] = tokenId;
				count++;
			}
		}
		return result;
	}

	///@notice Withdraw the accumulated fee value and send to the owner
	function withdraw() external onlyOwner {
		payable(owner()).transfer(address(this).balance);
	}

	///@notice ERC721 token receiver function
	function onERC721Received(
		address,
		address,
		uint,
		bytes memory
	) external virtual override returns (bytes4) {
		return this.onERC721Received.selector;
	}

	////////////
	///Public///
	////////////

	/**
	 * @dev List an NFT for sale and transferring token ownership to the marketplace contract
	 * @param _tokenId The ID of the token being listed for sale
	 * @param _price The price at which the token is listed for sale
	 */
	function listNFT(uint _tokenId, uint _price) public payable nonReentrant {
		require(
			nftContract.ownerOf(_tokenId) == msg.sender,
			"Only token owner can list"
		);
		require(
			listings[_tokenId].seller == address(0),
			"Token already listed"
		);
		require(_price > 0, "Price must be greater than zero");
		require(
			nftContract.isApprovedForAll(msg.sender, address(this)) == true,
			"Marketplace not approved to transfer token"
		);
		uint256 tokenDateMaxToSell = nftContract.getDateMaxToTrade(_tokenId);
		require(
			tokenDateMaxToSell < block.timestamp,
			"Token can't be traded anymore"
		);

		listings[_tokenId] = Listing({
			seller: payable(msg.sender),
			tokenId: _tokenId,
			price: _price,
			dateMaxToSell: tokenDateMaxToSell // 30 days to sell the NFT
		});

		sellerListings[msg.sender].add(_tokenId);

		nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);

		emit NFTListed(_tokenId, msg.sender, _price);
	}

	/**
	 * @dev Get the value of a payment with the fee applied
	 * @param seller The seller address
	 * @param price The price of the NFT
	 */
	function getValueWithFeeApplied(
		address seller,
		uint256 price
	) public view returns (uint256) {
		// get the ratting by nft contract
		// uint sellerRating = contractNFT.getSellerRating(seller);
		uint256 rating = sellerRating[seller]; // maybe this function need to be at the NFT contract

		if (rating > 0) {
			return price - ((price * feesReduction[rating]) / 100);
		} else {
			return price - ((price * defaultFee) / 100);
		}
	}
}
