// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

/////////////
///Imports///
/////////////

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Counters } from "@openzeppelin/contracts/utils/Counters.sol";
import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

/// @title Reservation NFT's
/// @author @YanVictorSN
/// @notice You can use this contract to mint and set NFT's metadata for reservations.
contract Reservation is
	ERC721,
	ERC721URIStorage,
	Ownable,
	AutomationCompatibleInterface
{
	////////////////
	///Data Types///
	////////////////

	/// @notice This enum is used to define the status of a reservation
	enum Status {
		Reserved,
		CheckIn,
		Canceled
	}

	/// @notice This struct is used to define an reservation ID and status for an reservation
	struct ReservationData {
		uint256 reservationId;
		uint256 reservationTimestamp;
		Status status;
	}

	/// @notice This struct is used to define an reservation ID and status for an reservation
	struct ReservationByDay {
		uint256 reservationTimestamp;
		address userAddress;
		uint256 reservationId;
	}

	///////////////
	///Variables///
	///////////////

	using Counters for Counters.Counter;

	Counters.Counter private tokenIdCounter;

	string[] private IpfsImage = [
		"https://bafybeiazphqjm6gaplxtgxptjyhk3qau2w5vg2sijwpijtq6gtmkikhzxe.ipfs.w3s.link/RestaurantReservation.json",
		"https://bafybeiafomlk5ebetu4dqjmxz2qp2xze6xcgir3v3nd2xlz3d2hjce2xcu.ipfs.w3s.link/RestauranReservationCheckedIn.json",
		"https://bafybeiab3idohdokghdzmjapoyee3haoylhiuaekpf6s4gvpm6dtxioanq.ipfs.w3s.link/RestaurantReservantionCanceled.json"
	];

	mapping(address userData => ReservationData[]) private reservationToken;
	mapping(uint256 => ReservationByDay[]) private reservationsByDay;

	////////////
	///Events///
	////////////

	event ReservationDataAdded(
		address indexed to,
		uint256 reservationTimestamp,
		uint256 tokenId
	);

	event ReservationChecked(
		address indexed to,
		uint256 tokenId,
		Status status,
		uint256 timestamp
	);

	event ReservationCanceled(
		address indexed to,
		uint256 tokenId,
		Status status,
		uint256 timestamp
	);

	/////////////////
	///Constructor///
	/////////////////

	constructor() ERC721("Reserve", "RSV") Ownable() {}

	///////////////
	///Functions///
	///////////////

	function checkUpkeep(
		bytes calldata checkData
	) external override returns (bool upkeepNeeded, bytes memory performData) {}

	function performUpkeep(bytes calldata performData) external override {}

	/// @notice This function will mint a NFT, add an reservation on the array and set the metadata.
	/// @param to The address that will receive the NFT
	//@param tokenMetadata The metadata of the NFT
	function safeMint(
		address to,
		uint256 reservationTimestamp
	)
		public
		//string memory tokenMetadata
		onlyOwner
	{
		uint256 tokenId = tokenIdCounter.current();
		tokenIdCounter.increment();
		addReservation(to, reservationTimestamp, tokenId);
		_safeMint(to, tokenId);
		_setTokenURI(tokenId, IpfsImage[0]);
	}

	/// @notice This function get the metadata of a NFT
	/// @param tokenId The identifier of the NFT
	/// @return The metadata of the NFT
	function tokenURI(
		uint256 tokenId
	) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId);
	}

	/// @notice This function is used to check if a contract supports an interface
	/// @param interfaceId The interface identifier
	/// @return True if the interface is supported, false otherwise
	function supportsInterface(
		bytes4 interfaceId
	) public view override(ERC721, ERC721URIStorage) returns (bool) {
		return super.supportsInterface(interfaceId);
	}

	/// @notice This function is used to check the daily reservations and modifies the status of each one
	/// @param tokenId The identifier of the NFT
	/// @param addressCheckedIn The address to be checked in
	function checkDailyReservation(
		uint256 tokenId,
		address addressCheckedIn
	)
		public
		//string memory newTokenMetadata
		onlyOwner
	{
		require(
			reservationToken[addressCheckedIn].length > 0,
			"User don't have any reservation"
		);
		if (
			reservationToken[addressCheckedIn][tokenId].reservationTimestamp >
			block.timestamp &&
			reservationToken[addressCheckedIn][tokenId].status ==
			Status.Reserved
		) {
			reservationToken[addressCheckedIn][tokenId].status = Status
				.Canceled;
			_setTokenURI(tokenId, IpfsImage[2]);
			emit ReservationCanceled(
				addressCheckedIn,
				tokenId,
				Status.Canceled,
				block.timestamp
			);
			return;
		} else {
			reservationToken[addressCheckedIn][tokenId].status = Status.CheckIn;
			_setTokenURI(tokenId, IpfsImage[1]);
			emit ReservationChecked(
				addressCheckedIn,
				tokenId,
				Status.CheckIn,
				block.timestamp
			);
		}
	}

	/// @notice This function is used to get the data of a token
	/// @param _userAddress The address of the user
	function getTokenData(
		address _userAddress
	) public view returns (ReservationData[] memory) {
		return reservationToken[_userAddress];
	}

	/// @notice This function is used to burn a NFT
	/// @param tokenId The identifier of the NFT
	function _burn(
		uint256 tokenId
	) internal override(ERC721, ERC721URIStorage) {
		super._burn(tokenId);
	}

	/// @notice This function add an reservation to the ReservationData, set the status to Reserved and add the reservation to the daily reservations
	/// @param userAddress The address of the user that purschased the reservation
	/// @param reservationTimestamp The timestamp of the reservation
	/// @param reservationId The identifier of the reservation
	function addReservation(
		address userAddress,
		uint256 reservationTimestamp,
		uint256 reservationId
	) internal {
		ReservationData memory newReservation = ReservationData(
			reservationId,
			reservationTimestamp,
			Status.Reserved
		);

		reservationToken[userAddress].push(newReservation);
		uint256 reservationDay = getStartOfDay(reservationTimestamp);

		ReservationByDay memory newReservationDay = ReservationByDay(
			reservationTimestamp,
			userAddress,
			reservationId
		);

		reservationsByDay[reservationDay].push(newReservationDay);
		emit ReservationDataAdded(
			userAddress,
			reservationTimestamp,
			reservationId
		);
	}

	/// @notice  This function is used to get the daily reservations
	/// @param _dayTimestamp The timestamp of the day
	function getReservationsByDay(
		uint256 _dayTimestamp
	) public view returns (ReservationByDay[] memory) {
		return reservationsByDay[_dayTimestamp];
	}

	/// @notice This function is used to get the start of the day
	/// @param _timestamp The timestamp of the reservation
	function getStartOfDay(uint256 _timestamp) internal pure returns (uint256) {
		return _timestamp - (_timestamp % 86400);
	}
}
