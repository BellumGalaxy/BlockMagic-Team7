// useFirebaseAuth.js
import { useState } from "react";
import { createNewUser, login, logout } from "./index";
import { User } from "firebase/auth";

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const createUser = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await createNewUser(email, password); // Update the type of 'user' to 'User'
      setUser(user);
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
