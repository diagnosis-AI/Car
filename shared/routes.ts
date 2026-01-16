import { z } from 'zod';
import { insertDiagnosisSchema, diagnoses } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  diagnose: {
    analyze: {
      method: 'POST' as const,
      path: '/api/diagnose',
      input: z.object({
        code: z.string().min(1, "رمز الخطأ مطلوب"),
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.coerce.number().optional(),
        symptoms: z.string().optional(),
      }),
      responses: {
        200: z.object({
          meaning: z.string(),
          causes: z.array(z.string()),
          severity: z.enum(["low", "medium", "high", "critical"]),
          solutions: z.object({
            simple: z.array(z.string()),
            technical: z.array(z.string()),
          }),
          canDrive: z.boolean(),
          warnings: z.array(z.string()),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/diagnose/history',
      responses: {
        200: z.array(z.custom<typeof diagnoses.$inferSelect>()),
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type DiagnoseInput = z.infer<typeof api.diagnose.analyze.input>;
export type DiagnoseResponse = z.infer<typeof api.diagnose.analyze.responses[200]>;
