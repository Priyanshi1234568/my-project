import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    user: JSON.parse(localStorage.getItem("user") || "null"),
  });

  const login = (data, fallbackRole) => {
    const role = data.user?.role || fallbackRole;

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(data.user || null));

    setAuth({
      token: data.token,
      role,
      user: data.user || null,
    });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({
      token: null,
      role: null,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}