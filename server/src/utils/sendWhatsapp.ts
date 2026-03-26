let client: any | null = null;

async function getClient(): Promise<any | null> {
  if (client) return client;

  const sid = process.env.TWILIO_SID;
  const auth = process.env.TWILIO_AUTH;
  if (!sid || !auth) return null;

  try {
    const twilioMod = await import("twilio");
    const twilio = twilioMod.default as unknown as (sid: string, auth: string) => any;
    client = twilio(sid, auth);
    return client;
  } catch (err) {
    console.warn("Twilio not available; skipping WhatsApp sending.", err);
    return null;
  }
}

export async function sendWhatsApp(to: string, message: string) {
  const twilioClient = await getClient();
  if (!twilioClient) return;

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
    });
  } catch (error) {
    console.error("WhatsApp error:", error);
  }
}