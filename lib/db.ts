// import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@prisma/client'

// Create and extend the client first
const client = new PrismaClient().$extends(withAccelerate());

// Use `typeof client` to infer the correct extended type
type AcceleratedPrismaClient = typeof client;

declare global { // eslint-disable-next-line no-var
  var prisma: AcceleratedPrismaClient | undefined; }

export const db: AcceleratedPrismaClient = globalThis.prisma ?? client;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
// import { PrismaClient } from '@prisma/client';

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: ['error', 'warn'],
//   });

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = db;
// }

