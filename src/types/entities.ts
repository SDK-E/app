export interface Company {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  companyId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Request {
  id: string;
  companyId: string;
  title: string;
  description: string;
  status: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  companyId: string;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  companyId: string;
  projectId: string;
  name: string;
  dueDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  companyId: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
