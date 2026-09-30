export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (url.pathname === "/api/ideas" && request.method === "POST") {
      try {
        const body = await request.json();
        const idea = String(body.idea || "").trim();

        if (!idea || idea.length > 500) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Idea must be between 1 and 500 characters.",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Telegram is not configured.",
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: env.TELEGRAM_CHAT_ID,
              text:
                `NEW APP IDEA\n\n` +
                `${idea}\n\n` +
                `Source: Adrian Builds`,
            }),
          }
        );

        if (!telegramResponse.ok) {
          console.error(
            "Telegram API error:",
            await telegramResponse.text()
          );

          return new Response(
            JSON.stringify({
              success: false,
              message: "Could not send the idea.",
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Idea sent successfully.",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        console.error("Request error:", error);

        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid request.",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "healthy",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    return env.ASSETS.fetch(request);
  },
};
