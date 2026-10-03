export type ContactConfig = {
  apiKey?: string;
  fromEmail?: string;
  toEmail: string;
};

const topics = new Set(["Systems", "AI", "Collaboration", "Other"]);
const emailPattern = /^[^\s@<>\x00-\x1f]+@[^\s@<>\x00-\x1f]+\.[^\s@<>\x00-\x1f]+$/;

export function isContactAvailable(config: ContactConfig) {
  return Boolean(config.apiKey?.trim() && config.fromEmail?.trim() && emailPattern.test(config.fromEmail));
}

function isText(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function json(body: object, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function handleContactPost(
  request: Request,
  config: ContactConfig,
  transport: typeof fetch = fetch,
): Promise<Response> {
  if (!isContactAvailable(config)) {
    return json({ error: "The form is being set up. Please use the email link for now." }, 503);
  }

  let fields: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 16000) return json({ error: "The note is too long." }, 413);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
    fields = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "Please check the note and try again." }, 400);
  }

  // A browser autofill can occasionally touch hidden inputs, so never report
  // delivery for a trapped submission that did not reach the provider.
  if (typeof fields.website === "string" && fields.website.trim()) {
    return json({ error: "Please leave the extra field blank and try again." }, 400);
  }

  const { name, email, topic, message } = fields;
  if (!isText(name, 2, 80) || !isText(email, 3, 254) || !emailPattern.test(email.trim()) ||
      typeof topic !== "string" || !topics.has(topic) || !isText(message, 10, 4000)) {
    return json({ error: "Please complete each field with a valid name, email, topic, and message." }, 400);
  }

  // The provider receives plain text only; user content never becomes HTML.
  const cleanName = name.trim().replace(/[\x00-\x1f\x7f]/g, " ");
  const cleanEmail = email.trim();
  const cleanMessage = message.trim().replace(/\r\n?/g, "\n");
  const payload = {
    from: config.fromEmail!.trim(),
    to: [config.toEmail],
    reply_to: cleanEmail,
    subject: `Portfolio field note · ${topic}`,
    text: `From: ${cleanName} <${cleanEmail}>\nTopic: ${topic}\n\n${cleanMessage}`,
  };

  try {
    const response = await transport("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey!.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return json({ error: "The note could not be delivered. Please try again or email directly." }, 502);
    const receipt: unknown = await response.json();
    if (!receipt || typeof receipt !== "object" ||
        typeof (receipt as { id?: unknown }).id !== "string" || !(receipt as { id: string }).id) {
      return json({ error: "Delivery could not be confirmed. Please email directly." }, 502);
    }
    return json({ ok: true }, 200);
  } catch {
    return json({ error: "The direct line is unavailable. Please try again or email directly." }, 502);
  }
}
