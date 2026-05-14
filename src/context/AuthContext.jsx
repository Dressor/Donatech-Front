import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('donatech_token');
    const storedUser = localStorage.getItem('donatech_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    const { token: jwt, ...userInfo } = data;
    setToken(jwt);
    setUser(userInfo);
    localStorage.setItem('donatech_token', jwt);
    localStorage.setItem('donatech_user', JSON.stringify(userInfo));
    return userInfo;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('donatech_token');
    localStorage.removeItem('donatech_user');
  }, []);

  const hasRole = useCallback(
    (role) => user?.roles?.includes(role) ?? false,
    [user]
  );

  const isAdmin = hasRole('ROLE_ADMIN');
  const isDonante = hasRole('ROLE_DONANTE');
  const isBeneficiario = hasRole('ROLE_BENEFICIARIO');
  const isValidador = hasRole('ROLE_VOLUNTARIO');
  const isOrganizacion = hasRole('ROLE_ORGANIZACION');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        hasRole,
        isAdmin,
        isDonante,
        isBeneficiario,
        isValidador,
        isOrganizacion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
