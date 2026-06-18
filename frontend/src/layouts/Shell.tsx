import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Radio, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LinkItem {
  to: string;
  label: string;
  icon: 'dashboard' | 'users' | 'book' | 'class' | 'stream';
}

const icons = {
  dashboard: LayoutDashboard,
  users: Users,
  book: BookOpen,
  class: GraduationCap,
  stream: Radio
};

export function Shell({ title, links }: { title: string; links: LinkItem[] }) {
  const { usuario, logout } = useAuth();
  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-blue-950 text-white lg:min-h-screen lg:w-64">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <div>
            <div className="text-xl font-semibold">LMSIAC</div>
            <div className="text-xs text-blue-200">{title}</div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1">
          {links.map((item) => {
            const Icon = icons[item.icon];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.split('/').length <= 2}
                className={({ isActive }) =>
                  `flex min-w-max items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-white text-blue-950' : 'text-blue-100 hover:bg-blue-900'}`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          <div>
            <div className="text-sm font-semibold">{usuario?.nombres} {usuario?.apellidos}</div>
            <div className="text-xs text-slate-500">{usuario?.rol}</div>
          </div>
          <button className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={logout}>
            <LogOut size={16} /> Cerrar sesion
          </button>
        </header>
        <div className="mx-auto max-w-7xl p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
