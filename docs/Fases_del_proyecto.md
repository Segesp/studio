A continuación encontrarás un plan de trabajo **detallado y organizado por fases** para completar todas las funcionalidades que actualmente muestran “Muy pronto” en la estructura de tu proyecto. Cada fase incluye objetivos, tareas concretas, responsables (si aplica) y criterios de aceptación. Siéntete libre de adaptarlo a tu ritmo y equipo.

---

## Visión general de funcionalidades pendientes

1. **Sync en tiempo real** (`src/app/(app)/sync/page.tsx`)
2. **Smart-Assist**

   * Formulario de recordatorios de fechas límite inteligentes (`intelligent-deadline-reminders-form.tsx` + `src/flows/intelligent-deadline-reminders.ts`)
   * Formulario de priorización inteligente de tareas (`smart-task-prioritization-form.tsx` + `src/flows/smart-task-prioritization.ts`)
   * Formulario de programación inteligente de eventos (`smart-event-scheduling-form.tsx` + `src/flows/smart-event-scheduling.ts`)
3. **Lista de tareas** (`src/app/(app)/task-list/page.tsx`)
4. **Calendario interactivo** (`src/app/(app)/interactive-calendar/page.tsx`)
5. **Documentos colaborativos** (`src/app/(app)/collaborative-docs/page.tsx`)
6. **Dashboard principal** (`src/app/(app)/dashboard/page.tsx`)
7. **Navegación y layout general** (`src/app/(app)/layout.tsx`, `src/components/layout/nav-links.tsx`)
8. **Loader global y feedback de carga** (`src/components/ui/loader.tsx`)
9. **Configuraciones genéricas (Tailwind, .env, genkit, dev, ai/dev)**

A lo largo del plan, aparecerán referencias directas a estas rutas para que entiendas en qué punto de la estructura debes trabajar.

---

# Fase 0. Preparación y organización del entorno

**Objetivo**: Tener el proyecto preparado para empezar a codificar sin obstáculos técnicos (dependencias, variables de entorno, scripts).

### Tareas

1. **Revisar configuraciones de Tailwind y globals.css** (`src/app/globals.css`, `tailwind.config.ts`)

   * Verificar que todos los estilos base y clases utilitarias necesarias estén definidos.
   * Confirmar que el diseño “dark/light” y breakpoints estén configurados.
2. **Revisar `.env`** (archivo raíz)

   * Validar que existan variables de entorno claras para conectar a la base de datos, claves de API (SendGrid, S3, Auth0/NextAuth), etc.
   * Crear un `.env.example` que documente cada variable necesaria.
3. **Verificar scripts de desarrollo y producción** (`package.json`, `src/ai/dev.ts`, `src/ai/genkit.ts`)

   * Confirmar comandos:

     * `npm run dev` → arranque local (frontend + backend).
     * `npm run build` → compilación de producción.
     * `npm run lint`, `npm run test`.
   * Documentar en README las instrucciones básicas de arranque.
4. **Asegurar la conexión con la base de datos**

   * Si usas PostgreSQL + Prisma, comprobar `prisma/schema.prisma` y que la cadena de conexión (`DATABASE_URL`) esté bien.
   * Hacer una migración inicial (`npx prisma migrate dev --name init`) o, si usas MongoDB, revisar `mongoose.connect(...)` en el backend.
5. **Configurar CI local**

   * Ejecutar `npm run lint` y `npm run test` para detectar errores tempranos.

> **Criterio de aceptación**: Al correr `npm install && npm run dev` el proyecto levanta sin errores de compilación y sin pantallas de “Muy pronto” en las rutas de configuración base (Router, layout, nav).

---

# Fase 1. Estructura de rutas y layout general

**Objetivo**: Asegurar que la navegación entre secciones (Sync, Smart-Assist, Task-List, Calendar, Collaborative-Docs, Dashboard) funcione y muestre componentes vacíos o skeletons de loader correctamente.

### Tareas

1. **Revisar `src/app/(app)/layout.tsx`**

   * Confirmar que envuelve con `html`, `body` y provee un contenedor `<main>` donde se inyectan las rutas hijas.
   * Asegurarse de que `nav-links.tsx` (barra de navegación lateral o superior) esté importado ahí y tenga enlaces a:

     * `/sync`
     * `/smart-assist/deadline-reminders`
     * `/smart-assist/task-prioritization`
     * `/smart-assist/event-scheduling`
     * `/task-list`
     * `/interactive-calendar`
     * `/collaborative-docs`
     * `/dashboard`
2. **Revisar `src/components/layout/nav-links.tsx`**

   * Definir los enlaces de navegación (React Router o Next.js Link) con íconos e indicación de sección activa.
   * Validar estilos de Tailwind para que sea responsive (colapsable en móvil, desplegable en desktop).
3. **Añadir `Loader` global en `src/components/ui/loader.tsx`**

   * Asegurar un componente animado (spinner o skeleton) que se muestra en lugar de “Muy pronto” cuando la página esté cargando datos.
   * Exportar un `Suspense` wrapper en `layout.tsx`, por ejemplo:

     ```tsx
     <Suspense fallback={<Loader />}>
       {children}
     </Suspense>
     ```
4. **Configurar rutas hijas para cada sección**

   * Crear carpetas y archivos vacíos (o con un placeholder) en:

     ```
     src/app/(app)/sync/page.tsx
     src/app/(app)/smart-assist/deadline-reminders/page.tsx
     src/app/(app)/smart-assist/task-prioritization/page.tsx
     src/app/(app)/smart-assist/event-scheduling/page.tsx
     src/app/(app)/task-list/page.tsx
     src/app/(app)/interactive-calendar/page.tsx
     src/app/(app)/collaborative-docs/page.tsx
     src/app/(app)/dashboard/page.tsx
     ```
   * Cada `page.tsx` debe importar `Loader` y retornar, por ahora, un mensaje minimal:

     ```tsx
     export default function Page() {
       return (
         <div className="flex w-full h-full items-center justify-center">
           <p className="text-gray-500">Cargando...</p>
         </div>
       );
     }
     ```
   * Verificar que al navegar a `/sync`, `/task-list`, etc., no aparezca “404” ni “Muy pronto”, sino el placeholder de carga.

> **Criterio de aceptación**: Al hacer clic en cada enlace del menú de navegación, se carga el componente correspondiente con un “Cargando...” estilizado, sin errores de ruta.

---

# Fase 2. Backend básico y servicios esenciales

**Objetivo**: Implementar la capa de backend que servirá como base para todas las funcionalidades: autenticación, base de datos, capa de APIs (REST o GraphQL), y estructuras de datos necesarias (tasks, events, documents, usuarios).

### Tareas

1. **Autenticación y autorización**

   * Instalar y configurar **NextAuth.js** con proveedores (por ejemplo, GitHub, Google) o bien configurar **Auth0**.
   * En `src/pages/api/auth/[...nextauth].ts` (o el equivalente en NestJS), definir los adapters para Prisma (PostgreSQL) o Mongoose (MongoDB).
   * Crear tabla/colección `User` con campos:

     ```
     id: string (UUID)
     name: string
     email: string
     image: string (foto de perfil)
     createdAt: Date
     updatedAt: Date
     ```
   * Probar rutas protegidas con middleware (`getSession` o `getServerSideProps`) para validar que usuarios no autenticados son redirigidos a login.

2. **Modelado de datos (Prisma o Mongoose)**

   * **Tasks** (`Task`):

     ```prisma
     model Task {
       id          String   @id @default(uuid())
       title       String
       description String?
       status      String   @default("pending") // pending, in_progress, done
       priority    Int      @default(0)
       dueDate     DateTime?
       tags        String[] // array de etiquetas
       createdAt   DateTime @default(now())
       updatedAt   DateTime @updatedAt
       userId      String
       user        User     @relation(fields: [userId], references: [id])
     }
     ```
   * **Events** (`Event`):

     ```prisma
     model Event {
       id          String   @id @default(uuid())
       title       String
       description String?
       startDate   DateTime
       endDate     DateTime
       color       String   @default("blue")
       isPublic    Boolean  @default(false)
       createdAt   DateTime @default(now())
       updatedAt   DateTime @updatedAt
       userId      String
       user        User     @relation(fields: [userId], references: [id])
     }
     ```
   * **Documents colaborativos** (`Doc` + `DocVersion`):

     ```prisma
     model Doc {
       id          String        @id @default(uuid())
       title       String
       ownerId     String
       owner       User          @relation(fields: [ownerId], references: [id])
       createdAt   DateTime      @default(now())
       updatedAt   DateTime      @updatedAt
       versions    DocVersion[]
     }

     model DocVersion {
       id           String   @id @default(uuid())
       docId        String
       doc          Doc      @relation(fields: [docId], references: [id])
       content      Json     // estructura CRDT o snapshot
       createdAt    DateTime @default(now())
       createdBy    String
     }
     ```
   * **Users** (`User`):

     ```prisma
     model User {
       id          String   @id @default(uuid())
       name        String?
       email       String   @unique
       image       String?
       createdAt   DateTime @default(now())
       updatedAt   DateTime @updatedAt
       tasks       Task[]
       events      Event[]
       docs        Doc[]
     }
     ```
   * Ejecutar migraciones en la base de datos:

     ```
     npx prisma migrate dev --name add_tasks_events_docs
     ```

3. **APIs CRUD básicas**

   * **Tasks API** (`src/pages/api/tasks/*` o `src/routes/api/tasks.ts`):

     * `GET /api/tasks` → lista de tareas del user logueado.
     * `POST /api/tasks` → crear tarea.
     * `PUT /api/tasks/:id` → actualizar tarea.
     * `DELETE /api/tasks/:id` → eliminar tarea.
   * **Events API** (`/api/events` similar estructura).
   * **Docs API** (`/api/docs`):

     * `POST /api/docs` → crear nuevo documento.
     * `GET /api/docs/:id` → obtener metadatos del documento.
     * `PATCH /api/docs/:id` → guardar snapshot/versión.
     * `GET /api/docs/:id/versions` → historial de versiones.
   * **Smart-Assist (Flujos de AI)** (`src/pages/api/ai/*`):

     * `POST /api/ai/task-prioritization`
     * `POST /api/ai/event-scheduling`
     * `POST /api/ai/deadline-reminders`
     * Estas rutas recibirán JSON con datos de entrada (lista de tareas, parámetros de evento, fechas límite) y retornarán la respuesta de la lógica AI (puede invocar a OpenAI o a un módulo local de heurísticas).

4. **Configurar WebSockets o Realtime**

   * Instalación de **Socket.IO** (o usar **Supabase Realtime** / **Firebase**).
   * En `src/pages/api/socket.ts` (si Next.js) o en el servidor de NestJS, exponer el endpoint de WS.
   * Probar conexión básica: al entrar a `/sync`, el cliente se conecta al socket y muestra “Conectado”/“Desconectado”.

> **Criterio de aceptación**:
>
> * Existen endpoints funcionando para CRUD de tareas, eventos y documentos (se pueden probar con Postman o Insomnia).
> * El middleware de Auth protege las rutas (un usuario sin sesión no puede acceder).
> * Conexión WebSocket establecida (puede verse en consola del navegador).

---

# Fase 3. Implementación de la Lista de Tareas (To-Do List)

**Objetivo**: Desarrollar la sección `/task-list`, desde la interfaz hasta la lógica de comunicación con la API y la base de datos.

### Tareas

1. **Frontend: `src/app/(app)/task-list/page.tsx`**

   * Definir la interfaz de usuario:

     * Un encabezado “Mis Tareas”.
     * Botón para “Nueva tarea” que abra un Modal o Drawer.
     * Filtros superiores:

       * Estado: Pendiente / En progreso / Completada.
       * Búsqueda por palabra clave en el título.
       * Etiqueta (Selector de múltiples opciones).
       * Ordenar por fecha de vencimiento o prioridad.
     * Lista de tareas como cards o filas:

       * Checkbox para marcar “Completada”.
       * Título, due date, prioridad (color o ícono).
       * Iconos para “Editar” y “Eliminar”.
   * Utilizar **React Query** o **SWR** para la obtención y mutación de datos.
2. **Componente `TaskItem.tsx`** (`src/components/task-list/TaskItem.tsx`)

   * Recibir props: `{ task, onToggleStatus, onEdit, onDelete }`.
   * Mostrar estilo diferenciado si `task.status === "done"`.
   * Eventos:

     * Al hacer click en el checkbox, llamar a la mutación PUT `/api/tasks/:id` para cambiar `status`.
     * Botón “Editar” abre el formulario.
     * Botón “Eliminar” lanza confirmación y luego DELETE.
3. **Formulario de creación / edición** (`src/components/task-list/TaskForm.tsx`)

   * Campos:

     * Título (input text, requerido).
     * Descripción (textarea, opcional).
     * Fecha de vencimiento (datepicker, opcional).
     * Prioridad (selector 0–3: baja / media / alta / urgente).
     * Etiquetas (multiple select, sugerir etiquetas existentes).
   * Validación con **Zod** (ejemplo: `title` no vacío, `dueDate` es un Date válido si existe).
   * Al enviar:

     * Si es creación → POST `/api/tasks`.
     * Si es edición → PUT `/api/tasks/:id`.
   * Después de éxito:

     * Invalidar query de tareas (`react-query.invalidateQueries("tasks")`) para refrescar lista.
     * Cerrar modal.
4. **Integración con backend**

   * Verificar que la respuesta JSON de `GET /api/tasks` sea mapeable a la UI.
   * Asegurarse de manejar errores (status 4xx, 5xx) y mostrar feedback (toasts o alertas).
5. **Estados de carga y empty state**

   * Mientras la data se carga, mostrar `<Loader />`.
   * Si no hay tareas, mostrar un mensaje amigable: “No tienes tareas. Crea tu primera tarea.”
   * Cuando apretar eliminar, deshabilitar el botón hasta que la respuesta llegue.
6. **Tests unitarios y de integración (opcional pero recomendado)**

   * Escribir tests en **Jest + React Testing Library**:

     * Ver que el formulario valida campos.
     * Simular creación de una tarea y asegurarse de que aparece en la lista.
     * Simular toggling de estado.

> **Criterio de aceptación**:
>
> * El usuario autenticado puede ver, crear, editar, completar y eliminar tareas sin recargar la página.
> * La interfaz responde a filtros y búsqueda en tiempo real.
> * No quedan “Muy pronto” ni placeholders en `/task-list`.

---

# Fase 4. Implementación del Calendario Interactivo

**Objetivo**: Completar la sección `/interactive-calendar` para mostrar eventos en un calendario mensual/semanal, permitir CRUD y arrastrar/mover eventos.

### Tareas

1. **Instalar y configurar FullCalendar**

   * `npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction`.
   * Incluir estilos básicos de FullCalendar en `globals.css` o en el componente.
2. **Frontend: `src/app/(app)/interactive-calendar/page.tsx`**

   * Importar `<FullCalendar>` y asignar plugins:

     ```tsx
     import FullCalendar from "@fullcalendar/react";
     import dayGridPlugin from "@fullcalendar/daygrid";
     import timeGridPlugin from "@fullcalendar/timegrid";
     import interactionPlugin from "@fullcalendar/interaction";
     // ...
     <FullCalendar
       plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
       initialView="dayGridMonth"
       headerToolbar={{
         left: "prev,next today",
         center: "title",
         right: "dayGridMonth,timeGridWeek,timeGridDay",
       }}
       events={events} // data from API
       editable={true}
       selectable={true}
       select={handleDateSelect}
       eventClick={handleEventClick}
       eventDrop={handleEventDrop}
       eventResize={handleEventResize}
     />
     ```
   * Definir `events` como estado local que se alimenta de `GET /api/events`.
   * Configurar callbacks:

     * `handleDateSelect(info)` → abrir modal para “Crear evento” con `startDate` y `endDate`.
     * `handleEventClick(info)` → abrir modal “Editar evento” con datos pre-llenados.
     * `handleEventDrop(info)` → actualizar fechas del evento (llamar PUT `/api/events/:id`).
     * `handleEventResize(info)` → igual que Drop, pero ajusta duración.
3. **Componente `EventForm.tsx`** (`src/components/calendar/EventForm.tsx`)

   * Campos:

     * Título (input text, requerido).
     * Descripción (textarea).
     * Fecha inicio (`<input type="datetime-local">`).
     * Fecha fin (`<input type="datetime-local">`).
     * Color (selector de paleta).
     * Privacidad (checkbox “Público” / “Privado”).
   * Validar con Zod: `startDate < endDate` y título requerido.
   * Enviar POST o PUT según contexto.
   * Al cerrar modal, refrescar lista de eventos (`react-query.invalidateQueries("events")`).
4. **Integración con backend**

   * Verificar que la API `GET /api/events` retorne un array con formato:

     ```json
     [
       {
         "id": "uuid",
         "title": "Reunión",
         "start": "2025-06-15T10:00:00.000Z",
         "end": "2025-06-15T11:00:00.000Z",
         "color": "#ff0000",
         "isPublic": false
       },
       ...
     ]
     ```
   * Asegurarse de mapear correctamente el campo `color` y `isPublic` para visibilidad.
   * Implementar PUT `/api/events/:id` para actualizar fechas al arrastrar.
5. **Estados de carga y empty state**

   * Mientras carga `events`, renderizar `<Loader />` en lugar del calendario.
   * Si no hay eventos, FullCalendar mostrará el mes vacío y un mensaje: “No hay eventos”.
6. **Permisos y visibilidad**

   * En la lista `events`, filtrar para mostrar solo eventos del usuario o, si `isPublic=true`, mostrar eventos compartidos.
   * Opcional: permitir “compartir enlace” a un evento si es público para que otros lo vean (vista de invitado).
7. **Tests (opcional)**

   * Probar que al crear un evento aparece en el calendario.
   * Probar drag & drop.

> **Criterio de aceptación**:
>
> * El calendario carga eventos desde la API y los muestra correctamente.
> * El usuario puede crear, editar, mover y eliminar eventos con interacciones directas en FullCalendar.
> * No aparece “Muy pronto”. `/interactive-calendar` muestra la UI completa.

---

# Fase 5. Documentos Colaborativos (Collaborative Docs)

**Objetivo**: Implementar la edición en tiempo real de documentos tipo Google Docs, con CRDT (Yjs o Automerge), control de versiones y sincronización entre usuarios conectados.

### Tareas

1. **Decidir biblioteca de CRDT**

   * **Opción A: Yjs**

     * `npm install yjs y-websocket @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor @tiptap/react`
   * **Opción B: Automerge**

     * `npm install automerge react-automerge` (menos frecuente en editores ricos).
   * Aquí asumiremos **Yjs** + **TipTap**.
2. **Backend: servidor WebSocket para Yjs**

   * Crear un servidor WS separado (por ejemplo, `y-websocket server`) que escuche cambios.
   * En `docker-compose.yml`, levantar una instancia `yjs-server:latest` o bien crear un pequeño microservicio:

     ```js
     // y-websocket server (Node.js)
     import { WebsocketProvider } from "y-websocket";
     // Usar un paquete oficial o ejemplo de https://github.com/yjs/y-websocket
     ```
   * Configurar autenticar usuarios en channels privados (puedes usar token JWT de NextAuth).
3. **Modelo de datos en la base (Prisma)**

   * Ya definimos `Doc` y `DocVersion`.
   * Para la versión inicial, permitir crear un nuevo `Doc` con `title`, `ownerId`.
   * Cada vez que haya un cambio significativo (p.ej., al guardar manual o en `onBlur` transcurrido X segundos), snapshotear el estado de la CRDT a JSON y guardarlo en `DocVersion` vía POST a `/api/docs/:id/version`.
4. **Frontend: `src/app/(app)/collaborative-docs/page.tsx`**

   * Importar TipTap y extensiones de colaboración:

     ```tsx
     import { useEditor, EditorContent } from "@tiptap/react";
     import Collaboration from "@tiptap/extension-collaboration";
     import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
     import StarterKit from "@tiptap/starter-kit";
     ```
   * Inicializar editor:

     ```tsx
     const ydoc = new Y.Doc();
     const provider = new WebsocketProvider("wss://tu-dominio.com", docId, ydoc, { params: { token: session?.accessToken } });
     const awareness = provider.awareness;

     const editor = useEditor({
       extensions: [
         StarterKit,
         Collaboration.configure({ document: ydoc }),
         CollaborationCursor.configure({
           provider: provider,
           user: {
             name: session.user.name,
             color: colorRandom(),
           },
         }),
       ],
       content: "",
     });
     ```
   * Mostrar lista de documentos existentes (GET `/api/docs`) y opción “Crear nuevo documento”.
   * Al entrar a un `Doc`, leer metadata, inicializar Yjs con el canal `doc-${id}`.
   * Mostrar lista de colaboradores conectados (awareness states).
   * Barra de herramientas de TipTap con negrita, cursiva, listas, etc.
5. **Control de versiones**

   * Implementar botón “Guardar versión” que:

     * Extrae `ydoc.encodeStateAsUpdate()` o snapshot JSON y lo envía a backend POST `/api/docs/:id/version`.
   * Lista de versiones: GET `/api/docs/:id/versions`, mostrar fecha, usuario que guardó, opción para “Restaurar versión” (reemplaza contenido CRDT con el snapshot).
6. **Test de sincronización**

   * Abrir la misma doc en dos navegadores diferentes con dos cuentas distintas; verificar que aparecen los mismos cambios en tiempo real.
   * Simular desconexión de un cliente y reconexión; comprobar que obtenga el estado actualizado.
7. **Estados de carga y UI vacía**

   * Mientras el editor se inicializa, mostrar un `<Loader />`.
   * Si no hay docs, mostrar un enlace “Crea tu primer documento colaborativo”.

> **Criterio de aceptación**:
>
> * Múltiples usuarios pueden editar el mismo documento en tiempo real sin conflictos.
> * Existe guardado de versiones y posibilidad de restaurarlas.
> * No hay rótulos “Muy pronto”: `/collaborative-docs` está completamente funcional.

---

# Fase 6. Smart-Assist (AI-powered forms)

**Objetivo**: Completar los formularios y la lógica que aprovecha flujos de AI para generar sugerencias de prioridades, recordatorios y horarios de eventos. Implementar los “flows” en `src/flows` y conectarlos a sus respectivos forms en `src/components/smart-assist`.

---

### 6.1. Recordatorios de fechas límite inteligentes

#### 6.1.1. Backend: Lógica AI para recordatorios (`src/flows/intelligent-deadline-reminders.ts`)

1. **Arquitectura del flujo**

   * Este flujo recibe:

     ```ts
     interface DeadlineReminderRequest {
       tasks: Array<{
         id: string;
         title: string;
         dueDate: string; // ISO
         priority: number;
       }>;
       userPreferences: {
         workingHours: { startHour: number; endHour: number };
         timezone: string;
       };
     }
     ```
   * Objetivo: Devolver un set de recordatorios optimizados, p.ej.:

     ```ts
     interface DeadlineReminderResponse {
       reminders: Array<{
         taskId: string;
         remindAt: string; // ISO
         method: "push" | "email";
         message: string;
       }>;
     }
     ```
2. **Implementación**

   * Si usas OpenAI (p. ej. GPT-4o), en el backend crea un helper:

     ```ts
     import OpenAI from "openai";
     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

     export async function computeDeadlineReminders(data: DeadlineReminderRequest): Promise<DeadlineReminderResponse> {
       const prompt = `
       Eres un asistente que programa recordatorios inteligentes para un usuario.
       Tienes esta lista de tareas con sus fechas límite y prioridades:
       ${JSON.stringify(data.tasks, null, 2)}
       Su horario de trabajo es de ${data.userPreferences.workingHours.startHour} a ${data.userPreferences.workingHours.endHour}, zona horaria ${data.userPreferences.timezone}.
       Genera una lista de recordatorios:
       - Para cada tarea, sugiere momento óptimo para recordar (respetando horario laboral).
       - Indica el método: “push” o “email” (prioriza push si la tarea es urgente).
       - Incluye un mensaje breve (máx. 100 caracteres).
       Devuelve un JSON con la estructura de DeadlineReminderResponse.
       `;
       const completion = await openai.chat.completions.create({
         model: "gpt-4o-mini",
         messages: [{ role: "system", content: "Eres un ingeniero de software" }, { role: "user", content: prompt }],
         temperature: 0.2,
       });
       const text = completion.choices[0].message?.content || "";
       return JSON.parse(text) as DeadlineReminderResponse;
     }
     ```
   * Alternativa local sin OpenAI:

     * Ordenar tareas por dueDate y prioridad.
     * Para cada tarea, restar X días/hours según prioridad (p.ej. alta = 2 días antes; media = 3 días; baja = 5 días).
     * Ajustar recordatorio dentro del horario laboral más cercano.
     * Generar `message = "Recordatorio: [Título tarea] vence en [X] horas"`.
3. **Endpoint API** (`src/pages/api/ai/deadline-reminders.ts`)

   ```ts
   import { NextApiRequest, NextApiResponse } from "next";
   import { computeDeadlineReminders } from "../../../flows/intelligent-deadline-reminders";

   export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method !== "POST") return res.status(405).end();
     const user = await getSessionUser(req); // función que obtiene el userId
     const payload = req.body as DeadlineReminderRequest;
     if (!payload?.tasks) return res.status(400).json({ error: "Datos inválidos" });
     try {
       const response = await computeDeadlineReminders(payload);
       return res.status(200).json(response);
     } catch (err) {
       console.error(err);
       return res.status(500).json({ error: "Error interno del servidor" });
     }
   }
   ```

   * Asegurar que `getSessionUser` compruebe que el usuario esté autenticado.

#### 6.1.2. Frontend: Formulario `src/components/smart-assist/intelligent-deadline-reminders-form.tsx`

1. **Estructura del formulario**

   * Recopilar tareas del usuario:

     * Al montar el componente, hacer `GET /api/tasks` para obtener tareas con `dueDate`.
     * Mostrar lista con checkbox para que el usuario seleccione cuáles incluir en el análisis.
   * Permitir ingresar preferencias del usuario:

     * `workingHours.startHour` y `endHour` (selector horario).
     * `timezone` (prellenar con `Intl.DateTimeFormat().resolvedOptions().timeZone`).
   * Botón “Obtener recordatorios inteligentes”.
2. **Integración con API AI**

   * Al hacer submit:

     ```tsx
     const { data, error, isLoading } = useMutation(
       (formValues) => fetch("/api/ai/deadline-reminders", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(formValues),
       }).then(res => res.json()),
       {
         onSuccess: (response) => {
           // Mostrar tabla de recordatorios sugeridos:
           // task title, remindAt (fecha/hora local), método, mensaje.
           setReminders(response.reminders);
         },
       }
     );
     ```
   * Mostrar `<Loader />` mientras `isLoading = true`.
   * Si hay `error`, mostrar alerta.
3. **Visualización de resultados**

   * Tabla responsiva con columnas:

     * Tarea
     * Fecha / Hora de recordatorio (convertir ISO a local con `toLocaleString()`).
     * Método
     * Mensaje
   * Botones junto a cada fila:

     * “Programar en mi calendario” → redirige a la sección de eventos con datos precargados.
     * “Habilitar notificación push” → usa Web Push API para suscribirse.
4. **Guarda recordatorios en base de datos** (opcional)

   * Al presionar “Confirmar todos”, hacer POST a `/api/user-reminders` para almacenar en BD y luego disparar notificaciones (en Next.js usar `next-cron` o similar).
5. **Validación y experiencia de usuario**

   * Validar que el usuario seleccione al menos una tarea.
   * Mostrar error si no hay tareas con dueDate.
   * Deshabilitar botón de submit si `isLoading`.
6. **Tests (opcional)**

   * Simular payload y respuesta de AI para revisar que la tabla se renderiza correctamente.
   * Probar validaciones: sin tareas seleccionadas, sin rango horario seleccionado, etc.

> **Criterio de aceptación**:
>
> * El formulario obtiene tareas, envía datos al backend y muestra recordatorios.
> * No aparece “Muy pronto” en `/smart-assist/deadline-reminders`.
> * Los botones “Programar” e “Habilitar notificación” funcionan (o al menos abren el modal de actividad correspondiente).

---

### 6.2. Priorización inteligente de tareas

#### 6.2.1. Backend: Lógica AI (`src/flows/smart-task-prioritization.ts`)

1. **Definir input y output**

   * **Input** (`TaskPrioritizationRequest`):

     ```ts
     {
       tasks: Array<{
         id: string;
         title: string;
         dueDate: string;
         estimatedEffort: number; // ej. en horas
         importance: number; // escala 1–5
         dependencies?: string[]; // ids de tareas que deben completarse antes
       }>;
       constraints: {
         dailyWorkingHours: number; // p.ej. 8
         workingDays: string[]; // ["Mon", "Tue", ...]
       };
     }
     ```
   * **Output** (`TaskPrioritizationResponse`):

     ```ts
     {
       prioritizedTasks: Array<{
         id: string;
         recommendedStart: string;
         recommendedEnd: string;
         rank: number; // 1 = más urgencia
         suggestion: string;
       }>;
     }
     ```
2. **Implementación AI**

   * Construir prompt similar al anterior:

     ```
     Eres un asistente que ordena tareas para un usuario, considerando fechas límite, esfuerzo estimado e importancia.
     Aquí la lista: ...
     Considera que el usuario trabaja X horas diarias, ciertos días a la semana.
     Genera una programación priorizada con horas de inicio y fin propuestas para cada tarea, junto a un rank y sugerencia breve.
     ```
   * Llamada a OpenAI con temperatura baja (`0.2`) y parsear JSON.
   * Manejar posibles errores de parseo (usar `try { JSON.parse(...) } catch { ... }`).
3. **Endpoint API** (`/api/ai/task-prioritization`)

   * Similar estructura al anterior, pero invoca `computeTaskPrioritization`.

#### 6.2.2. Frontend: Formulario `smart-task-prioritization-form.tsx`

1. **Estructura de UI**

   * Mostrar lista de tareas (obtenidas de `/api/tasks`) junto con campos adicionales:

     * `estimatedEffort` (input numérico).
     * `importance` (selector 1–5, estrellas o dropdown).
     * `dependencies` (selector múltiple de tareas).
   * Campos de configuración de usuario:

     * Horas de trabajo por día (input numérico).
     * Días laborables (checkbox: Lun, Mar, Mié, etc.).
   * Botón “Calcular priorización inteligente”.
2. **Llamada a API AI**

   * Al enviar, reunir la estructura de `TaskPrioritizationRequest` y hacer POST a `/api/ai/task-prioritization`.
   * Mientras carga, mostrar `<Loader />`.
3. **Mostrar resultados**

   * Tabla con columnas:

     * Tarea
     * Fecha inicio sugerida
     * Fecha fin sugerida
     * Rank
     * Sugerencia
   * Botón “Agendar en calendario” para cada tarea (mismos pasos que en Fase 6.1).
   * Botón “Copiar a lista de tareas” que crea o actualiza una tarea en `/api/tasks` con campos de fecha de inicio y fin.
4. **Validaciones**

   * Al menos una tarea seleccionada.
   * `estimatedEffort` y `importance` válidos.
   * Al menos un día de trabajo marcado.
5. **Persistencia (opcional)**

   * Permitir guardar la “planificación” generada como un “Plan de trabajo” en la base de datos para futuras referencias:

     * Crear modelo `TaskPlan { id, userId, name, createdAt, tasksSchedule: Json }`.

> **Criterio de aceptación**:
>
> * `/smart-assist/task-prioritization` muestra el formulario y, al enviar, arroja resultados.
> * No queda “Muy pronto”.
> * El arreglo de tareas propuestas concuerda con criterios básicos (fecha límite, esfuerzo, importancia).

---

### 6.3. Programación inteligente de eventos

#### 6.3.1. Backend: Lógica AI (`src/flows/smart-event-scheduling.ts`)

1. **Definir input/output**

   * **Input** (`EventSchedulingRequest`):

     ```ts
     {
       userConstraints: {
         availableSlots: Array<{
           date: string; // día
           startHour: number;
           endHour: number;
         }>;
         duration: number; // en horas
         attendees: number;
         priority: number; // 1–5
       };
       eventPreferences: {
         title: string;
         description?: string;
         dateRange: { start: string; end: string };
         locationPreference?: string;
       };
     }
     ```
   * **Output** (`EventSchedulingResponse`):

     ```ts
     {
       suggestions: Array<{
         date: string;
         startTime: string;
         endTime: string;
         score: number; // 0–1, 1 = óptimo
         note: string; // e.g., “Evita sobreposición con reunión de equipo.”
       }>;
     }
     ```
2. **Implementación**

   * Prompt:

     ```
     Eres un asistente que programa eventos para un usuario. El usuario dispone de estos rangos de tiempo: ...
     Quiere agendar un evento de [duration] horas con prioridad [priority].
     Sugiere hasta 3 fechas/hora óptimas en el rango [startRange] a [endRange], considera número de asistentes.
     Devuelve JSON con estructura de EventSchedulingResponse.
     ```
   * Llamada a OpenAI o heurística local:

     * Heurística:

       1. Listar todos los huecos libres en `availableSlots`.
       2. Para cada hueco, dividir en bloques de `duration`.
       3. Calcular score según cercanía a la fecha ideal, menor fragmentación de horario, etc.
       4. Devolver los 3 mejores.
3. **Endpoint API** (`/api/ai/event-scheduling`)

   * Igual que anteriores.

#### 6.3.2. Frontend: Formulario `smart-event-scheduling-form.tsx`

1. **UI Inicial**

   * Pedir inputs:

     * Fecha rango: dos campos `date` (inicio y fin).
     * Duración (horas).
     * Número de asistentes (input numérico).
     * Prioridad (1–5).
     * Mostrar calendarios con slots disponibles (obtenidos de `/api/events` y `/api/tasks` para ver huecos).
     * Botón “Calcular horarios sugeridos”.
2. **Llamada a API AI**

   * Enviar estructura de `EventSchedulingRequest` a `/api/ai/event-scheduling`.
   * Mientras `isLoading`, mostrar `<Loader />`.
3. **Presentación de sugerencias**

   * Tabla o cards con:

     * Fecha / Hora sugerida (human-friendly).
     * Score o calificación.
     * Nota explicativa.
     * Botón “Agendar este horario” → crea un nuevo evento en `/api/events`.
4. **Validaciones**

   * `startDate < endDate`.
   * `duration` > 0 y <= máximo permitido (p. ej. 8 horas).
   * `attendees` > 0.
5. **Persistencia (opcional)**

   * Guardar la “sugerencia” dentro de un modelo `EventSuggestion { id, userId, eventId?, suggestionData: Json }` para que el usuario compare luego.

> **Criterio de aceptación**:
>
> * `/smart-assist/event-scheduling` muestra el formulario, devuelve sugerencias y permite agendar directamente.
> * No hay “Muy pronto”.

---

# Fase 7. Sincronización en tiempo real (Sync)

**Objetivo**: Completar la página `/sync` para sincronizar datos (tareas, eventos, docs) entre múltiples dispositivos/ventanas. Esto implica WebSockets para push de cambios, reconciliación si hay conflictos y UI que muestre estado de sincronización.

### Tareas

1. **Frontend: `src/app/(app)/sync/page.tsx`**

   * UI básica:

     * Botón “Iniciar sincronización” (o inicia automáticamente al cargar).
     * Indicador de estado: “Conectado” / “Desconectado” / “Sincronizando…” (usando un círculo verde, rojo o amarillo).
     * Log de eventos de sincronización (último cambio recibido / enviado).
   * Conectar a WebSocket (usando Socket.IO o WS nativo) en `useEffect`:

     ```tsx
     const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
       auth: { token: session?.accessToken },
     });
     socket.on("connect", () => setStatus("connected"));
     socket.on("disconnect", () => setStatus("disconnected"));
     socket.on("task-updated", (data) => {
       // Invalidate react-query: invalidateQueries("tasks")
     });
     socket.on("event-updated", (data) => {
       invalidateQueries("events");
     });
     socket.on("doc-updated", (data) => {
       invalidateQueries(["doc", data.docId]);
     });
     ```
   * Botones para “Envío manual” (trigger manual de sincronización) y “Cancelar sincronización” (desconectar socket).
2. **Backend: emitir eventos en tiempo real**

   * En cada endpoint CRUD (por ejemplo, POST `/api/tasks`), después de crear/actualizar la tarea, emitir a canal de WebSocket:

     ```ts
     import { io } from "../../lib/socket"; // instancia de Socket.IO
     // Tras crear task:
     io.to(`user-${userId}`).emit("task-updated", { taskId: newTask.id });
     ```
   * En el servidor, en `onConnection`, unir al socket al room `user-${userId}` (obtenido del token JWT).
3. **Manejo de conflictos**

   * Simple: el backend acepta el último cambio “last write wins”.
   * Opcional:

     * Mantener un campo `updatedAt` en cada modelo.
     * Si un cliente intenta actualizar una entidad con `updatedAt` antiguo, rechazar y forzar refetch.
   * Mostrar alerta en frontend si hay conflicto: “Tu cambio no pudo aplicarse, actualiza para ver la última versión.”
4. **Estado de UI**

   * Mostrar contador de “Cambios pendientes por sincronizar” (estado local).
   * Si se pierde conexión, habilitar un banner: “Conexión perdida. Reintentando en X segundos…”.
5. **Pruebas de conectividad**

   * Abrir dos pestañas, en una crear/editar tarea, verificar que la otra pestaña despliegue cambio sin recargar.
   * Mismo para eventos y documentos:

     * Para docs, también se envíe mensaje “doc-updated” al guardar snapshot.
6. **Optimización opcional**

   * Agrupar cambios en un solo mensaje si ocurren en ráfaga (debounce).
   * Implementar un algoritmo reconect que aumente el intervalo de reintento (backoff exponencial).

> **Criterio de aceptación**:
>
> * `/sync` muestra el estado de conexión y logs.
> * Los cambios hechos en una ventana se reflejan instantáneamente en la otra sin recargar.
> * No aparecen “Muy pronto”.

---

# Fase 8. Dashboard principal

**Objetivo**: Crear una vista de inicio (`/dashboard`) que consolide información clave de tareas, eventos, documentos y métricas básicas (por ejemplo, número de tareas pendientes, próximos eventos, documentos recientes).

### Tareas

1. **Diseño de la UI** (`src/app/(app)/dashboard/page.tsx`)

   * Sección de “Tareas pendientes”:

     * Mostrar los 5 primeros tasks con estado “pending” (GET `/api/tasks?status=pending&limit=5`).
     * Botón “Ver todas” que redirige a `/task-list`.
   * Sección de “Próximos eventos”:

     * Consultar `/api/events?start>now&limit=5&order=startDate asc`.
     * Mostrar título, fecha y tiempo restante.
     * Botón “Ver calendario” (/interactive-calendar).
   * Sección de “Documentos recientes”:

     * GET `/api/docs?order=updatedAt desc&limit=5`.
     * Mostrar título, última edición y nombre del editor que guardó la última versión.
     * Botón “Ver todos los documentos” (/collaborative-docs).
   * Sección “Smart-Assist rápido”:

     * Botones para ir a cada formulario:

       * “Recordatorio inteligente”
       * “Priorización de tareas”
       * “Programar evento”
   * Tarjetas de métricas generales (KPIs):

     * Total de tareas
     * Tareas completadas este mes
     * Total de eventos agendados para la semana
     * Total de documentos creados
   * Diseño responsivo: en desktop un grid de 2×2 o 3 tarjetas horizontales, en móvil stack vertical.
2. **Implementación técnica**

   * Usar **React Query** para hacer `useQueries` paralelos:

     ```ts
     const tasksQuery = useQuery(["tasks", { status: "pending", limit: 5 }], fetchTasks);
     const eventsQuery = useQuery(["events", { upcoming: true, limit: 5 }], fetchEvents);
     const docsQuery = useQuery(["docs", { order: "updatedAt", limit: 5 }], fetchDocs);
     const metricsQuery = useQuery("metrics", fetchDashboardMetrics);
     ```
   * `fetchDashboardMetrics` (endpoint `/api/metrics`) suma counts:

     * `countTasks`: `SELECT COUNT(*) FROM Task WHERE userId = ?`.
     * `countTasksCompletedThisMonth`: filtrar por `status="done"` y `updatedAt` en mes actual.
     * `countEventsThisWeek`: filtrar `startDate` entre lunes y viernes de la semana actual.
     * `countDocs`: total docs del usuario.
   * Cada sección maneja sus estados de carga con `<Loader />`.
3. **Backend: Endpoint `/api/metrics`**

   * Crear handler en Next.js o nest:

     ```ts
     export default async function handler(req, res) {
       const user = await getSessionUser(req);
       const countTasks = await prisma.task.count({ where: { userId: user.id } });
       const countTasksCompletedThisMonth = await prisma.task.count({
         where: {
           userId: user.id,
           status: "done",
           updatedAt: {
             gte: startOfMonth(new Date()),
             lt: endOfMonth(new Date()),
           },
         },
       });
       const countEventsThisWeek = await prisma.event.count({
         where: {
           userId: user.id,
           startDate: {
             gte: startOfWeek(new Date()),
             lt: endOfWeek(new Date()),
           },
         },
       });
       const countDocs = await prisma.doc.count({ where: { ownerId: user.id } });
       res.status(200).json({ countTasks, countTasksCompletedThisMonth, countEventsThisWeek, countDocs });
     }
     ```
   * Instalar librería `date-fns` para cálculos de fechas (`startOfMonth`, `endOfWeek`, etc.).
4. **Pruebas visuales**

   * Verificar que los números reflejan datos reales (crear tareas/eventos/docs y refrescar).
   * Asegurar que al hacer click en “Ver todas” navega correctamente.
5. **Estilos**

   * Utilizar **Tailwind** para tarjetas (border, sombra suave, padding, rounded-xl).
   * Iconos con **lucide-react** o **Heroicons**:

     * Tareas: icono de lista.
     * Eventos: icono de calendario.
     * Documentos: icono de documento.
   * Animaciones ligeras con **Framer Motion** al entrar al dashboard (fade-in, slide-up).

> **Criterio de aceptación**:
>
> * `/dashboard` muestra todas las secciones con datos en tiempo real.
> * Navegación a secciones funciona sin “Esperando…” o placeholders permanentes.

---

# Fase 9. Ajustes de UI/UX y pulido final

**Objetivo**: Revisar detalles de interacción, accesibilidad, performance y pulir lo que quede “muy pronto” o placeholder en componentes de UI, mensajes de error, estados vacíos, etc.

### Tareas

1. **Estados vacíos (“Empty states”)**

   * En cada sección, si no hay datos:

     * **Tasks**: “No tienes tareas. Crea tu primera tarea.”
     * **Calendar**: “No has agendado eventos. Agrega uno nuevo.”
     * **Docs**: “No has creado documentos. Empieza ahora.”
     * **Dashboard**: Si todo está vacío, mostrar un mensaje “Comienza a usar tu espacio de trabajo creando tu primera tarea, evento y documento”.
   * Añadir un botón destacado “Crear ahora” en cada estado vacío.
2. **Manejo de errores**

   * Global: Capturar errores no atrapados y mostrar un toast genérico: “Ocurrió un error. Inténtalo de nuevo.”
   * Formularios: Mensajes inline (por ejemplo, debajo del campo con borde rojo).
3. **Accesibilidad (A11y)**

   * Verificar que todos los botones e inputs tengan `aria-label` o `aria-describedby` donde sea necesario.
   * Contraste suficiente de colores (〈WCAG 2.1〉).
   * Navegación por teclado:

     * Tab order lógico (del header a menú lateral a contenido).
     * En modals, el foco debe quedarse dentro del modal (“focus trap”).
4. **Temas y personalización**

   * Implementar toggle de tema claro/oscuro:

     * Guardar preferencia en `localStorage`.
     * En `layout.tsx`, leer el tema y aplicar clase `dark` a `<html>`.
   * Proveer un switch en el header o en el menú.
5. **Experiencia móvil**

   * Verificar responsividad:

     * Menú colapsable con “hamburger” en pantallas < 768px.
     * Ajustar grids: de 3 columnas a 1 columna según ancho.
     * Formularios de Smart-Assist adaptados en móvil (scroll, inputs grandes).
6. **Performance**

   * Dividir código (“code splitting”):

     * Lazy-load de componentes pesados (FullCalendar, TipTap) usando `dynamic()` de Next.js con SSR deshabilitado.
     * Verificar que el bundle JS no supere cierto límite (por ejemplo, < 150 KB gzip).
   * Optimizar imágenes (avatars de usuarios, íconos) usando `<Image>` de Next.js.
   * Hacer caching de queries con `staleTime` adecuado (p. ej. 60 s en datos no muy críticos).
7. **Documentación de componentes y flujos**

   * Completar `docs/blueprint.md` con diagramas de alto nivel:

     * Arquitectura de tech stack (Next.js, Prisma, Yjs, FullCalendar).
     * Esquema de base de datos (ERD simple).
     * Flujo de Smart-Assist (diagrama de llamada API).
   * Añadir comentarios JSDoc en funciones complejas (por ejemplo, en los “flows”).
   * Generar Storybook para componentes críticos (TaskItem, EventForm, TipTapEditor).
8. **Pruebas finales y correcciones**

   * Recorrer cada ruta manualmente:

     * `/dashboard`
     * `/task-list`
     * `/interactive-calendar`
     * `/collaborative-docs`
     * `/smart-assist/*`
     * `/sync`
   * Verificar que no queden mensajes “Muy pronto” ni placeholders.
   * Log de errores en consola limpio (sin warnings).
   * Hacer checklist de QA: performance, accesibilidad, mobile-friendly, tests unitarios pasados.

> **Criterio de aceptación**:
>
> * El producto está listo para producción: no hay rótulos “Muy pronto” ni funcionalidades bloqueadas.
> * Cumple con estándares de accesibilidad y performance.
> * Documentación interna suficiente para un tercero que quiera mantener o desplegar el código.

---

# Fase 10. Despliegue y entrega

**Objetivo**: Preparar el proyecto para su despliegue en producción, asegurando escalabilidad, monitorización, seguridad y automatización.

### Tareas

1. **Dockerización**  
   - Crear `Dockerfile.backend` y `Dockerfile.frontend` para producción.  
   - Validar imágenes locales con `docker build` y `docker run`.
2. **Orquestación**  
   - Definir y probar `docker-compose.yml` con servicios: PostgreSQL, Redis, Yjs, backend y frontend.
   - Configurar variables en `.env.production`.
3. **CI/CD**  
   - Añadir workflow de GitHub Actions para lint, tests y build.  
   - Workflow de despliegue: build de imágenes, push a registry y despliegue automático.
4. **Monitorización y logs**  
   - Integrar Sentry en frontend y backend.  
   - Enviar logs a un servicio externo (Datadog, Loggly, Papertrail).
5. **Backups y recuperación**  
   - Programar snapshots de base de datos y guardado de dumps de Redis.  
   - Documentar proceso de restauración.
6. **Seguridad y HTTPS**  
   - Configurar certificados TLS (Let's Encrypt).  
   - Forzar redirección HTTP→HTTPS y definir headers de seguridad.
7. **Documentación**  
   - Actualizar `README.md` y `docs/production-deployment-guide.md` con pasos de despliegue.  
   - Añadir diagrama en `docs/blueprint.md`.

> **Criterio de aceptación**:
> - `docker-compose up --build -d` inicia todos los servicios sin errores.
> - CI/CD ejecuta lint, tests y publica imágenes automáticamente en `main`.
> - El dominio de producción carga en HTTPS sin placeholders ni errores.

---

# Fase 11. Mantenimiento y evolución

**Objetivo**: Establecer un proceso sólido de monitorización continua, feedback de usuarios y roadmap de mejoras.

### Tareas

1. **Monitoreo continuo**  
   - Configurar dashboards de métricas (CPU, memoria, latencia) en Grafana/Datadog.  
   - Definir alertas para errores críticos y degradación de performance.
2. **Feedback y soporte**  
   - Integrar herramienta de feedback in-app (p.ej. Hotjar, Userback).  
   - Crear canal de soporte y registro de incidencias.
3. **Ciclo de releases**  
   - Establecer branch strategy (GitFlow, trunk-based).  
   - Documentar proceso de release con changelog y versión semántica.
4. **Roadmap de producto**  
   - Recolectar peticiones de usuarios y priorizarlas con matriz RICE.  
   - Planificar iteraciones de nuevas funcionalidades y mejoras.
5. **Auditoría de seguridad y compliance**  
   - Programar revisiones de dependencias (Dependabot, Snyk).  
   - Verificar cumplimiento de normativas (GDPR, WCAG continuo).
6. **Optimización y escalabilidad**  
   - Revisar patrones de cache y CDN.  
   - Planificar escalado horizontal de servicios críticos.

> **Criterio de aceptación**:
> - Existen pipelines de monitorización y alertas configuradas.
> - Proceso de feedback y soporte documentado y activo.
> - Roadmap con prioridades claro y versionado semántico implementado.
````
