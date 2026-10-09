
const ALLOWED_ORIGIN =
  "https://give-me-ideas.adrianscriptpov.workers.dev";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function jsonResponse(data, status, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...extraHeaders
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };

    /* HEALTH CHECK */

    if (url.pathname === "/health" && request.method === "GET") {
      return jsonResponse(
        { status: "healthy" },
        200
      );
    }

    /* API PREFLIGHT */

    if (url.pathname === "/api/ideas" && request.method === "OPTIONS") {
      if (origin && origin !== ALLOWED_ORIGIN) {
        return jsonResponse(
          { success: false, message: "Origin not allowed." },
          403
        );
      }

      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    /* SUBMIT IDEA */

    if (url.pathname === "/api/ideas" && request.method === "POST") {
      if (origin !== ALLOWED_ORIGIN) {
        return jsonResponse(
          { success: false, message: "Origin not allowed." },
          403
        );
      }

      const contentType = request.headers.get("Content-Type") || "";

      if (!contentType.toLowerCase().includes("application/json")) {
        return jsonResponse(
          { success: false, message: "Content-Type must be application/json." },
          415,
          corsHeaders
        );
      }

      let body;

      try {
        body = await request.json();
      } catch {
        return jsonResponse(
          { success: false, message: "Invalid JSON request." },
          400,
          corsHeaders
        );
      }

      const idea = typeof body.idea === "string"
        ? body.idea.trim()
        : "";

      if (!idea || idea.length > 500) {
        return jsonResponse(
          {
            success: false,
            message: "Your idea must be between 1 and 500 characters."
          },
          400,
          corsHeaders
        );
      }

      if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
        console.error("Telegram secrets are not configured.");

        return jsonResponse(
          {
            success: false,
            message: "The idea inbox is temporarily unavailable."
          },
          503,
          corsHeaders
        );
      }

      try {
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              chat_id: env.TELEGRAM_CHAT_ID,
              text:
                "NEW APP IDEA\n\n" +
                idea +
                "\n\nSource: Adrian Builds"
            })
          }
        );

        let telegramData;

        try {
          telegramData = await telegramResponse.json();
        } catch {
          throw new Error("Telegram returned invalid JSON.");
        }

        if (
          !telegramResponse.ok ||
          telegramData.ok !== true
        ) {
          console.error("Telegram API rejected the message.");

          return jsonResponse(
            {
              success: false,
              message: "Could not deliver your idea. Please try again."
            },
            502,
            corsHeaders
          );
        }

        return jsonResponse(
          {
            success: true,
            message: "Idea sent successfully."
          },
          200,
          corsHeaders
        );

      } catch (error) {
        console.error("Telegram delivery failed:", error);

        return jsonResponse(
          {
            success: false,
            message: "Could not deliver your idea. Please try again."
          },
          502,
          corsHeaders
        );
      }
    }

    /* STATIC SITE */

    return env.ASSETS.fetch(request);
  }
};
