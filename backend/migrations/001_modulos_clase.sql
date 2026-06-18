create table if not exists modulos_clase (
  id bigserial primary key,
  clase_id bigint not null references clases(id) on delete cascade,
  numero_semana int not null,
  titulo varchar(200),
  descripcion text,
  fecha_inicio timestamp,
  fecha_fin timestamp,
  visible boolean default true,
  creado_en timestamp default now()
);

create table if not exists recursos_modulo (
  id bigserial primary key,
  modulo_id bigint not null references modulos_clase(id) on delete cascade,
  titulo varchar(200) not null,
  descripcion text,
  tipo varchar(50) not null,
  archivo_url text,
  enlace_url text,
  orden int default 1,
  visible boolean default true,
  creado_en timestamp default now()
);

alter table tareas
  add column if not exists modulo_id bigint references modulos_clase(id);
