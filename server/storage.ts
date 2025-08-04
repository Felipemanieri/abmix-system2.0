import { users, vendors, proposals, vendorTargets, teamTargets, awards, systemUsers, attachments, driveConfigs, systemSettings, internalMessages, grantedAwards, reportConfigurations, type User, type InsertUser, type Vendor, type InsertVendor, type Proposal, type InsertProposal, type VendorTarget, type InsertVendorTarget, type TeamTarget, type InsertTeamTarget, type Award, type InsertAward, type SystemUser, type InsertSystemUser, type Attachment, type InsertAttachment, type DriveConfig, type InsertDriveConfig, type SystemSetting, type InsertSystemSetting, type InternalMessage, type InsertInternalMessage, type GrantedAward, type InsertGrantedAward, type ReportConfiguration, type InsertReportConfiguration } from "@shared/schema";
import { db, isDatabaseAvailable } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vendor operations
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendorByEmail(email: string): Promise<Vendor | undefined>;
  getAllVendors(): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor>;
  deleteVendor(id: number): Promise<void>;
  
  // Proposal operations
  createProposal(proposal: any): Promise<any>;
  getProposal(id: string): Promise<any>;
  getProposalByToken(token: string): Promise<any>;
  updateProposal(id: string, proposal: any): Promise<any>;
  deleteProposal(id: string): Promise<void>;
  getVendorProposals(vendorId: number): Promise<any[]>;
  getAllProposals(): Promise<any[]>;
  getProposalCount(): Promise<number>;
  approveProposal(id: string): Promise<any>;
  
  // Vendor Target operations
  createVendorTarget(target: InsertVendorTarget): Promise<VendorTarget>;
  getVendorTarget(vendorId: number, month: number, year: number): Promise<VendorTarget | undefined>;
  getVendorTargets(vendorId: number): Promise<VendorTarget[]>;
  getAllVendorTargets(): Promise<VendorTarget[]>;
  updateVendorTarget(id: number, target: Partial<InsertVendorTarget>): Promise<VendorTarget>;
  deleteVendorTarget(id: number): Promise<void>;
  
  // Team Target operations
  createTeamTarget(target: InsertTeamTarget): Promise<TeamTarget>;
  getTeamTarget(month: number, year: number): Promise<TeamTarget | undefined>;
  getAllTeamTargets(): Promise<TeamTarget[]>;
  updateTeamTarget(id: number, target: Partial<InsertTeamTarget>): Promise<TeamTarget>;
  deleteTeamTarget(id: number): Promise<void>;
  
  // Award operations
  createAward(award: InsertAward): Promise<Award>;
  getVendorAwards(vendorId: number): Promise<Award[]>;
  getAllAwards(): Promise<Award[]>;
  updateAward(id: number, award: Partial<InsertAward>): Promise<Award>;
  deleteAward(id: number): Promise<void>;
  
  // Analytics operations
  getVendorStats(vendorId: number, month?: number, year?: number): Promise<any>;
  getTeamStats(month?: number, year?: number): Promise<any>;
  
  // System Users operations
  getAllSystemUsers(): Promise<SystemUser[]>;
  getSystemUser(id: number): Promise<SystemUser | undefined>;
  getSystemUserByEmail(email: string): Promise<SystemUser | undefined>;
  createSystemUser(user: InsertSystemUser): Promise<SystemUser>;
  updateSystemUser(id: number, user: Partial<InsertSystemUser>): Promise<SystemUser>;
  deleteSystemUser(id: number): Promise<void>;
  updateLastLogin(id: number): Promise<void>;
  
  // Attachment operations
  getAllAttachments(): Promise<Attachment[]>;
  getAttachment(id: number): Promise<Attachment | undefined>;
  getAttachmentsByProposal(proposalId: string): Promise<Attachment[]>;
  getProposalAttachments(proposalId: string): Promise<Attachment[]>;
  createAttachment(attachment: any): Promise<Attachment>;
  updateAttachmentStatus(id: number, status: string, approvedBy?: string): Promise<Attachment>;
  deleteAttachment(id: number): Promise<void>;
  
  // Drive Config operations
  getAllDriveConfigs(): Promise<DriveConfig[]>;
  getDriveConfig(id: number): Promise<DriveConfig | undefined>;
  createDriveConfig(config: InsertDriveConfig): Promise<DriveConfig>;
  updateDriveConfig(id: number, config: Partial<InsertDriveConfig>): Promise<DriveConfig>;
  
  // System Settings operations for persistent configurations
  getSystemSetting(key: string): Promise<string | null>;
  setSystemSetting(key: string, value: string, description?: string): Promise<void>;
  deleteSystemSetting(key: string): Promise<void>;
  getAllSystemSettings(): Promise<SystemSetting[]>;
  
  // System Settings operations
  getSystemSetting(key: string): Promise<string | null>;
  setSystemSetting(key: string, value: string): Promise<void>;
  deleteDriveConfig(id: number): Promise<void>;
  
  // Internal Messages operations - APENAS RECEBIDAS
  getInboxMessages(userEmail: string): Promise<InternalMessage[]>;
  getSentMessages(userEmail: string): Promise<InternalMessage[]>;
  markMessagesAsRead(userEmail: string): Promise<number>;
  createInternalMessage(message: InsertInternalMessage): Promise<InternalMessage>;
  markMessageAsRead(messageId: number): Promise<void>;
  
  // Granted Awards operations (controle de premiações concedidas)
  createGrantedAward(award: InsertGrantedAward): Promise<GrantedAward>;
  getGrantedAwards(vendorId: number, month: number, year: number): Promise<GrantedAward[]>;
  getGrantedAward(vendorId: number, awardType: string, month: number, year: number): Promise<GrantedAward | undefined>;
  updateGrantedAward(id: number, award: Partial<InsertGrantedAward>): Promise<GrantedAward>;
  deleteGrantedAward(id: number): Promise<void>;
  getAllGrantedAwards(): Promise<GrantedAward[]>;

  // Report Configuration operations
  saveReportConfiguration(config: Partial<InsertReportConfiguration>): Promise<ReportConfiguration>;
  getReportConfiguration(abmId: string): Promise<ReportConfiguration | undefined>;
  getAllReportConfigurations(): Promise<ReportConfiguration[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Vendor operations
  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async getVendorByEmail(email: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.email, email));
    return vendor || undefined;
  }

  async getAllVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.active, true));
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db
      .insert(vendors)
      .values(insertVendor)
      .returning();
    return vendor;
  }

  async updateVendor(id: number, vendorData: Partial<InsertVendor>): Promise<Vendor> {
    const [vendor] = await db
      .update(vendors)
      .set(vendorData)
      .where(eq(vendors.id, id))
      .returning();
    return vendor;
  }

  async deleteVendor(id: number): Promise<void> {
    await db.delete(vendors).where(eq(vendors.id, id));
  }

  // Proposal operations
  async createProposal(proposalData: any): Promise<any> {
    try {
      console.log('💾 STORAGE: Inserindo proposta no banco:', proposalData);
      
      const [proposal] = await db
        .insert(proposals)
        .values(proposalData)
        .returning();
      
      console.log('✅ STORAGE: Proposta inserida com sucesso:', proposal.id);
      return proposal;
    } catch (error) {
      console.error('❌ STORAGE: Erro ao inserir proposta:', error);
      throw error;
    }
  }

  async getProposal(id: string): Promise<any> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal || undefined;
  }

  async getProposalByToken(token: string): Promise<any> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.clientToken, token));
    return proposal || undefined;
  }

  async updateProposal(id: string, proposalData: any): Promise<any> {
    const [proposal] = await db
      .update(proposals)
      .set({ ...proposalData, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();
    return proposal;
  }

  async updateProposalDocuments(clientToken: string, documentosRecebidos: any): Promise<void> {
    await db
      .update(proposals)
      .set({ 
        documentosRecebidos: documentosRecebidos,
        updatedAt: new Date() 
      })
      .where(eq(proposals.clientToken, clientToken));
  }

  async deleteProposal(id: string): Promise<void> {
    console.log(`🗑️ STORAGE: Excluindo proposta ${id} do banco de dados...`);
    await db.delete(proposals).where(eq(proposals.id, id));
    console.log(`✅ STORAGE: Proposta ${id} excluída com sucesso`);
  }

  async deleteAttachmentsByProposal(proposalId: string): Promise<void> {
    console.log(`🗑️ STORAGE: Excluindo anexos da proposta ${proposalId}...`);
    await db.delete(attachments).where(eq(attachments.proposalId, proposalId));
    console.log(`✅ STORAGE: Anexos da proposta ${proposalId} excluídos com sucesso`);
  }

  async clearAllProposals(): Promise<void> {
    await db.delete(proposals);
  }

  async getVendorProposals(vendorId: number): Promise<any[]> {
    const proposalResults = await db.select().from(proposals)
      .where(eq(proposals.vendorId, vendorId))
      .orderBy(proposals.createdAt); // Manter ordem cronológica de criação
      
    // Log detalhado para debug
    console.log(`📊 STORAGE - Propostas do vendedor ${vendorId}:`, proposalResults.map((p: any) => ({
      abmId: p.abmId,
      contractData: p.contractData,
      titulares: p.titulares?.length || 0,
      dependentes: p.dependentes?.length || 0,
      status: p.status
    })));
    
    return proposalResults;
  }

  async getAllProposals(): Promise<any[]> {
    return await db.select().from(proposals)
      .orderBy(proposals.createdAt); // Manter ordem cronológica de criação
  }

  async getProposalCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(proposals);
    return Number(result[0]?.count) || 0;
  }

  async approveProposal(id: string): Promise<any> {
    const [proposal] = await db
      .update(proposals)
      .set({ approved: true, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();
    return proposal;
  }

  // Vendor Target operations
  async createVendorTarget(target: InsertVendorTarget): Promise<VendorTarget> {
    const [vendorTarget] = await db
      .insert(vendorTargets)
      .values(target)
      .returning();
    return vendorTarget;
  }

  async getVendorTarget(vendorId: number, month: number, year: number): Promise<VendorTarget | undefined> {
    const [target] = await db
      .select()
      .from(vendorTargets)
      .where(and(
        eq(vendorTargets.vendorId, vendorId),
        eq(vendorTargets.month, month),
        eq(vendorTargets.year, year)
      ));
    return target || undefined;
  }

  async getVendorTargets(vendorId: number): Promise<VendorTarget[]> {
    return await db
      .select()
      .from(vendorTargets)
      .where(eq(vendorTargets.vendorId, vendorId))
      .orderBy(desc(vendorTargets.year), desc(vendorTargets.month));
  }

  async getAllVendorTargets(): Promise<VendorTarget[]> {
    return await db
      .select()
      .from(vendorTargets)
      .orderBy(desc(vendorTargets.year), desc(vendorTargets.month));
  }

  async updateVendorTarget(id: number, target: Partial<InsertVendorTarget>): Promise<VendorTarget> {
    const [vendorTarget] = await db
      .update(vendorTargets)
      .set({ ...target, updatedAt: new Date() })
      .where(eq(vendorTargets.id, id))
      .returning();
    return vendorTarget;
  }

  async updateVendorTargetByName(vendorName: string, field: string, value: string, month: number, year: number): Promise<VendorTarget | null> {
    try {
      // Primeiro, encontrar o vendor pelo nome
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.name, vendorName));
      
      if (!vendor) {
        console.log('Vendedor não encontrado:', vendorName);
        return null;
      }

      // Encontrar o target existente
      const [existingTarget] = await db
        .select()
        .from(vendorTargets)
        .where(and(
          eq(vendorTargets.vendorId, vendor.id),
          eq(vendorTargets.month, month),
          eq(vendorTargets.year, year)
        ));

      if (!existingTarget) {
        console.log('Meta não encontrada para o vendedor:', vendorName);
        return null;
      }

      // Atualizar o campo específico
      const updateData: any = { updatedAt: new Date() };
      updateData[field] = value;

      const [updatedTarget] = await db
        .update(vendorTargets)
        .set(updateData)
        .where(eq(vendorTargets.id, existingTarget.id))
        .returning();

      return updatedTarget;
    } catch (error) {
      console.error('Erro ao atualizar meta do vendedor:', error);
      return null;
    }
  }

  async deleteVendorTarget(id: number): Promise<void> {
    await db.delete(vendorTargets).where(eq(vendorTargets.id, id));
  }

  // Team Target operations
  async createTeamTarget(target: InsertTeamTarget): Promise<TeamTarget> {
    const [teamTarget] = await db
      .insert(teamTargets)
      .values(target)
      .returning();
    return teamTarget;
  }

  async getTeamTarget(month: number, year: number): Promise<TeamTarget | undefined> {
    const [target] = await db
      .select()
      .from(teamTargets)
      .where(and(
        eq(teamTargets.month, month),
        eq(teamTargets.year, year)
      ));
    return target || undefined;
  }

  async getAllTeamTargets(): Promise<TeamTarget[]> {
    return await db
      .select()
      .from(teamTargets)
      .orderBy(desc(teamTargets.year), desc(teamTargets.month));
  }

  async updateTeamTarget(id: number, target: Partial<InsertTeamTarget>): Promise<TeamTarget> {
    const [teamTarget] = await db
      .update(teamTargets)
      .set({ ...target, updatedAt: new Date() })
      .where(eq(teamTargets.id, id))
      .returning();
    return teamTarget;
  }

  async deleteTeamTarget(id: number): Promise<void> {
    await db.delete(teamTargets).where(eq(teamTargets.id, id));
  }

  // Award operations
  async createAward(award: InsertAward): Promise<Award> {
    const [newAward] = await db
      .insert(awards)
      .values(award)
      .returning();
    return newAward;
  }

  async getVendorAwards(vendorId: number): Promise<Award[]> {
    return await db
      .select()
      .from(awards)
      .where(eq(awards.vendorId, vendorId))
      .orderBy(desc(awards.dateAwarded));
  }

  async getAllAwards(): Promise<Award[]> {
    return await db
      .select()
      .from(awards)
      .orderBy(desc(awards.dateAwarded));
  }

  async updateAward(id: number, award: Partial<InsertAward>): Promise<Award> {
    const [updatedAward] = await db
      .update(awards)
      .set(award)
      .where(eq(awards.id, id))
      .returning();
    return updatedAward;
  }

  async deleteAward(id: number): Promise<void> {
    await db.delete(awards).where(eq(awards.id, id));
  }

  // Analytics operations
  async getVendorStats(vendorId: number, month?: number, year?: number): Promise<any> {
    const vendorProposals = await db
      .select()
      .from(proposals)
      .where(eq(proposals.vendorId, vendorId));

    // Filter by month/year if specified
    const filteredProposals = vendorProposals.filter((p: any) => {
      if (!month || !year) return true;
      if (!p.createdAt) return false;
      const createdAt = new Date(p.createdAt);
      return createdAt.getMonth() + 1 === month && createdAt.getFullYear() === year;
    });

    const totalProposals = filteredProposals.length;
    const totalValue = filteredProposals.reduce((sum: number, p: any) => {
      const contractData = p.contractData as any;
      const value = contractData?.valor || "R$ 0";
      // Melhor parsing de valor - remover R$, pontos e substituir vírgula por ponto
      const cleanValue = value.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
      const numericValue = parseFloat(cleanValue) || 0;
      return sum + numericValue;
    }, 0);

    const averageValue = totalProposals > 0 ? totalValue / totalProposals : 0;

    return { totalProposals, totalValue, averageValue };
  }

  async getTeamStats(month?: number, year?: number): Promise<any> {
    const allProposals = await db.select().from(proposals);

    // Filter by month/year if specified
    const filteredProposals = allProposals.filter((p: any) => {
      if (!month || !year) return true;
      if (!p.createdAt) return false;
      const createdAt = new Date(p.createdAt);
      return createdAt.getMonth() + 1 === month && createdAt.getFullYear() === year;
    });

    // Para faturamento total: considerar apenas propostas IMPLANTADAS
    const implantedProposals = filteredProposals.filter((p: any) => p.status === 'implantado');
    
    const totalProposals = filteredProposals.length;
    const totalValue = implantedProposals.reduce((sum: number, p: any) => {
      const contractData = p.contractData as any;
      const value = contractData?.valor || "R$ 0";
      // Melhor parsing de valor - remover R$, pontos e substituir vírgula por ponto
      const cleanValue = value.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
      const numericValue = parseFloat(cleanValue) || 0;
      return sum + numericValue;
    }, 0);

    // Ticket médio baseado apenas em propostas implantadas
    const averageValue = implantedProposals.length > 0 ? totalValue / implantedProposals.length : 0;
    
    // Vendedores ativos: vendedores que têm pelo menos uma proposta
    const totalVendors = new Set(filteredProposals.filter((p: any) => p.vendorId).map((p: any) => p.vendorId)).size;

    return { totalProposals, totalValue, averageValue, totalVendors };
  }

  // System Users operations
  async getAllSystemUsers(): Promise<SystemUser[]> {
    return await db.select().from(systemUsers).orderBy(desc(systemUsers.createdAt));
  }

  async getSystemUser(id: number): Promise<SystemUser | undefined> {
    const [user] = await db.select().from(systemUsers).where(eq(systemUsers.id, id));
    return user || undefined;
  }

  async getSystemUserByEmail(email: string): Promise<SystemUser | undefined> {
    const [user] = await db.select().from(systemUsers).where(eq(systemUsers.email, email));
    return user || undefined;
  }

  async getSystemUserById(id: number): Promise<SystemUser | undefined> {
    const [user] = await db.select().from(systemUsers).where(eq(systemUsers.id, id));
    return user || undefined;
  }

  async getVendorById(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async createSystemUser(userData: InsertSystemUser): Promise<SystemUser> {
    const [user] = await db
      .insert(systemUsers)
      .values(userData)
      .returning();
    return user;
  }

  async updateSystemUser(id: number, userData: Partial<InsertSystemUser>): Promise<SystemUser> {
    const [user] = await db
      .update(systemUsers)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(systemUsers.id, id))
      .returning();
    return user;
  }

  async deleteSystemUser(id: number): Promise<void> {
    await db.delete(systemUsers).where(eq(systemUsers.id, id));
  }

  async updateSystemUserLastLogin(id: number): Promise<void> {
    await db
      .update(systemUsers)
      .set({ last_login: new Date() })
      .where(eq(systemUsers.id, id));
  }

  async updateLastLogin(id: number): Promise<void> {
    await db
      .update(systemUsers)
      .set({ last_login: new Date() })
      .where(eq(systemUsers.id, id));
  }

  async updateVendorLastLogin(id: number): Promise<void> {
    await db
      .update(vendors)
      .set({ last_login: new Date() })
      .where(eq(vendors.id, id));
    console.log(`🔧 STORAGE: Último login do vendedor ${id} atualizado para ${new Date().toISOString()}`);
  }

  // Attachment operations
  async getAllAttachments(): Promise<Attachment[]> {
    return await db.select().from(attachments);
  }

  async getAttachment(id: number): Promise<Attachment | undefined> {
    const [attachment] = await db.select().from(attachments).where(eq(attachments.id, id));
    return attachment || undefined;
  }

  async getAttachmentsByProposal(proposalId: string): Promise<Attachment[]> {
    return await db.select().from(attachments).where(eq(attachments.proposalId, proposalId));
  }

  async getProposalAttachments(proposalId: string): Promise<Attachment[]> {
    try {
      const result = await db.select().from(attachments).where(eq(attachments.proposalId, proposalId));
      console.log(`📎 Storage: Encontrados ${result.length} anexos para proposta ${proposalId}`);
      return result;
    } catch (error) {
      console.error('Erro ao buscar anexos no storage:', error);
      return [];
    }
  }

  async createAttachment(attachmentData: any): Promise<Attachment> {
    // Ajuste para compatibilidade com schema atual
    const cleanData = {
      proposalId: attachmentData.proposalId,
      filename: attachmentData.filename,
      originalName: attachmentData.originalName,
      fileSize: attachmentData.fileSize || attachmentData.size,
      fileType: attachmentData.fileType || attachmentData.mimetype,
      uploadDate: new Date(),
      status: attachmentData.status || 'pending',
      approvedBy: null,
      approvalDate: null,
      category: attachmentData.category || 'other',
      uploadedBy: attachmentData.uploadedBy || 'sistema',
      driveFileId: null,
      driveUrl: null
    };
    
    const [attachment] = await db
      .insert(attachments)
      .values(cleanData)
      .returning();
    return attachment;
  }

  async updateAttachmentStatus(id: number, status: string, approvedBy?: string): Promise<Attachment> {
    const updateData: any = { status };
    if (approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
    }

    const [attachment] = await db
      .update(attachments)
      .set(updateData)
      .where(eq(attachments.id, id))
      .returning();
    return attachment;
  }

  async deleteAttachment(id: number): Promise<void> {
    await db.delete(attachments).where(eq(attachments.id, id));
  }

  // SISTEMA DE NOTIFICAÇÃO REAL FUNCIONANDO
  async sendInternalMessage(messageData: any): Promise<InternalMessage> {
    const cleanData = {
      from: messageData.fromEmail || 'sistema@abmix.com.br',
      to: messageData.toEmail,
      subject: messageData.subject,
      message: messageData.message,
      attachments: [], // Array vazio como padrão
      attachedProposal: messageData.attachedProposal || null,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📧 CRIANDO NOTIFICAÇÃO NO BANCO:', cleanData);
    
    const [message] = await db
      .insert(internalMessages)
      .values(cleanData)
      .returning();
      
    console.log('✅ NOTIFICAÇÃO SALVA NO BANCO:', message.id);
    return message;
  }

  // Drive Config operations
  async getAllDriveConfigs(): Promise<DriveConfig[]> {
    return await db.select().from(driveConfigs);
  }

  async getDriveConfig(id: number): Promise<DriveConfig | undefined> {
    const [config] = await db.select().from(driveConfigs).where(eq(driveConfigs.id, id));
    return config || undefined;
  }

  async createDriveConfig(configData: InsertDriveConfig): Promise<DriveConfig> {
    const [config] = await db
      .insert(driveConfigs)
      .values(configData)
      .returning();
    return config;
  }

  async updateDriveConfig(id: number, configData: Partial<InsertDriveConfig>): Promise<DriveConfig> {
    const [config] = await db
      .update(driveConfigs)
      .set({ ...configData, updatedAt: new Date() })
      .where(eq(driveConfigs.id, id))
      .returning();
    return config;
  }

  async deleteDriveConfig(id: number): Promise<void> {
    await db.delete(driveConfigs).where(eq(driveConfigs.id, id));
  }

  // System Settings operations for persistent configurations
  async getSystemSetting(key: string): Promise<string | null> {
    try {
      const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
      return setting?.value || null;
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return null;
    }
  }

  async setSystemSetting(key: string, value: string, description?: string): Promise<void> {
    try {
      // Upsert: tentar atualizar primeiro, se não existir, inserir
      const existing = await this.getSystemSetting(key);
      
      if (existing !== null) {
        // Atualizar existente
        await db
          .update(systemSettings)
          .set({ 
            value,
            updatedAt: new Date() 
          })
          .where(eq(systemSettings.key, key));
      } else {
        // Inserir novo
        await db
          .insert(systemSettings)
          .values({ 
            key, 
            value
          });
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      throw error;
    }
  }

  async deleteSystemSetting(key: string): Promise<void> {
    try {
      await db.delete(systemSettings).where(eq(systemSettings.key, key));
    } catch (error) {
      console.error('Erro ao deletar configuração:', error);
      throw error;
    }
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    try {
      return await db.select().from(systemSettings).orderBy(systemSettings.key);
    } catch (error) {
      console.error('Erro ao buscar todas as configurações:', error);
      return [];
    }
  }

  // MÉTODOS PARA RELATÓRIOS PERSISTENTES DO SUPERVISOR (usando systemSettings)
  async saveSupervisorReportData(reportId: string, data: any): Promise<void> {
    const key = `supervisor_report_${reportId}`;
    await this.setSystemSetting(key, JSON.stringify(data));
  }

  async getSupervisorReportData(reportId: string): Promise<any | null> {
    const key = `supervisor_report_${reportId}`;
    const data = await this.getSystemSetting(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSupervisorReportData(reportId: string): Promise<void> {
    const key = `supervisor_report_${reportId}`;
    await this.deleteSystemSetting(key);
  }

  // Internal Messages operations - APENAS RECEBIDAS
  async getInboxMessages(userEmail: string): Promise<InternalMessage[]> {
    try {
      console.log(`📬 STORAGE: Buscando mensagens recebidas para ${userEmail}`);
      
      // Buscar usando LIKE para encontrar o email dentro do JSON (escapando a palavra reservada "to")
      const searchPattern = `%${userEmail}%`;
      const messages = await db
        .select()
        .from(internalMessages)
        .where(sql`"to" LIKE ${searchPattern}`)
        .orderBy(desc(internalMessages.createdAt));
      
      console.log(`📬 STORAGE: Encontradas ${messages.length} mensagens para ${userEmail}`);
      return messages;
    } catch (error) {
      console.error('Erro ao buscar mensagens do inbox:', error);
      return [];
    }
  }

  async getSentMessages(userEmail: string): Promise<InternalMessage[]> {
    try {
      console.log(`📤 STORAGE: Buscando mensagens enviadas por ${userEmail}`);
      const messages = await db
        .select()
        .from(internalMessages)
        .where(eq(internalMessages.from, userEmail))
        .orderBy(desc(internalMessages.createdAt));
      console.log(`📤 STORAGE: Encontradas ${messages.length} mensagens enviadas por ${userEmail}`);
      return messages;
    } catch (error) {
      console.error('Erro ao buscar mensagens enviadas:', error);
      return [];
    }
  }

  async createInternalMessage(message: InsertInternalMessage): Promise<InternalMessage> {
    try {
      console.log(`📝 STORAGE: Criando nova mensagem de ${message.from} para ${message.to}`);
      const [newMessage] = await db
        .insert(internalMessages)
        .values(message)
        .returning();
      console.log(`📝 STORAGE: Mensagem criada com ID ${newMessage.id}`);
      return newMessage;
    } catch (error) {
      console.error('Erro ao criar mensagem interna:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    try {
      console.log(`📖 STORAGE: Marcando mensagem ${messageId} como lida`);
      await db
        .update(internalMessages)
        .set({ 
          read: true, 
          readAt: new Date() 
        })
        .where(eq(internalMessages.id, messageId));
      console.log(`📖 STORAGE: Mensagem ${messageId} marcada como lida`);
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      throw error;
    }
  }

  async markMessagesAsRead(userEmail: string): Promise<number> {
    try {
      console.log(`📖 STORAGE: Marcando TODAS as mensagens como lidas para ${userEmail}`);
      const result = await db
        .update(internalMessages)
        .set({ 
          read: true, 
          readAt: new Date() 
        })
        .where(sql`"to" LIKE ${`%${userEmail}%`} AND read = false`);
      console.log(`📖 STORAGE: Mensagens marcadas como lidas para ${userEmail}`);
      return 1; // Retorna numero de mensagens afetadas
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      return 0;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    console.log(`🗑️ STORAGE: Deletando mensagem ${messageId} do PostgreSQL`);
    
    try {
      const id = parseInt(messageId);
      await db.delete(internalMessages).where(eq(internalMessages.id, id));
      console.log(`✅ STORAGE: Mensagem ${messageId} deletada com sucesso`);
    } catch (error) {
      console.error(`❌ STORAGE: Erro ao deletar mensagem ${messageId}:`, error);
      throw error;
    }
  }

  async rejectProposal(proposalId: string): Promise<void> {
    console.log(`❌ STORAGE: Rejeitando proposta ${proposalId}`);
    
    try {
      await db
        .update(proposals)
        .set({ 
          rejected: true,
          approved: false,
          status: 'rejeitado',
          updatedAt: new Date()
        })
        .where(eq(proposals.id, proposalId));
      
      console.log(`✅ STORAGE: Proposta ${proposalId} rejeitada com sucesso`);
    } catch (error) {
      console.error(`❌ STORAGE: Erro ao rejeitar proposta ${proposalId}:`, error);
      throw error;
    }
  }

  // Método para buscar configurações do Google Drive/Sheets
  async getDriveConfigs(): Promise<Array<{
    id: string;
    name: string;
    sheetId: string;
    range: string;
    folderId?: string;
    status: 'active' | 'inactive';
  }>> {
    try {
      console.log('📊 STORAGE: Buscando configurações do Drive/Sheets');
      
      // Configuração da planilha principal com ID correto
      const configs = [
        {
          id: 'main-sheet',
          name: 'PLANILHA_PRINCIPAL',
          sheetId: '1IC3ks1CdhY3ui_Gh6bs8uj7OnaDwu4R4KQZ27vRzFDw',
          range: 'A1:Z1000',
          folderId: 'main-folder-id',
          status: 'active' as const
        }
      ];
      
      console.log(`✅ STORAGE: ${configs.length} configurações encontradas`);
      return configs;
    } catch (error) {
      console.error('❌ STORAGE: Erro ao buscar configurações do Drive:', error);
      return [];
    }
  }

  // Granted Awards operations (controle de premiações concedidas)
  async createGrantedAward(award: InsertGrantedAward): Promise<GrantedAward> {
    const [grantedAward] = await db
      .insert(grantedAwards)
      .values(award)
      .returning();
    return grantedAward;
  }

  async getGrantedAwards(vendorId: number, month: number, year: number): Promise<GrantedAward[]> {
    return await db
      .select()
      .from(grantedAwards)
      .where(and(
        eq(grantedAwards.vendorId, vendorId),
        eq(grantedAwards.month, month),
        eq(grantedAwards.year, year)
      ));
  }

  async getGrantedAward(vendorId: number, awardType: string, month: number, year: number): Promise<GrantedAward | undefined> {
    const [award] = await db
      .select()
      .from(grantedAwards)
      .where(and(
        eq(grantedAwards.vendorId, vendorId),
        eq(grantedAwards.awardType, awardType),
        eq(grantedAwards.month, month),
        eq(grantedAwards.year, year)
      ));
    return award || undefined;
  }

  async updateGrantedAward(id: number, award: Partial<InsertGrantedAward>): Promise<GrantedAward> {
    const [updatedAward] = await db
      .update(grantedAwards)
      .set({ ...award, updatedAt: new Date() })
      .where(eq(grantedAwards.id, id))
      .returning();
    return updatedAward;
  }

  async deleteGrantedAward(id: number): Promise<void> {
    await db.delete(grantedAwards).where(eq(grantedAwards.id, id));
  }

  async getAllGrantedAwards(): Promise<GrantedAward[]> {
    return await db.select().from(grantedAwards).orderBy(desc(grantedAwards.createdAt));
  }

  // Report Configuration operations
  async saveReportConfiguration(config: Partial<InsertReportConfiguration>): Promise<ReportConfiguration> {
    try {
      // Verificar se já existe uma configuração para este abmId
      const existing = await this.getReportConfiguration(config.abmId!);
      
      if (existing) {
        // Atualizar configuração existente
        const [updatedConfig] = await db
          .update(reportConfigurations)
          .set({ 
            ...config, 
            updatedAt: new Date() 
          })
          .where(eq(reportConfigurations.abmId, config.abmId!))
          .returning();
        return updatedConfig;
      } else {
        // Criar nova configuração
        const [newConfig] = await db
          .insert(reportConfigurations)
          .values({
            ...config,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        return newConfig;
      }
    } catch (error) {
      console.error('❌ STORAGE: Erro ao salvar configuração de relatório:', error);
      throw error;
    }
  }

  async getReportConfiguration(abmId: string): Promise<ReportConfiguration | undefined> {
    try {
      const [config] = await db
        .select()
        .from(reportConfigurations)
        .where(eq(reportConfigurations.abmId, abmId));
      return config || undefined;
    } catch (error) {
      console.error('❌ STORAGE: Erro ao buscar configuração de relatório:', error);
      return undefined;
    }
  }

  async getAllReportConfigurations(): Promise<ReportConfiguration[]> {
    try {
      return await db.select().from(reportConfigurations);
    } catch (error) {
      console.error('❌ STORAGE: Erro ao buscar todas as configurações de relatórios:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
