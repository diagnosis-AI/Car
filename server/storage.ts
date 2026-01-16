import { db } from "./db";
import { diagnoses, type InsertDiagnosis, type Diagnosis } from "@shared/schema";
import { chatStorage, type IChatStorage } from "./replit_integrations/chat/storage"; // Import chat storage
import { eq, desc } from "drizzle-orm";

export interface IStorage extends IChatStorage {
  createDiagnosis(diagnosis: InsertDiagnosis): Promise<Diagnosis>;
  getDiagnoses(): Promise<Diagnosis[]>;
  getDiagnosis(id: number): Promise<Diagnosis | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Chat storage methods delegating to the imported chatStorage
  async getConversation(id: number) { return chatStorage.getConversation(id); }
  async getAllConversations() { return chatStorage.getAllConversations(); }
  async createConversation(title: string) { return chatStorage.createConversation(title); }
  async deleteConversation(id: number) { return chatStorage.deleteConversation(id); }
  async getMessagesByConversation(conversationId: number) { return chatStorage.getMessagesByConversation(conversationId); }
  async createMessage(conversationId: number, role: string, content: string) { return chatStorage.createMessage(conversationId, role, content); }

  // Diagnosis methods
  async createDiagnosis(insertDiagnosis: InsertDiagnosis): Promise<Diagnosis> {
    const [diagnosis] = await db.insert(diagnoses).values(insertDiagnosis).returning();
    return diagnosis;
  }

  async getDiagnoses(): Promise<Diagnosis[]> {
    return db.select().from(diagnoses).orderBy(desc(diagnoses.createdAt));
  }

  async getDiagnosis(id: number): Promise<Diagnosis | undefined> {
    const [diagnosis] = await db.select().from(diagnoses).where(eq(diagnoses.id, id));
    return diagnosis;
  }
}

export const storage = new DatabaseStorage();
