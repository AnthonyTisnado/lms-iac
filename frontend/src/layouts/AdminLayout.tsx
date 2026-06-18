import { Shell } from './Shell';

export function AdminLayout() {
  return <Shell title="Administracion" links={[
    { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { to: '/admin/usuarios', label: 'Usuarios', icon: 'users' },
    { to: '/admin/cursos', label: 'Cursos', icon: 'book' },
    { to: '/admin/clases', label: 'Clases', icon: 'class' },
    { to: '/admin/reportes', label: 'Reportes', icon: 'dashboard' }
  ]} />;
}
