exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: "Pesan kosong" }) };
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "OPENROUTER_API_KEY belum diset di Netlify" }) };
    }

    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // boleh tetap seperti ini (OpenRouter menyarankan identitas app)
        "HTTP-Referer": "https://gilded-licorice-849b8c.netlify.app",
        "X-Title": "AI Chat Netlify"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Kamu AI ramah, jawab singkat dalam Bahasa Indonesia." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await r.json();

    // kalau OpenRouter balikin error (401, 402, model salah, dsb)
    if (!r.ok) {
      return {
        statusCode: r.status,
        body: JSON.stringify({
          error: data?.error?.message || `Request gagal (${r.status})`,
          raw: data
        })
      };
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          error: "Tidak dapat reply dari model",
          raw: data
        })
      };
    }

    return { statusCode: 200, body: JSON.stringify({ reply }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
