// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

/////////////
///Imports///
/////////////

import { Reservation } from "./Reservation.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Reservation Factory
/// @author @YanVictorSN
/// @notice This contract is a factory for the Reservation NFTs
contract ReservationFactory is Ownable {
	////////////////
	///Data Types///
	////////////////

	struct ReservationContract {
		address companyAddress;
		address contractAddress;
	}

	///////////////
	///Variables///
	///////////////

	mapping(address => ReservationContract) public deployedContracts;
	address[] public allContracts;

	////////////
	///Events///
	////////////

	event ReservationContractDeployed(
		address indexed contractAddress,
		address indexed companyAddress
	);

	event ReservationContractRevoked(
		address indexed contractAddress,
		address indexed companyAddress
	);

	///////////////
	///Functions///
	///////////////

	////////////
	///Public///
	////////////

	///@notice Creates a new Reservation contract for each company
	function createReservationContract() public {
		Reservation newReservationContract = new Reservation();
		address contractAddress = address(newReservationContract);

		deployedContracts[contractAddress] = ReservationContract({
			companyAddress: msg.sender,
			contractAddress: contractAddress
		});
		allContracts.push(contractAddress);

		emit ReservationContractDeployed(msg.sender, contractAddress);
	}

	/// @notice Revokes a deployed reservation contract
	/// @param contractAddress The address of the contract to revoke
	function revokeReservationContract(
		address contractAddress
	) public onlyOwner {
		require(
			deployedContracts[contractAddress].contractAddress != address(0),
			"Contract does not exist"
		);

		address companyAddress = deployedContracts[contractAddress]
			.companyAddress;
		delete deployedContracts[contractAddress];
		removeContractFromArray(contractAddress);

		emit ReservationContractRevoked(contractAddress, companyAddress);
	}

	///@notice Returns all contracts deployed
	function getAllContracts() public view returns (address[] memory) {
		return allContracts;
	}

	/////////////
	///Private///
	/////////////

	/// @notice Helper function to remove a contract address from the array
	/// @param contractAddress The address of the contract to remove
	function removeContractFromArray(address contractAddress) private {
		uint256 length = allContracts.length;
		for (uint256 i = 0; i < length; i++) {
			if (allContracts[i] == contractAddress) {
				allContracts[i] = allContracts[length - 1];
				allContracts.pop();
				break;
			}
		}
	}
}
