import type { AuthCredentials, AuthResult } from "./types";
import { getSupabaseBrowserClient, isCustomerAuthConfigured } from "./supabaseBrowser";

function mapAuthError(message: string): AuthResult {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return { ok: false, code: "invalid_credentials", message: "Неверный email или пароль." };
  }
  if (normalized.includes("user already registered")) {
    return { ok: false, code: "email_taken", message: "Пользователь с таким email уже зарегистрирован." };
  }
  if (normalized.includes("password")) {
    return { ok: false, code: "weak_password", message: "Пароль слишком короткий или не соответствует требованиям." };
  }
  return { ok: false, code: "unknown", message: message || "Не удалось выполнить вход." };
}

export async function signInWithPassword(credentials: AuthCredentials): Promise<AuthResult> {
  if (!isCustomerAuthConfigured()) {
    return { ok: false, code: "not_configured", message: "Авторизация не настроена." };
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return { ok: false, code: "not_configured", message: "Авторизация не настроена." };
  }

  const { error } = await client.auth.signInWithPassword({
    email: credentials.email.trim(),
    password: credentials.password,
  });

  if (error) return mapAuthError(error.message);
  return { ok: true };
}

export async function signUpWithPassword(credentials: AuthCredentials): Promise<AuthResult> {
  if (!isCustomerAuthConfigured()) {
    return { ok: false, code: "not_configured", message: "Авторизация не настроена." };
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return { ok: false, code: "not_configured", message: "Авторизация не настроена." };
  }

  const fullName = credentials.fullName?.trim() || "";
  const { error } = await client.auth.signUp({
    email: credentials.email.trim(),
    password: credentials.password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  if (error) return mapAuthError(error.message);
  return { ok: true };
}

export async function signOutCustomer(): Promise<void> {
  const client = getSupabaseBrowserClient();
  if (!client) return;
  await client.auth.signOut();
}
