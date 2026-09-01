import { supabase } from "../lib/supabase";

let sessionPromise: Promise<string> | null = null;

async function initializeSession() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(
      `No se pudo recuperar la sesión: ${sessionError.message}`
    );
  }

  if (session?.user.id) {
    return session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error || !data.user) {
    throw new Error(
      error
        ? `No se pudo crear la sesión privada: ${error.message}`
        : "No se pudo crear la sesión privada."
    );
  }

  return data.user.id;
}

export function ensureAuthenticatedSession() {
  if (!sessionPromise) {
    sessionPromise = initializeSession().catch((error) => {
      sessionPromise = null;
      throw error;
    });
  }

  return sessionPromise;
}

export async function getAuthenticatedUserId() {
  return await ensureAuthenticatedSession();
}

export interface AccountStatus {
  email: string | null;
  isAnonymous: boolean;
}

export async function getAccountStatus(): Promise<AccountStatus> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error(
      error
        ? `No se pudo consultar la cuenta: ${error.message}`
        : "No se pudo consultar la cuenta."
    );
  }

  return {
    email: data.user.email ?? null,
    isAnonymous: data.user.is_anonymous ?? !data.user.email,
  };
}

function authRedirectUrl() {
  return `${window.location.origin}/`;
}

export async function protectAccountWithEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error("Introduce un correo válido.");
  }

  const { error } = await supabase.auth.updateUser(
    { email: cleanEmail },
    { emailRedirectTo: authRedirectUrl() }
  );

  if (error) {
    throw new Error(`No se pudo proteger la cuenta: ${error.message}`);
  }
}

export async function sendAccountRecoveryLink(email: string) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error("Introduce un correo válido.");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      emailRedirectTo: authRedirectUrl(),
      shouldCreateUser: false,
    },
  });

  if (error) {
    throw new Error(`No se pudo enviar el enlace: ${error.message}`);
  }
}
