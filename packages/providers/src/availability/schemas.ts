import { z } from "zod";

export const weeklyCapacityInputSchema = z
  .array(
    z.object({
      weekday: z.number().int().min(0).max(6),
      hoursPerDay: z.coerce.number().min(0).max(24),
    }),
  )
  .min(1)
  .max(7);

export const absenceInputSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().trim().max(2000).optional(),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: "Start date must be on or before end date.",
  });

export const reservationInputSchema = z
  .object({
    engagementId: z.string().optional(),
    hoursPerDay: z.coerce.number().min(0.5).max(24),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: "Start date must be on or before end date.",
  });

export const capacityQuerySchema = z.object({
  startDate: z.coerce.date(),
  weeks: z.number().int().min(1).max(12).default(4),
});

export type AbsenceInput = z.infer<typeof absenceInputSchema>;
export type CapacityQuery = z.infer<typeof capacityQuerySchema>;
export type ReservationInput = z.infer<typeof reservationInputSchema>;
export type WeeklyCapacityInput = z.infer<typeof weeklyCapacityInputSchema>;
