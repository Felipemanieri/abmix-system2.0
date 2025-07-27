import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Tabela de usuários do sistema (todos os painéis)
export const systemUsers = pgTable("system_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin', 'supervisor', 'financial', 'implementation', 'vendor', 'client'
  panel: text("panel").notNull(), // 'restricted', 'supervisor', 'financial', 'implementation', 'vendor', 'client'
  active: boolean("active").notNull().default(true),
  last_login: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull().default("120784"),
  role: text("role").notNull().default("vendor"),
  active: boolean("active").notNull().default(true),
  last_login: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVendorSchema = createInsertSchema(vendors).pick({
  name: true,
  email: true,
  password: true,
  role: true,
  active: true,
});

export const insertSystemUserSchema = createInsertSchema(systemUsers).pick({
  name: true,
  email: true,
  password: true,
  role: true,
  panel: true,
  active: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertSystemUser = z.infer<typeof insertSystemUserSchema>;
export type SystemUser = typeof systemUsers.$inferSelect;

// Proposals table
export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().notNull(),
  abmId: varchar("abm_id"),
  vendorId: integer("vendor_id").references(() => vendors.id),
  clientToken: varchar("client_token").unique().notNull(),
  contractData: jsonb("contract_data").notNull(),
  titulares: jsonb("titulares").default(sql`'[]'::jsonb`),
  dependentes: jsonb("dependentes").default(sql`'[]'::jsonb`),
  internalData: jsonb("internal_data").default(sql`'{}'::jsonb`),
  vendorAttachments: jsonb("vendor_attachments").default(sql`'[]'::jsonb`),
  clientAttachments: jsonb("client_attachments").default(sql`'[]'::jsonb`),
  clientCompleted: boolean("client_completed").default(false),
  status: varchar("status").default("observacao"),
  priority: varchar("priority").default("medium"),
  // NOVOS CAMPOS PARA INTEGRAÇÃO GOOGLE DRIVE
  driveFolder: text("drive_folder"), // Link da pasta no Google Drive
  folderName: text("folder_name"), // Nome editável da pasta
  driveFolderId: text("drive_folder_id"), // ID interno da pasta no Drive
  observacaoFinanceira: text("observacao_financeira"), // Observação do Portal Financeiro
  observacaoSupervisor: text("observacao_supervisor"), // Observação do Portal Supervisor
  observacaoImplementacao: text("observacao_implementacao"), // Observação do Portal Implementação
  documentosRecebidos: jsonb("documentos_recebidos").default(sql`'{}'::jsonb`), // Documentos marcados como recebidos pelo vendedor
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProposalSchema = createInsertSchema(proposals);
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

// Metas individuais dos vendedores
export const vendorTargets = pgTable("vendor_targets", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  targetValue: text("target_value").notNull(),
  targetProposals: integer("target_proposals").notNull(),
  bonus: text("bonus").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Metas de equipe
export const teamTargets = pgTable("team_targets", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  targetValue: text("target_value").notNull(),
  targetProposals: integer("target_proposals").notNull(),
  teamBonus: text("team_bonus").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Premiações e incentivos
export const awards = pgTable("awards", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  title: text("title").notNull(),
  description: text("description"),
  value: text("value").notNull(),
  targetValue: text("target_value"), // Campo para valor da meta
  type: text("type").notNull(), // 'monetary', 'recognition', 'bonus'
  dateAwarded: timestamp("date_awarded").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorTargetSchema = createInsertSchema(vendorTargets);

// Configurações globais do sistema removidas daqui - definição moved below
export const insertTeamTargetSchema = createInsertSchema(teamTargets);
export const insertAwardSchema = createInsertSchema(awards);

export type InsertVendorTarget = z.infer<typeof insertVendorTargetSchema>;
export type VendorTarget = typeof vendorTargets.$inferSelect;
export type InsertTeamTarget = z.infer<typeof insertTeamTargetSchema>;
export type TeamTarget = typeof teamTargets.$inferSelect;
export type InsertAward = z.infer<typeof insertAwardSchema>;
export type Award = typeof awards.$inferSelect;

// Tabela para attachments/anexos
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  proposalId: varchar("proposal_id").references(() => proposals.id),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  fileType: varchar("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  category: varchar("category").notNull(), // 'identity', 'financial', 'proposal', 'contract', 'other'
  status: varchar("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  driveFileId: varchar("drive_file_id"),
  driveUrl: varchar("drive_url"),
  uploadedBy: varchar("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
});

// Tabela para configurações de múltiplos Google Drives
export const driveConfigs = pgTable("drive_configs", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(), // Nome identificador do drive
  email: varchar("email").notNull(), // Email da conta Google
  folderId: varchar("folder_id").notNull(), // ID da pasta principal
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para configurações persistentes do sistema
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(), // Chave única da configuração
  value: text("value").notNull(), // Valor da configuração (JSON ou texto)
  description: varchar("description"), // Descrição opcional
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Tabela de mensagens internas
export const internalMessages = pgTable("internal_messages", {
  id: serial("id").primaryKey(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  attachments: jsonb("attachments").default(sql`'[]'::jsonb`),
  attachedProposal: jsonb("attached_proposal"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at")
});



export const insertAttachmentSchema = createInsertSchema(attachments);
export const insertDriveConfigSchema = createInsertSchema(driveConfigs);
export const insertSystemSettingSchema = createInsertSchema(systemSettings);
export const insertInternalMessageSchema = createInsertSchema(internalMessages);


export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
export type Attachment = typeof attachments.$inferSelect;
export type InsertDriveConfig = z.infer<typeof insertDriveConfigSchema>;
export type DriveConfig = typeof driveConfigs.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertInternalMessage = z.infer<typeof insertInternalMessageSchema>;
export type InternalMessage = typeof internalMessages.$inferSelect;

