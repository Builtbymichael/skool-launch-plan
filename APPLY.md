# Email capture + nurture flow — deployment steps

What was added (July 2026):
- Plans are now saved to the database with shareable URLs at `/plan/:id`
- Email capture card on the plan results page ("Don't lose this plan")
- `POST /api/subscribe` sends the subscriber their plan by email instantly (Email 0)
- Built-in drip scheduler (runs every 6h inside the server) sends 3 follow-up emails at day 2 / 4 / 7, nudging toward the Skool trial
- One-click unsubscribe at `/api/unsubscribe?token=...`
- Admin stats now include `subscriberCount`

## Deploy from Replit

1. In Replit, open the **Git** pane → **Pull** latest from GitHub (main).
2. In the Replit **Shell**, push the new tables/columns to the database:
   ```
   npm run db:push
   ```
   (If that script doesn't exist: `npx drizzle-kit push`)
3. Check **Secrets**:
   - `RESEND_API_KEY` — must belong to the Resend account where **skoolprep.com is a verified domain** (subscriber emails send from `Skool Prep <updates@skoolprep.com>`)
   - Optional overrides: `SUBSCRIBER_FROM_EMAIL`, `APP_URL` (defaults to https://launchplan.skoolprep.com)
4. **Redeploy** the app.

## Test before announcing
1. Generate a plan on the live site.
2. Use your own email in the "Don't lose this plan" card.
3. Confirm Email 0 arrives, the "View your full plan" link opens `/plan/:id` correctly, and the unsubscribe link works.
4. Drip emails can be sanity-checked by temporarily lowering `afterDays` in `server/email-flow.ts` (remember to revert).
