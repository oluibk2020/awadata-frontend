# AwaData Commons Frontend

The AwaData Commons frontend is a browser-based proof of concept for a
community-governed mental-health research data commons. It demonstrates how
individual consent and community governance can jointly control access to
synthetic research data. The frontend connects to the separate
[AwaData Commons API](../base-api/README.md).

> **Important:** This is a synthetic-data proof of concept, not a production
> platform, clinical system, or legal-compliance certification. Do not use it
> to collect, display, or process real mental-health or other sensitive
> personal data.

## What the application demonstrates

After sign-in, the dashboard is selected according to the authenticated
account's role:

| Role | Demonstrated workflows |
| --- | --- |
| Participant | Review and update consent preferences, withdraw consent, and view consent history |
| Researcher | Submit research requests, evaluate and execute authorized operations, and manage benefit agreements |
| Governance member | Review, approve, and reject community research requests |
| Auditor | Review audit events |
| Platform or community administrator | Manage communities, datasets, participant records, and governance assignments |

The public landing page and authentication forms are available before sign-in.
The API is responsible for authentication, authorization, consent enforcement,
and data operations; hiding a frontend screen is not an authorization control.

## Technology and structure

- Next.js 16 App Router and React 19
- JavaScript with Tailwind CSS 4
- `lucide-react` icons
- Vitest unit tests for the shared API client

| Path | Purpose |
| --- | --- |
| `app/` | App Router page, root layout, metadata, and global styles |
| `components/` | Landing, authentication, navigation, and role-specific dashboard UI |
| `context/AuthContext.js` | Client-side authentication state and notifications |
| `lib/api.js` | Browser-to-API requests and feature-specific API functions |
| `public/` | Static assets |
| `tests/` | Unit tests |

## Requirements

- Node.js 20.9 or newer
- npm
- The AwaData Commons API running separately for sign-in and data workflows;
  consult the [API setup guide](../base-api/README.md) for its database and
  environment requirements

## Local development

From this directory, install the locked dependencies and create a local
environment file:

```powershell
npm ci
Copy-Item .env.example .env.local
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the API's reachable origin. The
development default is `http://localhost:2000`. This variable is public and is
embedded in the browser bundle; never put credentials, private keys, or other
secrets in a `NEXT_PUBLIC_` variable.

Start the API in a separate terminal by following its setup guide, then run:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend can render
without the API, but authentication and dashboard data require a reachable,
compatible API.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests once (suitable for CI) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |

Before deploying, run:

```powershell
npm ci
npm run lint
npm test
npm run build
```

The unit tests cover API-client request construction, response parsing, HTTP
errors, and network failures. They do not replace browser-level end-to-end
tests or integration tests against a deployed API.

## Production deployment

Deploy as a Node.js Next.js application; this project is not configured for a
static export. Use a supported Node.js runtime (20.9+), install with `npm ci`,
and run `npm run build` followed by `npm run start` (or the equivalent commands
provided by the hosting platform).

Configure `NEXT_PUBLIC_API_URL` to the production API origin **at build time**.
The browser connects directly to that API, so serve both applications over
HTTPS and configure the API's CORS allowlist for the deployed frontend origin.
Keep API secrets on the API server, never in this frontend or its public
environment variables.

## Production limitations

This repository still needs a production security and operational review before
handling real or sensitive data. In particular:

- The current client stores the bearer access token in `localStorage`, where
  injected scripts could access it. Use only synthetic accounts and data until
  the authentication/session design has been reviewed and hardened.
- A production deployment needs the API's authorization, consent, audit, data
  retention, and recovery controls configured and independently verified; the
  frontend alone cannot enforce them.
- The UI and API describe a focused synthetic demonstration. Do not treat
  demo fixtures, sample identities, or workflow messages as real records or
  evidence of regulatory compliance.
- Add and run browser end-to-end tests for the critical sign-in, consent,
  governance, and access-control journeys before relying on this interface in
  production.

## License

No frontend license is specified in this repository. Confirm licensing and
third-party asset terms before redistribution.
