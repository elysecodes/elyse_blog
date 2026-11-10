# Elyse — Portfolio & Blog

Personal portfolio for **Irankunda Elyse**: a React 19 + Vite single-page app with a
guest book, an interactive skills chart, a live code playground, a blog, and a
Supabase-backed **admin panel**.

## Stack

- React 19, React Router 6, Vite 6
- Supabase (`@supabase/supabase-js`) — Postgres, Auth, Row-Level Security
- three.js / topojson for the 3D globe on the guest book
- Oxlint

## Local development

```bash
npm install
npm run dev
```

Without Supabase credentials the public site still works using the static
fallback content in `src/lib/fallbackData.js` and the old Web3Forms e-mail
delivery. The admin panel shows a "not configured" notice.

### Environment

Copy `.env.example` to `.env` and fill in your Supabase project values
(Dashboard -> Project Settings -> API):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The anon key is safe to ship in the browser **only** because the database
enforces Row-Level Security. Never use the `service_role` key on the client.

## Admin panel setup

1. **Create a Supabase project** at <https://supabase.com>.
2. **Run the schema.** Open the SQL editor, paste the contents of
   [`db/schema.sql`](db/schema.sql) and run it. It creates the tables, RLS
   policies, triggers and seeds the current projects, skills and a starter post.
3. **Create your admin user.** Dashboard -> Authentication -> Users -> *Add user*
   (email + password). Or sign up once, then disable sign-ups afterwards.
4. **Promote the user to admin.** Run this in the SQL editor with your email:

   ```sql
   insert into public.profiles (id, email, is_admin)
   select id, email, true from auth.users where email = 'you@example.com'
   on conflict (id) do update set is_admin = true;
   ```

5. **Disable public sign-ups** so strangers can't create accounts:
   Authentication -> Providers -> Email -> turn off *Allow new users to sign up*.
6. Add the env vars and restart the dev server. Visit `/admin` and sign in.

> Admin access is enforced by `public.is_admin()` inside the RLS policies, not by
> hiding the route. Creating an account is not enough to become an admin.

### What you can manage at `/admin`

| Section | What it does |
| --- | --- |
| Dashboard | Counts + latest contact messages |
| Guest Book | Approve / hide / delete visitor notes |
| Messages | Read, mark read/unread, reply and delete contact messages (private) |
| Projects | Create, edit, reorder, publish/unpublish project cards |
| Skills | Manage the skills that power the radar chart |
| Blog Posts | Write, slug, publish/unpublish and delete articles (`/blog`) |
| Settings | Name, tagline, contact email and social links used across the site |

## Routes

| Path | Page |
| --- | --- |
| `/` | Home (hero, about, skills, contact) |
| `/projects` | Projects |
| `/guestbook` | Guest book |
| `/playground` | Live HTML/CSS/JS playground |
| `/blog` | Published posts |
| `/blog/:slug` | Single post |
| `/admin/login` | Admin sign-in |
| `/admin` | Admin dashboard (protected) |

## Build & deploy

```bash
npm run build
npm run preview
```

The build defaults to a `/elyse_blog/` base (GitHub Pages) — override it with
`VITE_BASE`. **Vite bakes env vars in at build time**, so make sure
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in the environment where
you run `npm run build`.

`public/404.html` + the redirect shim in `src/main.jsx` handle deep links on
GitHub Pages. `public/robots.txt` disallows `/admin`.

## Security notes

- RLS protects every table: public can read published content and insert
  guest-book/contact rows, but only admins can read messages or write content.
- The Web3Forms key in `src/lib/api.js` is still used for e-mail notifications
  and as the no-Supabase fallback. It is a public client key by design.
- Guests can only submit names up to 80 chars and messages up to the limits
  enforced in `db/schema.sql`.
