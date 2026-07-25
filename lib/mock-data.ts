import type { Activity, AiInsight, CalendarEvent, Client, Document, Estimate, Project, ProjectPhoto, Receipt, Report, Task } from "./types";

export const projects: Project[] = [
  {
    id: "1",
    name: "Torre Residencial Norte",
    location: "Monterrey, MX",
    status: "in_progress",
    progress: 68,
    budget: 4200000,
    spent: 2650000,
    deadline: "2026-11-15",
    teamSize: 42,
  },
  {
    id: "2",
    name: "Centro Comercial Plaza Sur",
    location: "Guadalajara, MX",
    status: "planning",
    progress: 22,
    budget: 8900000,
    spent: 980000,
    deadline: "2027-03-01",
    teamSize: 28,
  },
  {
    id: "3",
    name: "Remodelación Hospital Central",
    location: "CDMX, MX",
    status: "in_progress",
    progress: 45,
    budget: 3100000,
    spent: 1420000,
    deadline: "2026-09-30",
    teamSize: 35,
  },
  {
    id: "4",
    name: "Puente Vial Este",
    location: "Puebla, MX",
    status: "on_hold",
    progress: 31,
    budget: 5600000,
    spent: 1750000,
    deadline: "2027-01-20",
    teamSize: 19,
  },
];

export const aiInsights: AiInsight[] = [
  {
    id: "1",
    title: "Riesgo de retraso en cimentación",
    description:
      "El proyecto Torre Residencial Norte tiene un 73% de probabilidad de retraso de 2 semanas por lluvias previstas.",
    priority: "high",
    projectId: "1",
  },
  {
    id: "2",
    title: "Optimización de materiales",
    description:
      "Consolidar pedidos de acero para Plaza Sur podría ahorrar $48,000 USD este mes.",
    priority: "medium",
    projectId: "2",
  },
  {
    id: "3",
    title: "Personal insuficiente",
    description:
      "Hospital Central necesita 4 electricistas adicionales para cumplir el hito de julio.",
    priority: "high",
    projectId: "3",
  },
];

export const recentActivity: Activity[] = [
  {
    id: "1",
    message: "Inspección de estructura aprobada — Torre Residencial Norte",
    time: "Hace 2 horas",
    type: "milestone",
  },
  {
    id: "2",
    message: "Alerta: presupuesto al 84% en Hospital Central",
    time: "Hace 4 horas",
    type: "alert",
  },
  {
    id: "3",
    message: "Planos actualizados subidos por Carlos M.",
    time: "Hace 6 horas",
    type: "update",
  },
  {
    id: "4",
    message: "Nuevo contratista asignado a Plaza Sur",
    time: "Ayer",
    type: "update",
  },
];

export const dashboardStats = {
  activeProjects: projects.filter((p) => p.status === "in_progress").length,
  totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
  totalSpent: projects.reduce((sum, p) => sum + p.spent, 0),
  avgProgress: Math.round(
    projects.reduce((sum, p) => sum + p.progress, 0) / projects.length,
  ),
  teamMembers: projects.reduce((sum, p) => sum + p.teamSize, 0),
  criticalAlerts: aiInsights.filter((i) => i.priority === "high").length,
};

export const clients: Client[] = [
  {
    id: "1",
    name: "Roberto Sánchez",
    company: "Inmobiliaria del Norte SA",
    email: "roberto@inmobiliarianorte.mx",
    phone: "+52 81 1234 5678",
    projectsCount: 2,
  },
  {
    id: "2",
    name: "María González",
    company: "Grupo Comercial Sur",
    email: "maria@gruposur.mx",
    phone: "+52 33 9876 5432",
    projectsCount: 1,
  },
  {
    id: "3",
    name: "Dr. Alejandro Ruiz",
    company: "Hospital Central CDMX",
    email: "aruiz@hospitalcentral.mx",
    phone: "+52 55 4567 8901",
    projectsCount: 1,
  },
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Inspección de estructura",
    date: "2026-07-28",
    project: "Torre Residencial Norte",
    type: "inspection",
  },
  {
    id: "2",
    title: "Entrega de planos revisados",
    date: "2026-07-30",
    project: "Centro Comercial Plaza Sur",
    type: "delivery",
  },
  {
    id: "3",
    title: "Reunión con cliente",
    date: "2026-08-02",
    project: "Remodelación Hospital Central",
    type: "meeting",
  },
  {
    id: "4",
    title: "Inicio: instalación eléctrica",
    date: "2026-08-05",
    project: "Remodelación Hospital Central",
    type: "start",
  },
];

export const documents: Document[] = [
  {
    id: "1",
    name: "Planos estructura v3.pdf",
    project: "Torre Residencial Norte",
    type: "plano",
    updatedAt: "2026-07-24",
    size: "4.2 MB",
  },
  {
    id: "2",
    name: "Contrato principal.pdf",
    project: "Centro Comercial Plaza Sur",
    type: "contrato",
    updatedAt: "2026-07-20",
    size: "1.8 MB",
  },
  {
    id: "3",
    name: "Permiso de construcción.pdf",
    project: "Remodelación Hospital Central",
    type: "permiso",
    updatedAt: "2026-07-15",
    size: "890 KB",
  },
  {
    id: "4",
    name: "Reporte avance julio.pdf",
    project: "Torre Residencial Norte",
    type: "reporte",
    updatedAt: "2026-07-22",
    size: "2.1 MB",
  },
];

export const reports: Report[] = [
  {
    id: "1",
    title: "Reporte mensual — Julio 2026",
    period: "Jul 2026",
    project: "Torre Residencial Norte",
    status: "published",
    createdAt: "2026-07-22",
  },
  {
    id: "2",
    title: "Análisis presupuestario Q2",
    period: "Q2 2026",
    project: "Todos los proyectos",
    status: "published",
    createdAt: "2026-07-01",
  },
  {
    id: "3",
    title: "Reporte de riesgos — Agosto",
    period: "Ago 2026",
    project: "Remodelación Hospital Central",
    status: "draft",
    createdAt: "2026-07-25",
  },
];

export const estimates: Estimate[] = [
  {
    id: "1",
    title: "Cimentación y estructura — Fase 1",
    project: "Torre Residencial Norte",
    client: "Inmobiliaria del Norte SA",
    amount: 850000,
    status: "approved",
    createdAt: "2026-07-10",
  },
  {
    id: "2",
    title: "Acabados interiores — Local 1-20",
    project: "Centro Comercial Plaza Sur",
    client: "Grupo Comercial Sur",
    amount: 1200000,
    status: "sent",
    createdAt: "2026-07-18",
  },
  {
    id: "3",
    title: "Instalación eléctrica completa",
    project: "Remodelación Hospital Central",
    client: "Hospital Central CDMX",
    amount: 420000,
    status: "draft",
    createdAt: "2026-07-24",
  },
];

export const receipts: Receipt[] = [
  {
    id: "1",
    vendor: "Aceros Monterrey",
    project: "Torre Residencial Norte",
    amount: 34500,
    category: "Materiales",
    date: "2026-07-23",
    status: "approved",
  },
  {
    id: "2",
    vendor: "Rentas Maquinaria SA",
    project: "Centro Comercial Plaza Sur",
    amount: 12800,
    category: "Equipo",
    date: "2026-07-24",
    status: "pending",
  },
  {
    id: "3",
    vendor: "Ferretería Central",
    project: "Remodelación Hospital Central",
    amount: 4200,
    category: "Materiales",
    date: "2026-07-25",
    status: "pending",
  },
];

export const upcomingTasks: Task[] = [
  {
    id: "1",
    title: "Review steel delivery order",
    project: "Torre Residencial Norte",
    dueDate: "2026-07-28",
    priority: "high",
  },
  {
    id: "2",
    title: "Client meeting — budget update",
    project: "Centro Comercial Plaza Sur",
    dueDate: "2026-07-30",
    priority: "medium",
  },
  {
    id: "3",
    title: "Electrical inspection prep",
    project: "Remodelación Hospital Central",
    dueDate: "2026-08-02",
    priority: "high",
  },
  {
    id: "4",
    title: "Submit permit renewal",
    project: "Puente Vial Este",
    dueDate: "2026-08-05",
    priority: "low",
  },
];

export const recentPhotos: ProjectPhoto[] = [
  {
    id: "1",
    project: "Torre Residencial Norte",
    caption: "Floor 12 concrete pour",
    date: "2026-07-24",
    gradient: "from-amber-400 to-orange-600",
  },
  {
    id: "2",
    project: "Centro Comercial Plaza Sur",
    caption: "Foundation excavation",
    date: "2026-07-23",
    gradient: "from-zinc-500 to-zinc-800",
  },
  {
    id: "3",
    project: "Remodelación Hospital Central",
    caption: "Electrical rough-in",
    date: "2026-07-22",
    gradient: "from-blue-400 to-indigo-600",
  },
  {
    id: "4",
    project: "Torre Residencial Norte",
    caption: "Steel frame assembly",
    date: "2026-07-21",
    gradient: "from-emerald-400 to-teal-600",
  },
];

export const activeProjects = projects.filter(
  (p) => p.status === "in_progress" || p.status === "planning",
);
