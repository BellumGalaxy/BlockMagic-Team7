// LoginComponent.js
import React, { useState } from "react";
import { useFirebaseAuth } from "~~/hooks/firebase/useAuth";
import { useGlobalState } from "~~/services/store/store";

export const LoginComponent = () => {
  const { user, loading, error, loginUser, logoutUser } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setIsConnecting = useGlobalState(state => state.setIsConnecting);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    if (await loginUser(email, password)) {
      setIsConnecting(true);
    }
  };

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Bem-vindo, {user.email}</p>
          <button onClick={handleLogout} disabled={loading}>
            {loading ? "Carregando..." : "Logout"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Senha"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Carregando..." : "Login"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </div>
  );
};
