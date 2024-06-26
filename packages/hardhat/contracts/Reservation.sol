// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;
import "hardhat/console.sol";

/////////////
///Imports///
/////////////

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Counters } from "@openzeppelin/contracts/utils/Counters.sol";
import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/// @title Reservation NFT's
/// @author @YanVictorSN
/// @notice You can use this contract to mint and set NFT's metadata for reservations.
contract Reservation is ERC721, ERC721URIStorage, Ownable, FunctionsClient {
	using FunctionsRequest for FunctionsRequest.Request;

	// State variables to store the last request ID, response, and error
	bytes32 public s_lastRequestId;
	bytes public s_lastResponse;
	bytes public s_lastError;

	// Custom error type
	error UnexpectedRequestID(bytes32 requestId);

	// Event to log responses
	event Response(
		bytes32 indexed requestId,
		string character,
		bytes response,
		bytes err
	);

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

	address router = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
	uint64 subscriptionId = 3000;
	string public character;
	uint32 gasLimit = 300000;

	bytes32 donID =
		0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

	string[] private IpfsImage = [
		"https://bafybeiazphqjm6gaplxtgxptjyhk3qau2w5vg2sijwpijtq6gtmkikhzxe.ipfs.w3s.link/RestaurantReservation.json",
		"https://bafybeiafomlk5ebetu4dqjmxz2qp2xze6xcgir3v3nd2xlz3d2hjce2xcu.ipfs.w3s.link/RestauranReservationCheckedIn.json",
		"https://bafybeiab3idohdokghdzmjapoyee3haoylhiuaekpf6s4gvpm6dtxioanq.ipfs.w3s.link/RestaurantReservantionCanceled.json"
	];

	string source =
		"const reservationId = args[0];"
		"const reservationTimestamp = args[1];"
		"const tableNumber = args[2];"
		"const reservationDate = args[3];"
		"const apiResponse = await Functions.makeHttpRequest({"
		"url: `https://linkatable-yanvictorsns-projects.vercel.app/api/reservationsById?id=${reservationId}&reservationTimestamp=${reservationTimestamp}&tableNumber=${tableNumber}&reservationDate=${reservationDate}`"
		"});"
		"if (apiResponse.error) {"
		"console.error(apiResponse.error);"
		"throw new Error('Request failed');"
		"}"
		"const { data } = apiResponse;"
		"console.log('API response data:', JSON.stringify(data, null, 2));"
		"const encodedTimestamp = Functions.encodeString(data.reservationTimestamp);"
		"const encodedTableNumber = Functions.encodeString(data.reservationTableNumber);"
		"return encodedTimestamp";

	mapping(address => ReservationData[]) private reservationToken;
	mapping(uint256 => ReservationByDay[]) private reservationsByDay;

	////////////
	///Events///
	////////////

	event ReservationDataAdded(
		uint256 tokenId,
		address indexed to,
		uint256 reservationTimestamp,
		uint256 toleranceTime,
		uint256 reservationValue
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

	constructor() ERC721("Reserve", "RSV") Ownable() FunctionsClient(router) {}

	///////////////
	///Functions///
	///////////////

	//////////////
	///External///
	//////////////

	/// @notice This function is used to check all daily reservations
	function checkAllDailyReservation() external onlyOwner {
		if (
			reservationsByDay[getStartOfDayTimestamp(block.timestamp)].length >
			0
		) {
			for (
				uint256 i = 0;
				i <
				reservationsByDay[getStartOfDayTimestamp(block.timestamp)]
					.length;
				++i
			) {
				ReservationByDay memory reservation = reservationsByDay[
					getStartOfDayTimestamp(block.timestamp)
				][i];
				checkDailyReservation(
					reservation.reservationId,
					reservation.userAddress
				);
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
		uint256 reservationValue //string memory tokenMetadata //onlyOwner
	) external payable {
		require(
			reservationTimestamp > block.timestamp,
			"Reservation timestamp must be in the future"
		);
		require(
			msg.value >= reservationValue,
			"Insufficient funds to cover minting price"
		);
		require(
			reservationToleranceTime > 0,
			"Tolerance time must be greater than 0"
		);
		require(
			reservationValue > 0,
			"Reservation value must be greater than 0"
		);
		require(minterAddress != address(0), "Insert a valid address");
		uint256 tokenId = tokenIdCounter.current();
		tokenIdCounter.increment();
		uint256 finalToleranceTime = reservationTimestamp +
			reservationToleranceTime;
		//This line is only for test propuses, it will be removed when we set the marketplace
		//reservationToken[minterAddress][tokenId].status = Status.Reserved;
		_addReservation(
			tokenId,
			minterAddress,
			reservationTimestamp,
			finalToleranceTime,
			reservationValue
		);
		_safeMint(minterAddress, tokenId);
		_setTokenURI(tokenId, IpfsImage[0]);
	}

	/**
	 * @notice Sends an HTTP request for character information
	 * @param args The arguments to pass to the HTTP request
	 * @return requestId The ID of the request
	 */
	function sendRequest(
		string[] calldata args
	) external returns (bytes32 requestId) {
		FunctionsRequest.Request memory req;
		req.initializeRequestForInlineJavaScript(source); // Initialize the request with JS code
		if (args.length > 0) req.setArgs(args); // Set the arguments for the request

		// Send the request and store the request ID
		s_lastRequestId = _sendRequest(
			req.encodeCBOR(),
			subscriptionId,
			gasLimit,
			donID
		);

		return s_lastRequestId;
	}

	/**
	 * @notice Callback function for fulfilling a request
	 * @param requestId The ID of the request to fulfill
	 * @param response The HTTP response data
	 * @param err Any errors from the Functions request
	 */
	function fulfillRequest(
		bytes32 requestId,
		bytes memory response,
		bytes memory err
	) internal override {
		if (s_lastRequestId != requestId) {
			revert UnexpectedRequestID(requestId); // Check if request IDs match
		}
		// Update the contract's state variables with the response and any errors
		s_lastResponse = response;
		character = string(response);
		s_lastError = err;

		// Emit an event to log the response
		emit Response(requestId, character, s_lastResponse, s_lastError);
	}

	/// @notice This function get the metadata of a NFT
	/// @param tokenId The identifier of the NFT
	/// @return The metadata of the NFT
	function tokenURI(
		uint256 tokenId
	) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId);
	}

	function tokenURIs(
		uint256[] memory tokenIds
	) public view returns (string[] memory) {
		string[] memory uris = new string[](tokenIds.length);

		for (uint256 i = 0; i < tokenIds.length; i++) {
			uris[i] = tokenURI(tokenIds[i]);
		}

		return uris;
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
	/// @param userAddress The address to be checked
	function checkDailyReservation(
		uint256 tokenId,
		address userAddress //string memory newTokenMetadata //onlyOwner
	) public {
		require(
			reservationToken[userAddress].length > 0,
			"User don't have any reservation"
		);

		ReservationData storage _reservation = reservationToken[userAddress][
			tokenId
		];
		if (_reservation.toleranceTime < block.timestamp) {
			_cancelReservation(_reservation, tokenId, userAddress);
			return;
		} else {
			_confirmCheckIn(_reservation, tokenId, userAddress);
		}
	}

	function _cancelReservation(
		ReservationData storage _reservation,
		uint256 tokenId,
		address userAddress
	) internal {
		_reservation.status = Status.Canceled;
		_setTokenURI(tokenId, IpfsImage[2]);
		///refundForNotCheckIn(tokenId, userAddress);
		emit ReservationCanceled(
			userAddress,
			tokenId,
			Status.Canceled,
			block.timestamp
		);
	}

	function _confirmCheckIn(
		ReservationData storage _reservation,
		uint256 tokenId,
		address userAddress
	) internal {
		_reservation.status = Status.CheckIn;
		_setTokenURI(tokenId, IpfsImage[1]);
		emit ReservationChecked(
			userAddress,
			tokenId,
			Status.CheckIn,
			block.timestamp
		);
	}

	/// @notice This function is used to get the data of a token
	/// @param _userAddress The address of the user
	function getTokenData(
		address _userAddress
	) public view returns (ReservationData[] memory) {
		return reservationToken[_userAddress];
	}

	//////////////
	///Internal///
	//////////////

	/// @notice This function is used to burn a NFT
	/// @param tokenId The identifier of the NFT
	function _burn(
		uint256 tokenId
	) internal override(ERC721, ERC721URIStorage) {
		super._burn(tokenId);
	}

	/// @notice This function add an reservation to the ReservationData, set the status to Reserved and add the reservation to the daily reservations
	/// @param reservationId The identifier of the reservation
	/// @param userAddress The address of the user that purschased the reservation
	/// @param reservationTimestamp The timestamp of the reservation
	/// @param toleranceTime The tolerance time of the reservation
	/// @param reservationValue The value of the reservation
	function _addReservation(
		uint256 reservationId,
		address userAddress,
		uint256 reservationTimestamp,
		uint256 toleranceTime,
		uint256 reservationValue
	) internal {
		ReservationData memory newReservation = ReservationData(
			reservationId,
			reservationTimestamp,
			toleranceTime,
			reservationValue,
			false,
			Status.Reserved
		);

		reservationToken[userAddress].push(newReservation);
		uint256 reservationDay = getStartOfDayTimestamp(reservationTimestamp);

		ReservationByDay memory newReservationDay = ReservationByDay(
			reservationTimestamp,
			userAddress,
			reservationId
		);

		reservationsByDay[reservationDay].push(newReservationDay);
		emit ReservationDataAdded(
			reservationId,
			userAddress,
			reservationTimestamp,
			toleranceTime,
			reservationValue
		);
	}

	/// @notice This function is used to get the timestamp of start of the day
	/// @param _reservationTimestamp The timestamp of the reservation
	/// @return The timestamp of start of the day
	function getStartOfDayTimestamp(
		uint256 _reservationTimestamp
	) public pure returns (uint256) {
		return _reservationTimestamp - (_reservationTimestamp % 86400);
	}

	///@notice This function is used to deposit the reservation value in the contract
	///@param reservationId The identifier of the reservation
	///@param userAddress The address of the user that rented the reservation
	function depositReservationValue(
		uint256 reservationId,
		address userAddress
	) public payable {
		ReservationData storage userReservation = reservationToken[msg.sender][
			reservationId
		];
		require(
			msg.sender == userAddress,
			"Only the reservation holder can deposit"
		);
		require(
			msg.value == userReservation.reservationValue,
			"Deposit value must be equal to reservation value"
		);
		require(
			!userReservation.reservationPayment,
			"Reservation already paid"
		);
		userReservation.reservationPayment = true;
	}

	///@notice This function is used to refund the reservation value in the contract
	///@param reservationId The identifier of the reservation
	///@param userAddress The address of the user that rented the reservation
	function refundForNotCheckIn(
		uint256 reservationId,
		address userAddress
	) public {
		ReservationData storage userReservation = reservationToken[userAddress][
			reservationId
		];
		require(
			address(this).balance >= userReservation.reservationValue,
			"Insufficient balance"
		);
		require(
			userReservation.status == Status.Canceled,
			"Reservation must be canceled"
		);
		require(
			userReservation.reservationPayment,
			"Reservation must be paid to refund"
		);
		payable(address(this)).transfer(userReservation.reservationValue);
	}

	/// @notice  This function is used to get the daily reservations
	/// @param _dayTimestamp The timestamp of the day
	/// @return The daily reservations
	function getReservationsByDay(
		uint256 _dayTimestamp
	) public view returns (ReservationByDay[] memory) {
		return reservationsByDay[_dayTimestamp];
	}

	function getReservations(
		address _userAddress
	) public view returns (ReservationData[] memory) {
		return reservationToken[_userAddress];
	}

	function getDateMaxToTrade(uint256 _tokenId) public view returns (uint256) {
		return
			reservationToken[msg.sender][_tokenId].reservationTimestamp +
			30 days;
	}

	/// @notice This function returns an array of reservation tokens for an array of addresses
	/// @param addresses The array of addresses to query
	/// @return An array of reservation tokens corresponding to the addresses
	function getReservationTokensByAddresses(
		address[] calldata addresses
	) public view returns (ReservationData[][] memory) {
		ReservationData[][] memory reservations = new ReservationData[][](
			addresses.length
		);

		for (uint256 i = 0; i < addresses.length; i++) {
			reservations[i] = reservationToken[addresses[i]];
		}

		return reservations;
	}
}
