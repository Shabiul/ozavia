import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { validateEnquiry } from "@/lib/enquiry";

// ponytail: local file storage, single instance only; swap for a DB or email service when hosted serverless
const dir = path.join(process.cwd(), "data");

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const result = validateEnquiry(body);
  if (!result.ok) return Response.json({ errors: result.errors }, { status: 400 });
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "enquiries.jsonl"), JSON.stringify({ ...result.value, at: new Date().toISOString() }) + "\n");
  return Response.json({ ok: true });
}
