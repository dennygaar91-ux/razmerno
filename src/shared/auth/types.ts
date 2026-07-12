export type CustomerProfile = {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerProfilePatch = {
  full_name?: string;
  phone?: string | null;
};

export type AuthMode = "login" | "register";

export type AuthCredentials = {
  email: string;
  password: string;
  fullName?: string;
};

export type AuthErrorCode =
  | "not_configured"
  | "invalid_credentials"
  | "email_taken"
  | "weak_password"
  | "network"
  | "unknown";

export type AuthResult =
  | { ok: true }
  | { ok: false; code: AuthErrorCode; message: string };

export type ProfileApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; status?: number };
