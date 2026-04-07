<a id="readme-top"></a>

## About The Project

This Twitter Clone demonstrates a modern multi-client architecture with a NestJS API, a Next.js web app, and an Expo React Native mobile app.

**Key Features:**

- **Authentication:** Email/password auth and Google OAuth support (web and mobile callback flow).
- **Core Tweets:** Create, delete, quote, pin/unpin, and interact with tweets.
- **Media + GIFs:** Image uploads via Cloudinary and GIF integration.
- **Direct Messages:** Private conversations with message list/detail screens.
- **Bookmarks:** Save and manage bookmarked tweets.
- **Polls:** Create polls and vote on poll options.
- **Community Notes:** Add and rate notes for potentially misleading tweets.
- **Reels/Video Feed:** Dedicated video timeline endpoint and mobile reels screen.
- **Realtime + Push:** Socket.IO realtime updates and push notification support.
- **Chatting with Gemini** Gemini integration in tweets, triggered by @grok mention.
- **Dark/Light Mode:** Theme toggling for improved UX.

**Architecture Overview:**

- Frontend (Next.js): Presentation layer for web, using TanStack Query and Firebase client auth.
- Mobile (Expo React Native): Native/web mobile client with Expo Router, React Query, Socket.IO client, and push registration.
- Backend (NestJS): REST + websocket API layer following a layered architecture (Controller -> Service -> Repository).
- Database (PostgreSQL): Stores relational data like Users, Tweets, and Relationships.
- Realtime Transport: Socket.IO gateway on `/ws`.
- External Services: Cloudinary (media), Firebase (auth + admin), Google OAuth, Expo push, and Gemini integration.

### Built With

- [![Next](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
- [![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
- [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
- [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
- [![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
- [![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query/latest)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

The repository uses Docker for PostgreSQL and runs three app surfaces locally:

- `backend-nestjs` on `http://localhost:3000`
- `frontend` on `http://localhost:3001`
- `mobile` (Expo dev server) on `http://localhost:3001`

To get a local setup running, complete env configuration first, then start services.

### Prerequisites

- Node.js 18+ (recommended) and npm/yarn
- Docker Desktop (or Docker Engine) for PostgreSQL
- Firebase project credentials
- Cloudinary credentials
- Google OAuth credentials (if you want OAuth enabled)

### Quickstart (All Services)

1. Clone the repository:

```sh
git clone https://github.com/martinanajdovska/twt-clone.git
cd twt-clone
```

2. Create env files from examples:
   - root: `.env` from `.env.example`
   - backend: `backend-nestjs/.env` from `backend-nestjs/.env.example`
   - frontend: `frontend/.env` from `frontend/.env.example`
   - mobile: `mobile/.env` from `mobile/.env.example`

3. Start PostgreSQL:

```sh
docker compose up
```

4. Start backend:

```sh
cd backend-nestjs
yarn install
yarn start:dev
```

5. Start frontend:

```sh
cd frontend
yarn install
yarn dev
```

6. Start mobile (Expo):

```sh
cd mobile
npm install
npm run start
```

## Environment Configuration

### 1) Root `.env` (Docker / PostgreSQL)

Used by `docker-compose.yml` to boot the local database.

| Variable      | Purpose                                      | Example     |
| ------------- | -------------------------------------------- | ----------- |
| `DB_USER`     | PostgreSQL username for the Docker container | `postgres`  |
| `DB_PASSWORD` | PostgreSQL password for the Docker container | `postgres`  |
| `DB_DATABASE` | Initial database name created by Docker      | `twt_clone` |

### 2) Backend `.env` (`backend-nestjs/.env`)

Use `backend-nestjs/.env.example` as the source of truth.

| Variable                         | Purpose                                                                        | Example                                             |
| -------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| `DB_HOST`                        | Postgres host the API connects to                                              | `localhost`                                         |
| `DB_PORT`                        | Postgres port for backend DB connection                                        | `5433`                                              |
| `DB_USER`                        | Postgres username used by the backend                                          | `postgres`                                          |
| `DB_PASSWORD`                    | Postgres password used by the backend                                          | `postgres`                                          |
| `DB_DATABASE`                    | Postgres database name used by the backend                                     | `twt_clone`                                         |
| `BACKEND_JWT_SECRET`             | Secret for signing backend JWTs                                                | `replace_with_strong_secret`                        |
| `FRONTEND_URL`                   | Allowed frontend origin for CORS                                               | `http://localhost:3001`                             |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase service account JSON (optional if using inline Firebase vars) | `/abs/path/firebase-admin.json`                     |
| `FIREBASE_PROJECT_ID`            | Firebase Admin project id fallback                                             | `your-project-id`                                   |
| `FIREBASE_CLIENT_EMAIL`          | Firebase Admin client email fallback                                           | `firebase-adminsdk@project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY`           | Firebase Admin private key fallback                                            | `-----BEGIN PRIVATE KEY-----...`                    |
| `CLOUDINARY_CLOUD_NAME`          | Cloudinary cloud name for media uploads                                        | `your_cloud`                                        |
| `CLOUDINARY_API_KEY`             | Cloudinary API key                                                             | `123456789`                                         |
| `CLOUDINARY_API_SECRET`          | Cloudinary API secret                                                          | `replace_me`                                        |
| `GEMINI_API_KEY`                 | Gemini API key used by Grok feature                                            | `replace_me`                                        |
| `PORT`                           | Backend API port                                                               | `3000`                                              |
| `EXPO_ACCESS_TOKEN`              | Expo server token for push notifications                                       | `replace_me`                                        |
| `GOOGLE_OAUTH_CLIENT_ID`         | Google OAuth client id for auth flow                                           | `xxxxxxxx.apps.googleusercontent.com`               |
| `GOOGLE_OAUTH_CLIENT_SECRET`     | Google OAuth client secret                                                     | `replace_me`                                        |
| `GOOGLE_OAUTH_REDIRECT_URI`      | Backend OAuth callback URL                                                     | `http://localhost:3000/api/auth/google/callback`    |
| `GOOGLE_OAUTH_STATE_SECRET`      | Secret used to sign OAuth state                                                | `replace_with_random_secret`                        |
| `MOBILE_OAUTH_CALLBACK_URI`      | Mobile deep-link callback URI                                                  | `mobile://auth/callback`                            |

### 3) Frontend `.env` (`frontend/.env`)

Use `frontend/.env.example` and add `NEXT_PUBLIC_API_URL` when needed.

| Variable                                   | Purpose                                                                                       | Example                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------ |
| `NEXT_PUBLIC_BASE_URL`                     | Primary backend base URL used by frontend API client                                          | `http://localhost:3000`        |
| `NEXT_PUBLIC_API_URL`                      | Optional backend URL for `next.config.ts` API rewrites (falls back to `NEXT_PUBLIC_BASE_URL`) | `http://localhost:3000`        |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Firebase client API key for web auth                                                          | `replace_me`                   |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain                                                                          | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase web project id                                                                       | `your-project-id`              |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket                                                                       | `your-project.appspot.com`     |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender id                                                                            | `1234567890`                   |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase web app id                                                                           | `1:1234567890:web:abcdef`      |
| `NEXT_PUBLIC_GIFS_API_KEY`                 | Klipy GIF API key used by GIF picker                                                          | `replace_me`                   |

### 4) Mobile `.env` (`mobile/.env`)

Use `mobile/.env.example`.

| Variable                                | Purpose                                                                | Example                        |
| --------------------------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| `EXPO_PUBLIC_API_URL`                   | Backend base URL consumed by mobile API client                         | `http://localhost:3000`        |
| `EXPO_PUBLIC_FIREBASE_API_KEY`          | Firebase client API key for mobile auth                                | `replace_me`                   |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`      | Firebase auth domain                                                   | `your-project.firebaseapp.com` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`       | Firebase project id for mobile                                         | `your-project-id`              |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`   | Firebase storage bucket for mobile                                     | `your-project.appspot.com`     |
| `EXPO_PUBLIC_FIREBASE_APP_ID`           | Firebase app id for mobile                                             | `1:1234567890:android:abcdef`  |
| `EXPO_PUBLIC_MOBILE_OAUTH_CALLBACK_URI` | Mobile OAuth callback deep link (defaults to `mobile://auth/callback`) | `mobile://auth/callback`       |
| `GIFS_API_KEY`                          | GIF API key consumed by Expo app config                                | `replace_me`                   |
| `EXPO_PUBLIC_VAPID_PUBLIC_KEY`          | Web push VAPID key for Expo web notifications                          | `BExamplePublicKey`            |

## Mobile App Setup

1. Ensure backend API is running on `http://localhost:3000` (or set `EXPO_PUBLIC_API_URL`).
2. Create `mobile/.env` from `mobile/.env.example`.
3. Install dependencies and start Expo:

```sh
cd mobile
npm install
npm run start
```

4. Optional launch commands:

```sh
npm run android
npm run ios
npm run web
npm run start:dev-client
```

### Mobile Platform Notes

- Native push notifications require a **physical device** (simulators return no push token).
- Web push requires:
  - `EXPO_PUBLIC_VAPID_PUBLIC_KEY` in `mobile/.env`
  - service worker at `mobile/public/service-worker.js`
- For native Firebase auth/build integrations, provide:
  - `mobile/google-services.json` (Android)
  - `mobile/GoogleService-Info.plist` (iOS)
- Mobile realtime uses Socket.IO and connects to backend websocket path `/ws`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
