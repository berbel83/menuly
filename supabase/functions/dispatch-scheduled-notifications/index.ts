import { createClient } from "npm:@supabase/supabase-js@2";
import {
  sendNotification,
  type PushSubscription,
} from "npm:web-push-neo";

const jsonResponse = (
  body: Record<string, unknown>,
  status = 200,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse(
      { ok: false, error: "Método no permitido." },
      405,
    );
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  const receivedSecret = request.headers.get("x-cron-secret");

  if (!cronSecret || receivedSecret !== cronSecret) {
    return jsonResponse(
      { ok: false, error: "No autorizado." },
      401,
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !vapidPublicKey ||
      !vapidPrivateKey
    ) {
      throw new Error("Faltan variables de entorno.");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const now = new Date();

    const { data: notifications, error } = await supabase.rpc(
      "claim_due_notifications",
      { p_limit: 50 },
    );

    if (error) {
      throw new Error(
        `No se pudieron reservar las notificaciones: ${error.message}`,
      );
    }

    if (!notifications || notifications.length === 0) {
      return jsonResponse({
        ok: true,
        processed: 0,
        message: "No hay notificaciones pendientes.",
      });
    }

    let sent = 0;
    let retried = 0;
    let failed = 0;

    for (const notification of notifications) {
      try {
        const {
          data: subscriptionData,
          error: subscriptionError,
        } = await supabase
          .from("push_subscriptions")
          .select("endpoint, p256dh, auth")
          .eq("endpoint", notification.subscription_endpoint)
          .single();

        if (subscriptionError || !subscriptionData) {
          throw new Error("No se encontró la suscripción push.");
        }

        const subscription: PushSubscription = {
          endpoint: subscriptionData.endpoint,
          keys: {
            p256dh: subscriptionData.p256dh,
            auth: subscriptionData.auth,
          },
        };

        const payload = JSON.stringify({
          title: notification.title,
          body: notification.body,
          icon: "https://compausa.vercel.app/pwa-192x192.png",
          badge: "https://compausa.vercel.app/favicon-64x64.png",
          url: notification.url || "/fasting",
        });

        await sendNotification(subscription, payload, {
          vapidDetails: {
            subject: "https://compausa.vercel.app",
            publicKey: vapidPublicKey,
            privateKey: vapidPrivateKey,
          },
          TTL: 3600,
          urgency: "high",
        });

        if (notification.notification_type === "fast_start_reminder") {
          const next = new Date(notification.scheduled_at);

          do {
            next.setUTCDate(next.getUTCDate() + 1);
          } while (next.getTime() <= now.getTime());

          const { error: updateError } = await supabase
            .from("scheduled_notifications")
            .update({
              scheduled_at: next.toISOString(),
              status: "pending",
              sent_at: now.toISOString(),
              processing_started_at: null,
            })
            .eq("id", notification.id)
            .eq("status", "processing");

          if (updateError) {
            throw new Error(
              `No se pudo programar el recordatorio de mañana: ${updateError.message}`,
            );
          }
        } else {
          const { error: updateError } = await supabase
            .from("scheduled_notifications")
            .update({
              status: "sent",
              sent_at: now.toISOString(),
              processing_started_at: null,
            })
            .eq("id", notification.id)
            .eq("status", "processing");

          if (updateError) {
            throw new Error(
              `No se pudo marcar como enviada: ${updateError.message}`,
            );
          }
        }

        sent++;
      } catch (notificationError) {
        console.error("Error enviando notificación:", notificationError);

        const attempts = Number(notification.attempts ?? 1);
        const finalFailure = attempts >= 3;
        const retryAt = new Date(Date.now() + 5 * 60 * 1000);

        const { error: failedUpdateError } = await supabase
          .from("scheduled_notifications")
          .update({
            status: finalFailure ? "failed" : "pending",
            scheduled_at: finalFailure
              ? notification.scheduled_at
              : retryAt.toISOString(),
            processing_started_at: null,
          })
          .eq("id", notification.id)
          .eq("status", "processing");

        if (failedUpdateError) {
          console.error(
            "No se pudo actualizar el reintento:",
            failedUpdateError,
          );
        }

        if (finalFailure) {
          failed++;
        } else {
          retried++;
        }
      }
    }

    return jsonResponse({
      ok: true,
      processed: notifications.length,
      sent,
      retried,
      failed,
    });
  } catch (error) {
    console.error(error);

    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      500,
    );
  }
});
