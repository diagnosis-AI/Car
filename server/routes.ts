import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { openai } from "./replit_integrations/audio/client"; // Use the client from audio module which exports configured openai

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerAudioRoutes(app);

  // Diagnosis API
  app.post(api.diagnose.analyze.path, async (req, res) => {
    try {
      const input = api.diagnose.analyze.input.parse(req.body);

      // Construct prompt for Arabic diagnostic
      const systemPrompt = `You are an expert automotive mechanic and AI diagnostic tool. 
      Your task is to analyze OBD2 codes and vehicle symptoms and provide a detailed report in ARABIC (JSON format).
      
      The user will provide:
      - Code: ${input.code}
      - Make: ${input.make || "Unknown"}
      - Model: ${input.model || "Unknown"}
      - Year: ${input.year || "Unknown"}
      - Symptoms: ${input.symptoms || "None"}

      Return a JSON object with this exact structure:
      {
        "meaning": "Detailed explanation of the code in Arabic",
        "causes": ["Cause 1 in Arabic", "Cause 2 in Arabic", ...],
        "severity": "low" | "medium" | "high" | "critical",
        "solutions": {
          "simple": ["DIY step 1 in Arabic", "DIY step 2 in Arabic"],
          "technical": ["Mechanic step 1 in Arabic", "Mechanic step 2 in Arabic"]
        },
        "canDrive": boolean,
        "warnings": ["Warning 1 in Arabic", ...]
      }
      
      Ensure the tone is professional but accessible. 'canDrive' should be true only if it's safe to drive temporarily.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze code ${input.code} for ${input.year} ${input.make} ${input.model}` }
        ],
        response_format: { type: "json_object" }
      });

      const resultText = response.choices[0].message.content || "{}";
      const result = JSON.parse(resultText);

      // Validate result structure roughly (optional but good for safety)
      if (!result.meaning || !result.solutions) {
        throw new Error("AI returned incomplete data");
      }

      // Store in DB
      const diagnosis = await storage.createDiagnosis({
        code: input.code,
        make: input.make,
        model: input.model,
        year: input.year,
        symptoms: input.symptoms,
        result: result
      });

      res.json(result);
    } catch (err) {
      console.error("Diagnosis error:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to analyze code. Please try again." });
      }
    }
  });

  app.get(api.diagnose.history.path, async (req, res) => {
    try {
      const history = await storage.getDiagnoses();
      res.json(history);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  // Seed data
  const existing = await storage.getDiagnoses();
  if (existing.length === 0) {
    const seedData = [
      {
        code: "P0171",
        make: "Toyota",
        model: "Camry",
        year: 2018,
        symptoms: "ضعف في العزم، استهلاك وقود عالي",
        result: {
          meaning: "نظام الوقود فقير جداً (كمية الهواء أكثر من الوقود)",
          causes: ["تسريب هواء (Vacuum Leak)", "حساس MAF متسخ", "ضغط وقود ضعيف"],
          severity: "medium",
          solutions: {
            simple: ["تأكد من إغلاق غطاء المحرك وفلتر الهواء بإحكام", "نظف حساس الهواء (MAF) ببخاخ خاص"],
            technical: ["فحص ضغط طرمبة الوقود", "فحص تسريبات الثلاجة (Intake Manifold)"]
          },
          canDrive: true,
          warnings: ["قد تلاحظ زيادة في استهلاك الوقود"]
        }
      },
      {
        code: "P0300",
        make: "Ford",
        model: "F-150",
        year: 2015,
        symptoms: "اهتزاز المحرك",
        result: {
          meaning: "فقدان شرارة (Misfire) عشوائي في عدة سلندرات",
          causes: ["بواجي (شمعات) تالفة", "كويلات ضعيفة", "مشكلة في ضغط الوقود"],
          severity: "high",
          solutions: {
            simple: ["تأكد من جودة الوقود المستخدم"],
            technical: ["فحص البواجي والكويلات", "فحص ضغط المحرك (Compression Test)"]
          },
          canDrive: false,
          warnings: ["القيادة قد تسبب تلف دبة التلوث (Catalytic Converter)"]
        }
      }
    ];

    for (const data of seedData) {
      await storage.createDiagnosis(data);
    }
    console.log("Seeded diagnoses data");
  }

  return httpServer;
}
