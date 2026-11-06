# White-label Monetize (Creator Dashboard)

The creator dashboard for a white-label BitoCircle community. Creators on your community see their earnings
and manage how they earn: ad revenue, brand collaborations, gifts and badges, fan subscriptions, analytics
and payouts (with W-9 / 1099-K tax steps). Their data stays on your own community.

It ships with the sample brand **Circle**, live at https://circle.paybito.com/monetize.

## How it fits with your community app

- It is served from the same domain as your community app, under `/monetize`
  (for example `https://your-community.com/monetize`).
- Members sign in on your community app. This dashboard reads that sign-in (the
  `paybito_launch_platform_token` and `paybito_launch_platform_uuid` cookies), so there is no separate
  login. When nobody is signed in it opens your community's `/login` page.
- All data comes from the PayBito services (MonetizeService, BitohubService, BrokerAdminApi on
  `institutional-bo.paybito.com`). They recognise your community from the browser's Origin, so earnings,
  gifts, subscriptions and campaigns are kept per community. Your domain must be verified as a
  community domain.

## Make it yours

Everything brand-related is in one file: `src/config/whitelabel.js`.

| What | Where |
|---|---|
| Brand name, product name, description | `src/config/whitelabel.js` |
| Links back to your community (home, profile, sign-in path) | `communityLinks`, `signInPath` in `src/config/whitelabel.js` |
| Colors | `src/config/whitelabel.js` |
| Logo and icons | replace `public/bitoHubTextLogo.png`, `public/bitoHubLogo.png`, `public/favicon-32x32.png` |

Change the look, not the wiring: keep the service addresses as they are.

## Run it

```bash
npm ci
npm run dev        # http://localhost:3074/monetize
npm run build
npm start          # production server on port 3074
```

For local work, sign in on your community app on the same host first, so the sign-in cookies are there.

## Deploy

The app is a Next.js server with `basePath: '/monetize'` (see `next.config.mjs`).

1. `npm ci && npm run build`, then run it with `npm start` (port 3074) or as a Next.js standalone server
   (`.next/standalone/server.js`, with `.next/static` and `public/` copied next to it).
2. On your community domain, send **`/monetize` and everything under it** to that server **with the full
   path unchanged**. Do not strip the `/monetize` prefix and do not redirect; the app's pages and its
   `/monetize/_next/...` files both need the prefix.

nginx example, next to your community app:

```nginx
location /monetize {
    proxy_pass http://127.0.0.1:3074;      # no trailing slash: the path is passed unchanged
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Apache example:

```apache
ProxyPass        /monetize http://127.0.0.1:3074/monetize
ProxyPassReverse /monetize http://127.0.0.1:3074/monetize
```

If you serve it from another path, change `basePath` in `next.config.mjs` and in
`src/config/whitelabel.js` to the same value.

## Notes for creators

- Payouts need a verified Form W-9; the annual Form 1099-K becomes available after verification.
- Fan subscription plans can be chosen after the subscription settings are saved.

## License

See `LICENSE`.
