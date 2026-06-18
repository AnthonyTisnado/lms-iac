export type Rol = 'ADMINISTRADOR' | 'PROFESOR' | 'ALUMNO';

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: Rol;
  estado: boolean;
}

export interface EntityUser {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: { id: number; nombre: Rol };
  estado: boolean;
}

export interface Curso {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  totalClases?: number;
}

export interface Clase {
  id: number;
  nombre: string;
  curso: Curso;
  profesor: EntityUser;
  estado: boolean;
  totalAlumnos?: number;
}

export interface DashboardAdmin {
  totalUsuarios: number;
  totalAdministradores: number;
  totalProfesores: number;
  totalAlumnos: number;
  totalCursos: number;
  totalClases: number;
  totalTareas: number;
  totalExamenes: number;
  ultimosUsuarios: Usuario[];
  ultimosCursos: Curso[];
  ultimasClases: Array<{ id: number; nombre: string; curso: string; profesor: string; estado: boolean; totalAlumnos: number }>;
}

export interface ReportesAdmin {
  cursosConMasAlumnos: Curso[];
  profesoresConMasClases: Array<{ id: number; nombreCompleto: string; email: string; totalClases: number }>;
  alumnosActivos: number;
  clasesActivas: number;
  tareasCreadas: number;
  examenesCreados: number;
}

export interface Item {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha?: string;
  materialUrl?: string;
  archivoUrl?: string;
  fechaEntrega?: string;
  enlaceStreaming?: string;
  fechaInicio?: string;
  estado?: string;
  nota?: number;
}
