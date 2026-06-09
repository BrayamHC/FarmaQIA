<p align="center">
  <strong>FarmaQ IA</strong><br/>
  Plataforma inteligente para la administración integral de farmacias
</p>

<p align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="42" alt="NestJS" />
  </a>
  &nbsp;&nbsp;
  <a href="https://vuejs.org/" target="_blank">
    <img src="https://vuejs.org/images/logo.png" width="42" alt="Vue" />
  </a>
  &nbsp;&nbsp;
  <a href="https://www.postgresql.org/" target="_blank">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="42" alt="PostgreSQL" />
  </a>
</p>

<p align="center">
  <strong>Sistema Full-Stack para gestión farmacéutica</strong><br/>
  NestJS · Vue 3 · PostgreSQL · Redis · Docker
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11.0-E0234E?style=flat&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat&logo=vuedotjs&logoColor=white" alt="Vue" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-17-336791?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/license-UNLICENSED-red?style=flat" alt="License" />
</p>

---

## ¿Qué es FarmaQ IA?

FarmaQ IA es una plataforma de gestión integral para farmacias. Centraliza inventario, medicamentos, lotes, caducidades, compras, ventas, usuarios, roles, permisos, reportes y un asistente inteligente con IA orientado a búsqueda de productos dentro del inventario.

---

## Estructura del Monorepo

```text
FarmaQIA/
├── Backend/
│   ├── Docker/          # Docker Compose de PostgreSQL + Redis
│   └── api/             # API RESTful — NestJS + TypeScript + Knex
└── Frontend/            # SPA — Vue 3 + Vite + PrimeVue
```

---

## Stack General

| Capa | Tecnología | Versión |
|:---|:---|:---|
| Backend | NestJS, TypeScript, Knex.js | v11 / v5.7 / v3 |
| Base de Datos | PostgreSQL | v17 |
| Caché / Sesiones | Redis + ioredis | v7 / v5 |
| Frontend | Vue 3, Vite, PrimeVue, TailwindCSS | v3.5 / v6 / v4 / v4 |
| Estado | Pinia + Vue Router | v2 / v4 |
| Infraestructura | Docker | — |
| Paquetes | pnpm | v10.25.0 |

---

## Inicio rápido

### Requisitos previos

- Node.js v22+
- pnpm v10.25.0
- Docker

### 1. Levantar infraestructura

```bash
cd Backend/Docker
docker compose -f docker-compose.postgres.yml -f docker-compose.redis.yml up -d
```

### 2. Iniciar backend

```bash
cd ../api
pnpm install
pnpm migrate:latest
pnpm seed:run
pnpm start:dev
```

API disponible en `http://localhost:3100`

### 3. Iniciar frontend

```bash
cd ../../Frontend
pnpm install
pnpm dev
```

Frontend disponible en `http://localhost:5173`

---

## Comandos esenciales backend

```bash
pnpm start:dev
pnpm build

pnpm migrate:make nombre_migracion
pnpm migrate:latest
pnpm migrate:rollback

pnpm seed:make nombre_seed
pnpm seed:run
```

---

## Base inicial del sistema

La primera etapa del sistema deja preparada la base para autenticación y RBAC:

- tablas base de usuarios, roles y permisos
- rol inicial `Administrador`
- usuario inicial `system@farmaqia.com`
- autenticación posterior con sesiones centralizadas en Redis
- arquitectura no multitenant, una sola base PostgreSQL

---

## Notas

- FarmaQ IA no es SaaS ni multitenant.
- Toda la plataforma opera sobre una sola base de datos PostgreSQL.
- El módulo de Auth reutilizará esta base y el modelo RBAC.
- El usuario `system` será el administrador global inicial del sistema.