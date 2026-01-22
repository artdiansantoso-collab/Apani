exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "OPENROUTER_API_KEY not set" })
      };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site.netlify.app",
        "X-Title": "AI Chat Netlify"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Kamu AI ramah, jawab pakai Bahasa Indonesia." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: data.choices?.[0]?.message?.content || "AI tidak menjawab"
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
