import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
      },
      accessType: {
        type: "string", 
        defaultValue: "NO_ACCESS",
      },
      trialStartDate: {
        type: "date",
        required: false,
      },
      trialEndDate: {
        type: "date",
        required: false,
      },
      isTrialUsed: {
        type: "boolean",
        defaultValue: false,
      },
      accessGrantedBy: {
        type: "string",
        required: false,
      },
      accessGrantedAt: {
        type: "date",
        required: false,
      },
      paymentReceived: {
        type: "boolean",
        defaultValue: false,
      },
      paymentAmount: {
        type: "number",
        required: false,
      },
      paymentNotes: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminEmails: process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : [],
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session; 