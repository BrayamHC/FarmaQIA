-- Usuario principal de la aplicación
CREATE USER farmaq_user WITH PASSWORD 'farmaq_app_password_2026';
CREATE DATABASE farmaq_db OWNER farmaq_user;
GRANT ALL PRIVILEGES ON DATABASE farmaq_db TO farmaq_user;

-- Permisos sobre schema public (requerido en PostgreSQL 15+)
\c farmaq_db
GRANT ALL ON SCHEMA public TO farmaq_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO farmaq_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO farmaq_user;