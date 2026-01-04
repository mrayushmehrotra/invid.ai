import { Resend } from "resend";
import env from "./env";

const resend = new Resend(String(env.email.resendApiKey));

export const EmailService = async ({
  to,
  message,
  subject,
}: {
  to: string;
  message: string;
  subject: string;
}) => {
  const { data, error } = await resend.emails.send({
    // IMPORTANT: You can only send from verified domains in Resend
    // For development/testing, use Resend's test domain:
    from: "invid.ai <onboarding@resend.dev>",
    // For production, verify your domain at https://resend.com/domains
    // then use: from: "Ayush <hello@invid.ai>",
    to: [to],
    subject: subject,
    html: message,
  });

  if (error) {
    console.error("Email send error:", error);
    throw new Error(error.message);
  }

  console.log("Email sent successfully:", data);
  return data;
};
