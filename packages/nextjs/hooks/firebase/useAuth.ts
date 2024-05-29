// useFirebaseAuth.js
import { useState } from "react";
import { UserRegisterData } from "../../../types/index";
import { login, logout } from "./index";
import axios from "axios";
import { User } from "firebase/auth";

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>("");

  const loginUser = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password); // Update the type of 'user' to 'User'
      setUser(user);
      return true;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    setError(null);
    try {
      await logout();
      setUser(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (formData: UserRegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://127.0.0.1:5001/hackton-chainlink/us-central1/registerUser", formData);
      if (response.status === 200) {
        setUser(response.data);
      } else {
        throw new Error("Error on create user");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    loginUser,
    logoutUser,
    createUser,
  };
};
