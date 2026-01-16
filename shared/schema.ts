import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export chat models from the integration
export * from "./models/chat";

// === TABLE DEFINITIONS ===
export const diagnoses = pgTable("diagnoses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  symptoms: text("symptoms"),
  result: jsonb("result").notNull(), // Store the AI analysis
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertDiagnosisSchema = createInsertSchema(diagnoses).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Diagnosis = typeof diagnoses.$inferSelect;
export type InsertDiagnosis = z.infer<typeof insertDiagnosisSchema>;

// Request types
export type DiagnoseRequest = {
  code: string;
  make?: string;
  model?: string;
  year?: number;
  symptoms?: string;
};

// Response types
export interface DiagnoseResponse {
  meaning: string;
  causes: string[];
  severity: "low" | "medium" | "high" | "critical";
  solutions: {
    simple: string[];
    technical: string[];
  };
  canDrive: boolean;
  warnings: string[];
}
