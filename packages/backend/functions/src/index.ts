/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { FieldValue } from "@google-cloud/firestore";
import { UserRegisterData, ValidateWalletRequest, ReserveDataRequest } from "../../../types/index";
import * as logger from "firebase-functions/logger";
import { db, auth } from "./database";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const registerUser = onRequest(async (request, response) => {

 const userData: UserRegisterData = request.body;

 try {

  const user = await auth.createUser({
   email: userData.email,
   password: userData.password
  });

  await db.collection("users").doc(user.uid).set({
   name: userData.name,
   email: userData.email,
   password: userData.password,
   birthday_date: userData.birthday_date,
   phone: userData.phone,
   document_type: userData.document_type,
   document_number: userData.document_number,
   country: userData.country,
   city: userData.city,
   zip_code: userData.zip_code,
   street: userData.street,
   district: userData.district,
   complement: userData.complement,
   created_at: FieldValue.serverTimestamp()
  });

  response.send("User added with success").status(200);
 } catch (e: any) {
  logger.error(e);
  // if error has auth error 
  if (e.code === "auth/email-already-exists") {
   response.send("Email already exists").status(400);
   return;
  }
  response.send("Error on add user").status(500);
 }

});

export const getAllUsers = onRequest(async (request, response) => {
 
 try {
  const users = await db.collection("users").get();
  const data = users.docs.map(doc => {
   const id = doc.id;
   const data = doc.data();
   return { id, data };
  });
  response.send(data).status(200);
 } catch (e) {
  logger.error(e);
  response.send("Error on get users").status(500);
 }

});

export const verifyUserWallet = onRequest(async (request, response) => {

 try {
  const validateData: ValidateWalletRequest = request.body;
  const user = await db.collection("users").doc(validateData.uid).get();
  if (!user.exists) {
   response.send("User not found").status(404);
   return;
  }
  // update user 
  await db.collection("users").doc(validateData.uid).update({
   wallet_id: validateData.wallet_id
  });
 } catch (e) {
  logger.error(e);
  response.send("Error on verify user wallet").status(500);
 }

});

export const createReservations = onRequest(async (request, response) => {

 try {
  const reserveData: ReserveDataRequest = request.body;

  const user = await db.collection("users").doc(reserveData.owner_id).get();
  if (!user.exists) {
   response.send("User not found").status(404);
   return;
  }

  const user_id = reserveData.owner_id;
  // const userRef = db.collection("users").doc(user_id);

  const reservationsInitialRange = reserveData.initial_reservation_range;
  const reservationsFinalRange = reserveData.final_reservation_range;
  const daysDiff = reservationsFinalRange - reservationsInitialRange;
  const totalDays = daysDiff / (1000 * 60 * 60 * 24);

  const open_time = reserveData.open_time;
  const close_time = reserveData.close_time;
  const reservation_time = reserveData.reservation_time;
  const tolerance_time = reserveData.tolerance_time;

  // create a for loop to create reservations for each day
  for (let i = 0; i < totalDays; i++) {
   const date = new Date(reservationsInitialRange + i * (1000 * 60 * 60 * 24));
   const dayReserveId = date.getTime().toString();

   const reservationDay = dayReserveId.toString();
   await db.collection(`users/${user_id}/reservationsDay`).doc(dayReserveId).set({
    open_time,
    close_time,
    reservation_time,
    tolerance_time,
    number_of_tables: reserveData.number_of_tables,
    number_of_persons: reserveData.number_of_persons,
   });

   // crie uma reserva para cada reservation_time dentre o periodo de open_time e close_time
   // Calcular a diferença em milissegundos
   const totalTimeOpenPerDay = (close_time - open_time);
   const totalReservePerTable = Math.floor(totalTimeOpenPerDay / reservation_time);


   // criar reservas para cada reservation_time
   for (let table = 0; table < reserveData.number_of_tables; table++) {
    for (let reserve = 0; reserve < totalReservePerTable; reserve++) {
     await db.collection(`users/${user_id}/reservationsDay/${reservationDay}/reserves`).add({
      owner_id: "",
      open_time: open_time + reserve * reservation_time,
      close_time: open_time + reserve * reservation_time + reservation_time,
      reservation_time: reservation_time,
      tolerance_time: tolerance_time,
      number_of_persons: reserveData.number_of_persons,
     });
    }
   }

  }

  response.send({ user_id, totalDays }).status(200);
 } catch (e) {
  logger.error(e);
  response.send("Error on add new reserve").status(500);
 }

});

export const getReservationsDays = onRequest(async (request, response) => {

 try {
  const user_id = request.query.user_id as string;
  const user = await db.collection("users").doc(user_id).get();
  if (!user.exists) {
   response.send("User not found").status(404);
   return;
  }

  const reservations = await db.collection(`users/${user_id}/reservationsDay`).get();
  const data = reservations.docs.map(doc => {
   const day = doc.id;
   const data = doc.data();
   return { day, data };
  });
  response.send(data).status(200);
 } catch (e) {
  logger.error(e);
  response.send("Error on get reservations").status(500);
 }

});


export const getReservationsByDay = onRequest(async (request, response) => {

 try {
  const user_id = request.query.user_id as string;
  const day = request.query.day as string;
  const user = await db.collection("users").doc(user_id).get();
  if (!user.exists) {
   response.send("User not found").status(404);
   return;
  }

  const reservations = await db.collection(`users/${user_id}/reservationsDay/${day}/reserves`).get();
  const data = reservations.docs.map(doc => {
   const reserve = doc.id;
   const data = doc.data();
   return { reserve, data };
  });
  response.send(data).status(200);
 } catch (e) {
  logger.error(e);
  response.send("Error on get reservations").status(500);
 }

});

/**
 * Função que cria um token para uma reserva. 
 * Essa função é chamada pelo No da Chainlink antes do SafeMint ser chamado.
 * Caso o token seja criado com sucesso, a função retorna 200. 
 */
export const mintToken = onRequest(async (request, response) => {

 try {
  const restaurant_id = request.body.user_id as string;
  const client_id = request.body.client_id as string;
  const day = request.body.day as string;
  const reserve_id = request.body.reserve_id as string;
  const token_id = request.body.token_id as number;


  const restaurant = await db.collection("users").doc(restaurant_id).get();
  if (!restaurant.exists) {
   response.send("Restaurant not found").status(404);
   return;
  }

  const reserve = await db.collection(`users/${restaurant_id}/reservationsDay/${day}/reserves`).doc(reserve_id).get();
  if (!reserve.exists) {
   response.send("Reserve not found").status(404);
   return;
  }

  await db.collection(`users/${restaurant_id}/reservationsDay/${day}/reserves`).doc(reserve_id).update({
   token_id: token_id,
   owner_id: client_id
  });

  response.send("Token created").status(200);
 } catch (e) {
  logger.error(e);
  response.send("Error on create token").status(500);
 }

});
