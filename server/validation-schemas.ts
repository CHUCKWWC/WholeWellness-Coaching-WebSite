import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string().email().min(1).max(254);
const passwordSchema = z.string().min(8).max(128).regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
);
const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/).min(10).max(20);
const nameSchema = z.string().min(1).max(100).regex(/^[a-zA-Z\s\-'\.]+$/);
const uuidSchema = z.string().uuid();
const positiveNumberSchema = z.number().positive();
const nonEmptyStringSchema = z.string().min(1).trim();
const urlSchema = z.string().url();

// User authentication schemas
export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  dateOfBirth: z.string().datetime().optional(),
  phone: phoneSchema.optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'Terms and conditions must be accepted'
  }),
  marketingOptIn: z.boolean().optional().default(false)
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema
});

export const passwordResetSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// User profile schemas
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  dateOfBirth: z.string().datetime().optional(),
  bio: z.string().max(500).optional(),
  profilePicture: urlSchema.optional(),
  preferences: z.object({
    notifications: z.boolean().optional(),
    newsletter: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional()
  }).optional()
});

// Payment schemas
export const paymentIntentSchema = z.object({
  amount: z.number().min(100).max(100000), // $1 to $1000 in cents
  currency: z.enum(['usd']).default('usd'),
  description: z.string().max(500).optional(),
  metadata: z.record(z.string()).optional()
});

export const donationSchema = z.object({
  amount: z.number().min(1).max(10000),
  currency: z.enum(['usd']).default('usd'),
  donorName: nameSchema.optional(),
  donorEmail: emailSchema.optional(),
  message: z.string().max(1000).optional(),
  isAnonymous: z.boolean().default(false),
  campaignId: uuidSchema.optional()
});

export const subscriptionSchema = z.object({
  planId: z.string().min(1),
  paymentMethodId: z.string().min(1),
  couponCode: z.string().max(50).optional()
});

// Booking schemas
export const bookingSchema = z.object({
  serviceId: uuidSchema,
  coachId: uuidSchema.optional(),
  preferredDate: z.string().datetime(),
  alternativeDate: z.string().datetime().optional(),
  duration: z.number().min(30).max(180), // 30 minutes to 3 hours
  notes: z.string().max(1000).optional(),
  contactMethod: z.enum(['phone', 'video', 'in-person']).default('video')
});

export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  notes: z.string().max(1000).optional(),
  rescheduleDate: z.string().datetime().optional()
});

// Contact form schema
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
  category: z.enum(['general', 'booking', 'support', 'partnership', 'feedback']).default('general'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium')
});

// Coach application schema
export const coachApplicationSchema = z.object({
  personalInfo: z.object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    dateOfBirth: z.string().datetime(),
    address: z.object({
      street: z.string().min(1).max(200),
      city: z.string().min(1).max(100),
      state: z.string().min(1).max(100),
      zipCode: z.string().min(1).max(20),
      country: z.string().min(1).max(100)
    })
  }),
  qualifications: z.object({
    education: z.array(z.object({
      institution: z.string().min(1).max(200),
      degree: z.string().min(1).max(200),
      field: z.string().min(1).max(200),
      graduationYear: z.number().min(1950).max(new Date().getFullYear())
    })).min(1),
    certifications: z.array(z.object({
      name: z.string().min(1).max(200),
      issuingOrganization: z.string().min(1).max(200),
      issueDate: z.string().datetime(),
      expiryDate: z.string().datetime().optional()
    })).min(1),
    experience: z.string().min(100).max(2000)
  }),
  specializations: z.array(z.string().min(1).max(100)).min(1).max(10),
  availability: z.object({
    hoursPerWeek: z.number().min(1).max(40),
    preferredSchedule: z.array(z.enum(['morning', 'afternoon', 'evening'])).min(1),
    timeZone: z.string().min(1)
  }),
  references: z.array(z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    relationship: z.string().min(1).max(100)
  })).min(2).max(5)
});

// Assessment schemas
export const assessmentResponseSchema = z.object({
  assessmentId: uuidSchema,
  responses: z.array(z.object({
    questionId: uuidSchema,
    answer: z.union([
      z.string().max(1000),
      z.number(),
      z.boolean(),
      z.array(z.string())
    ])
  })).min(1)
});

// Content management schemas
export const createContentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
  type: z.enum(['article', 'video', 'podcast', 'infographic', 'course']),
  category: z.string().min(1).max(100),
  tags: z.array(z.string().max(50)).max(10),
  isPublished: z.boolean().default(false),
  featuredImage: urlSchema.optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional()
});

export const updateContentSchema = createContentSchema.partial();

// Admin schemas
export const adminUserUpdateSchema = z.object({
  role: z.enum(['user', 'coach', 'admin', 'super_admin']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  notes: z.string().max(1000).optional()
});

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  goalAmount: positiveNumberSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().default(true),
  featuredImage: urlSchema.optional()
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate']
});

// API query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const searchSchema = z.object({
  query: z.string().min(1).max(200),
  category: z.string().max(100).optional(),
  filters: z.record(z.string()).optional()
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string().regex(/^(image|video|audio|application)\//),
    size: z.number().max(10 * 1024 * 1024), // 10MB max
    buffer: z.instanceof(Buffer)
  }),
  folder: z.string().max(100).optional(),
  isPublic: z.boolean().default(false)
});

// Webhook validation
export const stripeWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.string(),
  data: z.object({
    object: z.record(z.any())
  }),
  created: z.number(),
  livemode: z.boolean()
});

// Utility functions for validation
export const validateRequest = <T>(schema: z.ZodSchema<T>) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedBody = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      next(error);
    }
  };
};

export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.validatedQuery = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      next(error);
    }
  };
};

export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedParams = schema.parse(req.params);
      req.validatedParams = validatedParams;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Parameter validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      next(error);
    }
  };
};