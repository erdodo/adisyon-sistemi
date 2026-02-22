import { cookies } from "next/headers";
import { prisma } from "./db";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "adisyon-menu-secret-key-change-in-production";
const key = new TextEncoder().encode(JWT_SECRET);

export interface AuthUser {
  id: number;
  name: string;
  phone: string;
  role: "admin" | "waiter" | "kitchen" | "cashier";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: AuthUser): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function isSetupDone(): Promise<boolean> {
  const settings = await prisma.settings.findFirst();
  return settings?.isSetupDone ?? false;
}

export async function getSettings() {
  return prisma.settings.findFirst();
}
