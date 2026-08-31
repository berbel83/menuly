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
