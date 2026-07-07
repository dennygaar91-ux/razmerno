import type { CustomerOrderStatus } from "./customerOrderStatus";

export type CustomerWorkspaceProfile = {
  fullName: string;
  email: string;
  phone: string | null;
};

export type CustomerWorkspaceProject = {
  id: string;
  title: string;
  furnitureType: string | null;
  updatedAt: string;
  previewPath: string | null;
};

export type CustomerWorkspaceOrder = {
  id: string;
  publicOrderNumber: string | null;
  status: CustomerOrderStatus;
  createdAt: string;
  totalPrice: number;
  customerName: string;
  deliveryAddress: string | null;
};

export type CustomerWorkspaceStats = {
  activeProjects: number;
  orders: number;
};

export type CustomerWorkspace = {
  profile: CustomerWorkspaceProfile;
  projects: CustomerWorkspaceProject[];
  orders: CustomerWorkspaceOrder[];
  stats: CustomerWorkspaceStats;
};

export type CustomerWorkspaceApiResult =
  | { ok: true; data: CustomerWorkspace }
  | { ok: false; message: string; status?: number };
