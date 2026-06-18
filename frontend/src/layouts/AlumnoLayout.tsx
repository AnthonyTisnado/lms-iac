import { Shell } from './Shell';

export function AlumnoLayout() {
  return <Shell title="Alumno" links={[
    { to: '/alumno', label: 'Dashboard', icon: 'dashboard' },
    { to: '/alumno/clases', label: 'Mis clases', icon: 'class' },
    { to: '/alumno/notas', label: 'Mis notas', icon: 'book' }
  ]} />;
}
