export type UserRegisterData = {
 name: string;
 email: string;
 password: string;
 birthday_date: string;
 phone: string;
 document_type: string;
 document_number: string;
 country: string;
 city: string;
 zip_code: string;
 street: string;
 district: string;
 complement: string;
}

export type ValidateWalletRequest = {
 uid: string;
 wallet_id: string;
}

export type ReserveDataRequest = {
 owner_id: string;
 open_time: number;
 close_time: number;
 reservation_time: number;
 tolerance_time: number;
 number_of_tables: number;
 number_of_persons: number;
 initial_reservation_range: number;
 final_reservation_range: number;
}

export type ReserveData = {
 open_time: string;
 close_time: string;
 tolerance_time: number;
 initial_reservation_range: number;
 final_reservation_range: number;
 created_at: number;
 token_id?: number;
}