
import { z } from 'zod';
import { insertDrawSchema, draws } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  draws: {
    list: {
      method: 'GET' as const,
      path: '/api/draws',
      input: z.object({
        limit: z.coerce.number().optional().default(100),
      }).optional(),
      responses: {
        200: z.array(z.custom<any>()), // Typed as DrawResponse[] in frontend
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/draws',
      input: insertDrawSchema,
      responses: {
        201: z.custom<any>(), // DrawResponse
        400: errorSchemas.validation,
      },
    },
    latest: {
      method: 'GET' as const,
      path: '/api/draws/latest',
      responses: {
        200: z.custom<any>(), // DrawResponse
      }
    }
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.custom<any>(), // StatsResponse
      },
    },
  },
  prediction: {
    get: {
      method: 'GET' as const,
      path: '/api/prediction',
      responses: {
        200: z.custom<any>(), // PredictionResponse
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
