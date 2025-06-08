import { headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db";
import { redirect } from "next/navigation";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: headers(),
  });
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  
  let user = await db.user.findUnique({
    where: { id: session.user.id },
  });
  
  // Auto-promote admin to teacher if needed
  if (user && process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL && user.role !== "TEACHER") {
    try {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          role: "TEACHER",
          accessType: "FULL_ACCESS",
          paymentReceived: true,
          accessGrantedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error promoting admin user:", error);
    }
  }
  
  return user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}

export async function requireTeacher() {
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") {
    redirect("/dashboard");
  }
  return user;
} 