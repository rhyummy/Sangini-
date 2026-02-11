import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const chatSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().optional(),
  message: z.string().min(1).max(1000),
});

export const riskAssessmentSchema = z.object({
  userId: z.string().min(1),
  riskFactors: z.object({
    age: z.number().optional(),
    familyHistory: z.boolean().optional(),
    geneticMutation: z.boolean().optional(),
    previousBreastCondition: z.boolean().optional(),
    denseTissue: z.boolean().optional(),
    lifestyleFactors: z.object({
      alcohol: z.boolean().optional(),
      obesity: z.boolean().optional(),
      lackOfExercise: z.boolean().optional(),
    }).optional(),
  }).optional(),
  symptoms: z.object({
    lump: z.boolean().optional(),
    skinChanges: z.boolean().optional(),
    nippleDischarge: z.boolean().optional(),
    nippleRetraction: z.boolean().optional(),
    breastPain: z.boolean().optional(),
    sizeChange: z.boolean().optional(),
    swelling: z.boolean().optional(),
  }).optional(),
});

export const appointmentSchema = z.object({
  userId: z.string().min(1),
  doctorName: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(1),
  notes: z.string().optional(),
});

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
