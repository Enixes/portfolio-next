import { cv } from "@/data/cv";
import { handleContactPost, isContactAvailable, type ContactConfig } from "./contact-delivery";

const config = (): ContactConfig => ({
  apiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.CONTACT_FROM_EMAIL,
  toEmail: cv.email,
});

export function GET() {
  return Response.json({ available: isContactAvailable(config()) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  return handleContactPost(request, config());
}
