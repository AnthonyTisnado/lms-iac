import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const { login, roleHome } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const usuario = await login(email, password);
      navigate(roleHome(usuario.rol), { replace: true });
    } catch {
      setError('Email o password incorrectos.');
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="text-2xl font-semibold text-blue-950">LMSIAC</div>
          <div className="text-sm text-slate-500">Acceso al aula virtual</div>
        </div>
        {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <label className="mb-3 block text-sm font-medium">Email
          <input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="mb-5 block text-sm font-medium">Password
          <input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="flex w-full items-center justify-center gap-2 bg-blue-700 text-white hover:bg-blue-800">
          <LogIn size={16} /> Iniciar sesion
        </button>
      </form>
    </div>
  );
}
