import { z } from "zod";

export const clientEnv = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(10).optional()
}).parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
});

// Split server env so missing Stripe vars do NOT break deploy/prerender.
export const supabaseServerEnv = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10)
}).safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
});

export const stripeServerEnv = z.object({
  STRIPE_SECRET_KEY: z.string().min(10),
  STRIPE_WEBHOOK_SECRET: z.string().min(10),
  STRIPE_CONNECT_REFRESH_URL: z.string().url().optional(),
  STRIPE_CONNECT_RETURN_URL: z.string().url().optional()
}).safeParse({
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_CONNECT_REFRESH_URL: process.env.STRIPE_CONNECT_REFRESH_URL,
  STRIPE_CONNECT_RETURN_URL: process.env.STRIPE_CONNECT_RETURN_URL
});

export const qrServerEnv = z.object({
  QR_SECRET: z.string().min(8)
}).safeParse({
  QR_SECRET: process.env.QR_SECRET
});
