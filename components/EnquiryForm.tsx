"use client";

import { useState } from "react";

type State = { status: "idle" | "sending" | "sent"; errors: Record<string, string> };

const field =
  "w-full border-b border-cream/25 bg-transparent py-3 text-lg text-cream placeholder:text-cream/30 outline-none transition-colors focus:border-gold";

export function EnquiryForm() {
  const [state, setState] = useState<State>({ status: "idle", errors: {} });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState({ status: "sending", errors: {} });
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (res.ok) {
        form.reset();
        setState({ status: "sent", errors: {} });
      } else {
        const data = await res.json().catch(() => ({}));
        setState({ status: "idle", errors: data.errors ?? { form: "Something went wrong. Please try again." } });
      }
    } catch {
      setState({ status: "idle", errors: { form: "Could not reach the server. Please try again." } });
    }
  }

  if (state.status === "sent")
    return (
      <p role="status" className="font-display text-3xl text-gold-light">
        Thank you. Your enquiry is with us and we will write back soon.
      </p>
    );

  const err = (k: string) =>
    state.errors[k] && (
      <p id={`${k}-error`} className="mt-2 text-sm text-[#f0a48f]">
        {state.errors[k]}
      </p>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8">
      <div>
        <label htmlFor="name" className="eyebrow">Name</label>
        <input id="name" name="name" autoComplete="name" className={field} aria-invalid={!!state.errors.name} aria-describedby="name-error" />
        {err("name")}
      </div>
      <div>
        <label htmlFor="email" className="eyebrow">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" className={field} aria-invalid={!!state.errors.email} aria-describedby="email-error" />
        {err("email")}
      </div>
      <div>
        <label htmlFor="message" className="eyebrow">Message</label>
        <textarea id="message" name="message" rows={3} className={`${field} resize-none`} placeholder="Gifting, trade or anything else" aria-invalid={!!state.errors.message} aria-describedby="message-error" />
        {err("message")}
      </div>
      {/* honeypot: hidden from people, tempting to bots */}
      <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div role="alert">{err("form")}</div>
      <button
        type="submit"
        disabled={state.status === "sending"}
        className="group relative isolate w-fit overflow-hidden border border-gold px-10 py-4 text-xs uppercase tracking-[0.4em] text-gold transition-colors duration-500 hover:text-ink disabled:opacity-50"
      >
        <span className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-y-100" />
        {state.status === "sending" ? "Sending" : "Send enquiry"}
      </button>
    </form>
  );
}
