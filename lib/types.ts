export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed";

export type Project = {
  id: string;
  name: string;
  location: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  spent: number;
  deadline: string;
  teamSize: number;
};

export type AiInsight = {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  projectId: string;
};

export type Activity = {
  id: string;
  message: string;
  time: string;
  type: "update" | "alert" | "milestone";
};

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  projectsCount: number;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  project: string;
  type: "inspection" | "delivery" | "meeting" | "deadline";
};

export type Document = {
  id: string;
  name: string;
  project: string;
  type: "plano" | "contrato" | "permiso" | "reporte";
  updatedAt: string;
  size: string;
};

export type Report = {
  id: string;
  title: string;
  period: string;
  project: string;
  status: "draft" | "published";
  createdAt: string;
};

export type Estimate = {
  id: string;
  title: string;
  project: string;
  client: string;
  amount: number;
  status: "draft" | "sent" | "approved" | "rejected";
  createdAt: string;
};

export type Receipt = {
  id: string;
  vendor: string;
  project: string;
  amount: number;
  category: string;
  date: string;
  status: "pending" | "approved" | "rejected";
};

export type Task = {
  id: string;
  title: string;
  project: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
};

export type ProjectPhoto = {
  id: string;
  project: string;
  caption: string;
  date: string;
  gradient: string;
};
