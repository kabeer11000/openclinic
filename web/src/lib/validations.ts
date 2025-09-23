import { z } from 'zod';

// Patient validation schema
export const patientSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  age: z.number()
    .min(0, 'Age must be a positive number')
    .max(150, 'Age must be realistic'),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Please select a valid gender'
  }),
  contact: z.string()
    .min(10, 'Contact must be at least 10 characters')
    .max(20, 'Contact must not exceed 20 characters'),
  address: z.string()
    .max(200, 'Address must not exceed 200 characters')
    .optional(),
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional()
});

// Medicine validation schema (for form data with string date)
export const medicineFormSchema = z.object({
  name: z.string()
    .min(2, 'Medicine name must be at least 2 characters')
    .max(100, 'Medicine name must not exceed 100 characters'),
  category: z.string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must not exceed 50 characters'),
  quantity: z.number()
    .min(0, 'Quantity must be a positive number')
    .max(10000, 'Quantity seems unrealistic'),
  unitPrice: z.number()
    .min(0, 'Unit price must be a positive number')
    .max(10000, 'Unit price seems unrealistic'),
  expiryDate: z.string()
    .min(1, 'Expiry date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Expiry date must be today or in the future')
});

// Medicine validation schema (for database with Date object)
export const medicineSchema = z.object({
  name: z.string()
    .min(2, 'Medicine name must be at least 2 characters')
    .max(100, 'Medicine name must not exceed 100 characters'),
  category: z.string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must not exceed 50 characters'),
  quantity: z.number()
    .min(0, 'Quantity must be a positive number')
    .max(10000, 'Quantity seems unrealistic'),
  unitPrice: z.number()
    .min(0, 'Unit price must be a positive number')
    .max(10000, 'Unit price seems unrealistic'),
  expiryDate: z.date()
    .min(new Date(), 'Expiry date must be in the future')
});

// Visit validation schema
export const visitSchema = z.object({
  diagnosis: z.string()
    .min(3, 'Diagnosis must be at least 3 characters')
    .max(200, 'Diagnosis must not exceed 200 characters'),
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
  prescribedMedicines: z.array(
    z.object({
      medicineId: z.string().min(1, 'Medicine is required'),
      medicineName: z.string().min(1, 'Medicine name is required'),
      dosage: z.string()
        .min(1, 'Dosage is required')
        .max(50, 'Dosage must not exceed 50 characters'),
      quantity: z.number()
        .min(1, 'Quantity must be at least 1')
        .max(1000, 'Quantity seems unrealistic')
    })
  ).optional().default([])
});

// Type inference from schemas
export type PatientFormData = z.infer<typeof patientSchema>;
export type MedicineFormData = z.infer<typeof medicineFormSchema>;
export type VisitFormData = z.infer<typeof visitSchema>;

// Validation helper function
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[]
} => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};