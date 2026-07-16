# Plan técnico — IA interna para administrar Mandrágora

## 1. Objetivo

Implementar una IA interna para asistir en la administración de agenda, reservas, contenidos y comunicaciones del sitio. La IA debe trabajar con permisos limitados y aprobación humana para cualquier acción sensible.

## 2. Estado actual

- Sitio estático compuesto por páginas HTML.
- Funciones backend en `api/`.
- Integración prevista con Supabase.
- Pagos mediante MercadoPago.
- Notificaciones push mediante Web Push.
- Despliegue principal en Vercel.
- Panel admin actualmente en `admin.html`, todavía en desarrollo.

## 3. Arquitectura propuesta

```text
Panel admin
   ↓
API segura de IA
   ↓
Orquestador de herramientas
   ├── Agenda
   ├── Reservas
   ├── Contenidos
   ├── Notificaciones
   └── Reportes
   ↓
Supabase / APIs externas
```

La IA nunca debe acceder directamente a la base de datos ni ejecutar código arbitrario. Todas las operaciones deben realizarse mediante herramientas controladas con esquemas y permisos definidos.

## 4. Fases de implementación

### Fase 0 — Seguridad base

Antes de incorporar IA:
- Reemplazar la contraseña hardcodeada del panel.
- Implementar autenticación real.
- Definir roles: `admin`, `editor` y `consulta`.
- Migrar reservas a Supabase.
- Configurar RLS en Supabase.
- Mantener todas las claves en variables de entorno.
- Crear registros de auditoría.
- Separar claramente pruebas y producción.

### Fase 1 — IA de solo lectura (consultas, resúmenes, reportes)
### Fase 2 — Modo borrador (eventos, noticias, textos con aprobación)
### Fase 3 — Acciones aprobadas (aprobar, rechazar, editar, deshacer)
### Fase 4 — Automatizaciones limitadas (recordatorios, alertas, resúmenes)

## 5. Reglas de seguridad

- Clave del proveedor IA solo en servidor
- No modificar precios sin autorización
- No confirmar pagos automáticamente
- Aprobación requerida para publicar
- Todas las acciones registradas
- Backups y rollback
