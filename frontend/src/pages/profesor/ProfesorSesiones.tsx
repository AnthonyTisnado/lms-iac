import { CrudByClass } from './SharedProfesor';

export function ProfesorSesiones() {
  return <CrudByClass title="Sesiones" path="sesiones" fields={[['titulo', 'Titulo'], ['descripcion', 'Descripcion'], ['fecha', 'Fecha'], ['materialUrl', 'Material URL']]} />;
}
