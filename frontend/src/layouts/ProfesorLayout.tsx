import { Shell } from './Shell';

export function ProfesorLayout() {
  return <Shell title="Profesor" links={[
    { to: '/profesor', label: 'Dashboard', icon: 'dashboard' },
    { to: '/profesor/clases', label: 'Mis clases', icon: 'class' }
  ]} />;
}
