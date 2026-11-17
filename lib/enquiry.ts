export type Enquiry = { name: string; email: string; message: string };
type Result = { ok: true; value: Enquiry } | { ok: false; errors: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEnquiry(input: unknown): Result {
  if (typeof input !== "object" || input === null) return { ok: false, errors: { form: "Invalid request." } };
  const f = input as Record<string, unknown>;
  const str = (k: string) => (typeof f[k] === "string" ? (f[k] as string).trim() : "");
  const name = str("name"), email = str("email"), message = str("message");
  const errors: Record<string, string> = {};
  if (str("company")) errors.form = "Invalid request."; // honeypot
  if (name.length < 2 || name.length > 80) errors.name = "Please enter your name (2 to 80 characters).";
  if (email.length > 200 || !EMAIL.test(email)) errors.email = "Please enter a valid email address.";
  if (message.length < 10 || message.length > 2000) errors.message = "Please write a message of 10 to 2000 characters.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { name, email, message } };
}
