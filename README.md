# BlockMagic-Team7

<p align="center"> Chainlink BlockMagic Hackathon </p>

### Links
- Pich: https://www.youtube.com/watch?v=Q6yaRfGJtPk
- Demo: linkatable-yanvictorsns-projects.vercel.app

### Summary

# Link a Table Documentation for ChainLink Hackathon

## Problem

Restaurants make reservations to avoid leaving seats empty, which compromises their earnings.

However, reservations, especially when canceled, cause even more trouble for owners, who waste time and money waiting for a customer who doesn't show up.

## Solution

With Link a Table, the user can pay for a temporary reservation at an establishment.

If they arrive at the agreed-upon time, they check in and get their money back.

If they don't show up, the restaurant keeps the amount.

## How does it work?

### Consumer Path - Making the reservation

1. **Login/Wallet:** The user logs into the Link a Table app using their digital wallet.
2. **Restaurant Selection:** Browse the list of available restaurants and select the one where you want to make a reservation.
3. **Date and Time Selection:** Choose the desired date and time for the reservation.
4. **NFT Minting:** An NFT is minted for the reservation, containing the reservation amount. This NFT represents the user's financial commitment to the restaurant.

   - At the time of NFT minting, we make a call with ChainLink Functions to the database to check if the reservation is available. If it is, we can create an NFT for that specific time by modifying the NFT's metadata.

5. **Check-in at the Establishment:** Upon arriving at the restaurant at the reserved time, the user checks in by scanning a QR code at the location.
6. **Validated NFT:** After check-in, the NFT transforms into a validated NFT. The reservation amount is now available for withdrawal by the user.

   - The NFT value is returned to the user's wallet at the time of check-in, while cancellation fees that go to the restaurants are returned at the end of the day through a ChainLink Automation that checks all canceled reservations daily.

### Establishment Path - Making reservations available

1. **Profile Configuration:** Any restaurant owner can create a profile on the Link a Table app, providing information such as location, operating hours, and reservation policies.
2. **Reservation Configuration:** The restaurant owner can set available times and dates for reservations, as well as the required amount for the reservation.
3. **Reservation Management:** Restaurant owners can monitor bookings made, including the ability to view confirmed reservations, check-ins, and amounts pocketed for no-shows.
4. **Check-in and Validation:** The restaurant manager can facilitate customer check-ins via QR codes. The customer's presence is confirmed, and the reservation amount is released back to them upon check-in.
5. **Reports and Analysis:** The manager can easily access detailed reports on reservations, attendance rates, and no-shows to optimize reservation management.

## Technologies Used

- **Blockchain:** NFTs, Chainlink, Smart Contracts (EVM)
- **Front-end:** Next.Js, Wiem
- **Back-end:** MongoDB
- **NFTs:** Use of NFTs to represent reservations and ensure financial commitments.
- **ChainLink:** Chainlink Functions and ChainLink Automation
- **Smart Contracts:** Smart contracts to manage reservations, check-ins, and fund releases.

## System Architecture

- **Frontend:** Mobile app for users (consumers) and a web interface for restaurants.
- **Backend:** Servers to manage communication between users, restaurants, and the blockchain.
- **Blockchain:** Ethereum or another network compatible with NFTs and smart contracts.

## Costs and Operation

## Roadmap

### Q2
- Project conception
- Testing and launch

### Q3
- Marketplace for reservation trading
- Expansion of functionalities
- Testing with more clients

### Q4

## Team
- Breno Mazza
- Yan Victor
- Rafael Coelho

## Challenges Faced

- **Restaurant Adoption:** Convincing restaurants to adopt the system and integrate it into their daily processes.
- **Consumer Adoption:** Encouraging consumers to use the system, ensuring them confidence and security.
- **Blockchain Integration:** Ensuring efficient and secure integration with the blockchain, minimizing transaction costs.
- **Additional Use Case Scenario:** Events and Conferences, Transportation Services.