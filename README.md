# Tru Esports Community

Version 1 of the Tru website: organization landing page, TruSocials, scrims,
rankings, team management, private match rooms, and Supabase authentication.

## Supabase setup

1. Create a project at Supabase.
2. Open **SQL Editor**, create a new query, paste `supabase/schema.sql`, and run it.
3. Open **Project Settings → API** and copy:
   - Project URL
   - Publishable key (the legacy `anon` key also works)
4. Under **Authentication → URL Configuration**, add the Railway URL as the
   Site URL and Redirect URL after the first Railway deployment.

Never expose or use the Supabase `service_role` key in this frontend project.

## Local development

Copy `.env.example` to `.env.local` and fill in the two public Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
```

Then run:

```bash
npm install
npm run dev
```

## Railway deployment

1. Push this project to a GitHub repository.
2. In Railway, choose **New Project → Deploy from GitHub repo**.
3. Add these Railway variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Railway reads `railway.toml` automatically.

The application uses a standard production Next.js build:

```bash
npm run build
npm run start
```
