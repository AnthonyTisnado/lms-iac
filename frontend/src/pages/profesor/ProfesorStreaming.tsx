import { CrudByClass } from './SharedProfesor';

export function ProfesorStreaming() {
  return <CrudByClass title="Streaming" path="streaming" fields={[['titulo', 'Titulo'], ['descripcion', 'Descripcion'], ['enlaceStreaming', 'Enlace Jitsi, Meet o Zoom'], ['fechaInicio', 'Fecha inicio'], ['estado', 'Estado']]} />;
}
