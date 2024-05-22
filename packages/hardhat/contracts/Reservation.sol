// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

/////////////
///Imports///
/////////////

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

/// @title Reservation NFT's
/// @author @YanVictorSN
/// @notice You can use this contract to mint and set NFT's metadata for reservations.
contract Reservation is ERC721, ERC721URIStorage, Ownable {
	////////////////
	///Data Types///
	////////////////

	/// @notice This enum is used to define the status of a reservation
	enum Status {
		Created,
		Reserved,
		CheckIn,
		Canceled
	}

	/// @notice This struct is used to define an reservation ID and status for an reservation
	struct ReservationData {
		uint256 reservationId;
		uint256 reservationTimestamp;
		uint256 toleranceTime;
		uint256 reservationValue;
		bool reservationPayment;
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

	mapping(address => ReservationData[]) private reservationToken;
	mapping(uint256 => ReservationByDay[]) private reservationsByDay;

	////////////
	///Events///
	////////////

	event ReservationDataAdded(uint256 tokenId, address indexed to, uint256 reservationTimestamp, uint256 toleranceTime, uint256 reservationValue);

	event ReservationChecked(address indexed to, uint256 tokenId, Status status, uint256 timestamp);

	event ReservationCanceled(address indexed to, uint256 tokenId, Status status, uint256 timestamp);

	/////////////////
	///Constructor///
	/////////////////

	constructor() ERC721("Reserve", "RSV") Ownable() {}

	///////////////
	///Functions///
	///////////////

	//////////////
	///External///
	//////////////

	/// @notice This function is used to check all daily reservations
	function checkAllDailyReservation() external {
		if (reservationsByDay[getStartOfDayTimestamp(block.timestamp)].length > 0) {
			for (uint256 i = 0; i < reservationsByDay[getStartOfDayTimestamp(block.timestamp)].length; ++i) {
				ReservationByDay memory reservation = reservationsByDay[getStartOfDayTimestamp(block.timestamp)][i];
				checkDailyReservation(reservation.reservationId, reservation.userAddress);
			}
		}
	}

	////////////
	///Public///
	////////////

	/// @notice This function will mint a NFT, add an reservation on the array and set the metadata.
	/// @param minterAddress The address that will receive the NFT
	//@param tokenMetadata The metadata of the NFT
	/// @param reservationTimestamp The timestamp of the reservation
	/// @param reservationToleranceTime The tolerance time of the reservation
	/// @param reservationValue The value of the reservation
	function safeMint(
		address minterAddress,
		uint256 reservationTimestamp,
		uint256 reservationToleranceTime,
		uint256 reservationValue
	) public //string memory tokenMetadata
	{
		require(reservationTimestamp > block.timestamp, "Reservation timestamp must be in the future");
		require(reservationToleranceTime > 0, "Tolerance time must be greater than 0");
		require(reservationValue > 0, "Reservation value must be greater than 0");
		require(minterAddress != address(0), "Insert a valid address");
		uint256 tokenId = tokenIdCounter.current();
		tokenIdCounter.increment();
		uint256 finalToleranceTime = reservationTimestamp + reservationToleranceTime;
		//This line is only for test propuses, it will be removed when we set the marketplace
		//reservationToken[minterAddress][tokenId].status = Status.Reserved;
		_addReservation(tokenId, minterAddress, reservationTimestamp, finalToleranceTime, reservationValue);
		_safeMint(minterAddress, tokenId);
		_setTokenURI(tokenId, IpfsImage[0]);
	}

	/// @notice This function get the metadata of a NFT
	/// @param tokenId The identifier of the NFT
	/// @return The metadata of the NFT
	function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId);
	}

	/// @notice This function is used to check if a contract supports an interface
	/// @param interfaceId The interface identifier
	/// @return True if the interface is supported, false otherwise
	function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
		return super.supportsInterface(interfaceId);
	}

	/// @notice This function is used to check the daily reservations and modifies the status of each one
	/// @param tokenId The identifier of the NFT
	/// @param userAddress The address to be checked
	function checkDailyReservation(
		uint256 tokenId,
		address userAddress
	)
		public
		//string memory newTokenMetadata
		onlyOwner
	{
		require(reservationToken[userAddress].length > 0, "User don't have any reservation");

		ReservationData storage _reservation = reservationToken[userAddress][tokenId];

		// require(
		// 	_reservation.status == Status.Created,
		// 	"Token is not reserved yet"
		// );
		if (_reservation.toleranceTime < block.timestamp) {
			_reservation.status = Status.Canceled;
			_setTokenURI(tokenId, IpfsImage[2]);
			emit ReservationCanceled(userAddress, tokenId, Status.Canceled, block.timestamp);
			return;
		} else {
			_reservation.status = Status.CheckIn;
			_setTokenURI(tokenId, IpfsImage[1]);
			emit ReservationChecked(userAddress, tokenId, Status.CheckIn, block.timestamp);
		}
	}

	/// @notice This function is used to get the data of a token
	/// @param _userAddress The address of the user
	function getTokenData(address _userAddress) public view returns (ReservationData[] memory) {
		return reservationToken[_userAddress];
	}

	//////////////
	///Internal///
	//////////////

	/// @notice This function is used to burn a NFT
	/// @param tokenId The identifier of the NFT
	function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
		super._burn(tokenId);
	}

	/// @notice This function add an reservation to the ReservationData, set the status to Reserved and add the reservation to the daily reservations
	/// @param reservationId The identifier of the reservation
	/// @param userAddress The address of the user that purschased the reservation
	/// @param reservationTimestamp The timestamp of the reservation
	/// @param toleranceTime The tolerance time of the reservation
	/// @param reservationValue The value of the reservation
	function _addReservation(uint256 reservationId, address userAddress, uint256 reservationTimestamp, uint256 toleranceTime, uint256 reservationValue) internal {
		ReservationData memory newReservation = ReservationData(reservationId, reservationTimestamp, toleranceTime, reservationValue, false, Status.Created);

		reservationToken[userAddress].push(newReservation);
		uint256 reservationDay = getStartOfDayTimestamp(reservationTimestamp);

		ReservationByDay memory newReservationDay = ReservationByDay(reservationTimestamp, userAddress, reservationId);

		reservationsByDay[reservationDay].push(newReservationDay);
		emit ReservationDataAdded(reservationId, userAddress, reservationTimestamp, toleranceTime, reservationValue);
	}

	/// @notice This function is used to get the timestamp of start of the day
	/// @param _reservationTimestamp The timestamp of the reservation
	/// @return The timestamp of start of the day
	function getStartOfDayTimestamp(uint256 _reservationTimestamp) internal pure returns (uint256) {
		return _reservationTimestamp - (_reservationTimestamp % 86400);
	}

	///@notice This function is used to deposit the reservation value in the contract
	///@param reservationId The identifier of the reservation
	///@param userAddress The address of the user that rented the reservation
	function depositReservationValue(uint256 reservationId, address userAddress) public payable {
		ReservationData storage userReservation = reservationToken[msg.sender][reservationId];
		require(msg.sender == userAddress, "Only the reservation holder can deposit");
		require(msg.value == userReservation.reservationValue, "Deposit value must be equal to reservation value");
		require(!userReservation.reservationPayment, "Reservation already paid");
		userReservation.reservationPayment = true;
	}

	///@notice This function is used to refund the reservation value in the contract
	///@param reservationId The identifier of the reservation
	///@param userAddress The address of the user that rented the reservation
	function refundForNotCheckIn(uint256 reservationId, address userAddress) public {
		ReservationData storage userReservation = reservationToken[userAddress][reservationId];
		require(address(this).balance >= userReservation.reservationValue, "Insufficient balance");
		require(userReservation.status == Status.Canceled, "Reservation must be canceled");
		require(userReservation.reservationPayment, "Reservation must be paid to refund");
		payable(address(this)).transfer(userReservation.reservationValue);
	}

	/// @notice  This function is used to get the daily reservations
	/// @param _dayTimestamp The timestamp of the day
	/// @return The daily reservations
	function getReservationsByDay(uint256 _dayTimestamp) public view returns (ReservationByDay[] memory) {
		return reservationsByDay[_dayTimestamp];
	}

	// Essa função precisa ser implementada. O Marketplace usa ela para saber se está ativa a reserva e pode ser comercializada. O nome da função precisa ser o mesmo.
	function getDateMaxToTrade(uint256 _tokenId) public view returns (uint256) {
		return reservationToken[msg.sender][_tokenId].reservationTimestamp + 30 days;
	}
}
