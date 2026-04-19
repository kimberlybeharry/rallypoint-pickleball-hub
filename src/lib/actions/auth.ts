"use server";

import { prisma } from "@/db";
import { signIn } from "@/auth";
import bcrypt from "bcryptjs";
import { SignupSchema, LoginSchema } from "@/lib/schemas";
import { AuthError } from "next-auth";

export async function signup(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    referralCode: formData.get("referralCode") ?? undefined,
  };

  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password, referralCode } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  // Award welcome points (1000 pts per gamification rules)
  await prisma.pointsEvent.create({
    data: {
      userId: user.id,
      eventType: "WELCOME",
      points: 1000,
    },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { points: { increment: 1000 } },
  });

  // Track referral if code provided
  if (referralCode) {
    const referral = await prisma.referral.findFirst({
      where: { code: referralCode, recipientId: null },
    });
    if (referral && referral.senderId !== user.id) {
      await prisma.referral.update({
        where: { id: referral.id },
        data: { recipientId: user.id, usedAt: new Date() },
      });
    }
  }

  // Auto sign-in after registration
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  });
}

export async function googleSignIn(callbackUrl: string) {
  // Server action: initiates Google OAuth via POST (required by Auth.js v5)
  await signIn("google", { redirectTo: callbackUrl });
}

export async function login(formData: FormData) {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error; // NEXT_REDIRECT -- must rethrow
  }
}