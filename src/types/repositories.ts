import type { Company, User, Request, Project, Milestone, Document, Message, Invoice } from "./entities";

export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: string, data: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface CompanyScopedRepository<T> extends Repository<T> {
  findByCompany(companyId: string): Promise<T[]>;
}

export type CompanyRepository = CompanyScopedRepository<Company>;
export type UserRepository = CompanyScopedRepository<User>;
export type RequestRepository = CompanyScopedRepository<Request>;
export type ProjectRepository = CompanyScopedRepository<Project>;
export type MilestoneRepository = CompanyScopedRepository<Milestone>;
export type InvoiceRepository = CompanyScopedRepository<Invoice>;
export type DocumentRepository = Repository<Document>;
export type MessageRepository = Repository<Message>;
