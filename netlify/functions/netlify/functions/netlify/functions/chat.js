exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { message } = JSON.parse(event.body || "{}");
    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: "No message" }) };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }) };
    }

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: "Kamu asisten yang ramah, jawab singkat dan jelas dalam Bahasa Indonesia." },
          { role: "user", content: message }
        ]
      })
    });

    const json = await resp.json();

    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify({ error: json }) };
    }

    // Ambil teks output (Responses API)
    const reply =
      (json.output_text) ||
      (json.output?.[0]?.content?.[0]?.text) ||
      "Tidak ada jawaban.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
};
