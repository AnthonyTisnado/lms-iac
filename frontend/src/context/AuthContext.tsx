import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../api/axios';
import type { Rol, Usuario } from '../types';

interface AuthContextValue {
  token: string | null;
  usuario: Usuario | null;
  login: (email: string, password: string) => Promise<Usuario>;
  logout: () => void;
  roleHome: (rol?: Rol) => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(localStorage.getItem('lmsiac_token'));
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const raw = localStorage.getItem('lmsiac_usuario');
    return raw ? JSON.parse(raw) : null;
  });

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('lmsiac_token', data.token);
    localStorage.setItem('lmsiac_usuario', JSON.stringify(data.usuario));
    setToken(data.token);
    setUsuario(data.usuario);
    return data.usuario as Usuario;
  }

  function logout() {
    localStorage.removeItem('lmsiac_token');
    localStorage.removeItem('lmsiac_usuario');
    setToken(null);
    setUsuario(null);
  }

  function roleHome(rol = usuario?.rol) {
    if (rol === 'ADMINISTRADOR') return '/admin';
    if (rol === 'PROFESOR') return '/profesor';
    if (rol === 'ALUMNO') return '/alumno';
    return '/login';
  }

  const value = useMemo(() => ({ token, usuario, login, logout, roleHome }), [token, usuario]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext no disponible');
  return ctx;
}
