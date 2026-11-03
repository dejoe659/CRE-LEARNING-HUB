# CRE Learning Hub

Computer and Robotics Education learning platform — animated video lessons, study materials, quizzes and timed exams,
AI tutor, admin dashboard and Paystack payments (₦). Next.js 14 · Tailwind CSS · Supabase · Paystack.

> **Sample content only.** The courses in `lib/data.ts` are demonstration data and are **not** an official UNN (or any
> institution's) curriculum. Admins add the real catalogue in `/admin`.

## Run locally
```bash
npm install
cp .env.example .env.local   # fill in keys (optional — the app runs in demo mode without them)
npm run dev
```
Without Supabase keys the app runs in **demo mode**: accounts and progress live in the browser only.

## Go live
1. Create a Supabase project and run `supabase/migrations/0001_init.sql` in the SQL editor.
2. Add the Supabase URL + anon key (and `SUPABASE_SERVICE_ROLE_KEY`, server only) to `.env.local` / Vercel env vars.
3. Register, then make yourself admin: `update public.profiles set role='admin' where id=(select id from auth.users where email='YOU@example.com');`
4. Add `PAYSTACK_SECRET_KEY` and set the Paystack webhook URL to `https://YOUR-DOMAIN/api/paystack/webhook`.
5. Add `ANTHROPIC_API_KEY` to enable the AI tutor. Deploy to Vercel.

## Security notes
- Secret keys are read only in server routes (`app/api/*`); never exposed to the browser.
- Prices come from the server; payments are verified with Paystack (status, currency, amount) and by signed webhook.
- Row Level Security on every table; exam answers live in an admin-only table and are marked in a server-side function.

## Status
Built and verified: homepage, auth, student dashboard, catalogue, course page, animated video learning interface, quizzes/exams,
results, AI tutor UI + API route, admin dashboard, Paystack routes, SQL schema with RLS.
Not yet verified end-to-end against live services: Supabase, Paystack and the AI API (no keys were available in the build environment).
Student quiz/exam attempts in the student UI currently save to the browser; the database function `grade_attempt()` is provided for server-side marking.
