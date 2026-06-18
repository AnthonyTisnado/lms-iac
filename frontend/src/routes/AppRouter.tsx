import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../types';
import { LoginPage } from '../pages/login/LoginPage';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProfesorLayout } from '../layouts/ProfesorLayout';
import { AlumnoLayout } from '../layouts/AlumnoLayout';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsuarios } from '../pages/admin/AdminUsuarios';
import { AdminCursos } from '../pages/admin/AdminCursos';
import { AdminClases } from '../pages/admin/AdminClases';
import { AdminReportes } from '../pages/admin/AdminReportes';
import { ProfesorDashboard } from '../pages/profesor/ProfesorDashboard';
import { ProfesorClases } from '../pages/profesor/ProfesorClases';
import { ProfesorSesiones } from '../pages/profesor/ProfesorSesiones';
import { ProfesorTareas } from '../pages/profesor/ProfesorTareas';
import { ProfesorExamenes } from '../pages/profesor/ProfesorExamenes';
import { ProfesorStreaming } from '../pages/profesor/ProfesorStreaming';
import { ProfesorAlumnos } from '../pages/profesor/ProfesorAlumnos';
import { ProfesorCursoDetalle } from '../pages/profesor/ProfesorCursoDetalle';
import { AlumnoDashboard } from '../pages/alumno/AlumnoDashboard';
import { AlumnoClases } from '../pages/alumno/AlumnoClases';
import { AlumnoSesiones } from '../pages/alumno/AlumnoSesiones';
import { AlumnoTareas } from '../pages/alumno/AlumnoTareas';
import { AlumnoExamenes } from '../pages/alumno/AlumnoExamenes';
import { AlumnoStreaming } from '../pages/alumno/AlumnoStreaming';
import { AlumnoNotas } from '../pages/alumno/AlumnoNotas';
import { AlumnoCursoDetalle } from '../pages/alumno/AlumnoCursoDetalle';
import { PdfViewerPage } from '../pages/common/PdfViewerPage';

function Guard({ rol, children }: { rol: Rol; children: JSX.Element }) {
  const { usuario, roleHome } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== rol) return <Navigate to={roleHome(usuario.rol)} replace />;
  return children;
}

export function AppRouter() {
  const { usuario, roleHome } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to={roleHome()} replace /> : <LoginPage />} />
      <Route path="/admin" element={<Guard rol="ADMINISTRADOR"><AdminLayout /></Guard>}>
        <Route index element={<AdminDashboard />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="cursos" element={<AdminCursos />} />
        <Route path="clases" element={<AdminClases />} />
        <Route path="reportes" element={<AdminReportes />} />
      </Route>
      <Route path="/profesor" element={<Guard rol="PROFESOR"><ProfesorLayout /></Guard>}>
        <Route index element={<ProfesorDashboard />} />
        <Route path="clases" element={<ProfesorClases />} />
        <Route path="clases/:id/sesiones" element={<ProfesorSesiones />} />
        <Route path="clases/:id/tareas" element={<ProfesorTareas />} />
        <Route path="clases/:id/examenes" element={<ProfesorExamenes />} />
        <Route path="clases/:id/streaming" element={<ProfesorStreaming />} />
        <Route path="clases/:id/alumnos" element={<ProfesorAlumnos />} />
        <Route path="clases/:id/curso" element={<ProfesorCursoDetalle />} />
      </Route>
      <Route path="/alumno" element={<Guard rol="ALUMNO"><AlumnoLayout /></Guard>}>
        <Route index element={<AlumnoDashboard />} />
        <Route path="clases" element={<AlumnoClases />} />
        <Route path="clases/:id/sesiones" element={<AlumnoSesiones />} />
        <Route path="clases/:id/tareas" element={<AlumnoTareas />} />
        <Route path="clases/:id/examenes" element={<AlumnoExamenes />} />
        <Route path="clases/:id/streaming" element={<AlumnoStreaming />} />
        <Route path="clases/:id/curso" element={<AlumnoCursoDetalle />} />
        <Route path="notas" element={<AlumnoNotas />} />
      </Route>
      <Route path="/viewer/pdf" element={<PdfViewerPage />} />
      <Route path="*" element={<Navigate to={usuario ? roleHome() : '/login'} replace />} />
    </Routes>
  );
}
