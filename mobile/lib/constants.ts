import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as
  | {
      apiUrl?: string;
      firebaseApiKey?: string;
      firebaseAuthDomain?: string;
      firebaseProjectId?: string;
      firebaseStorageBucket?: string;
      firebaseAppId?: string;
      mobileOAuthCallbackUri?: string;
      gifsApiKey?: string;
    }
  | undefined;

// const raw = extra?.apiUrl ?? "http://localhost:3000";
const raw = "https://manuela-omnicompetent-masterly.ngrok-free.dev";

export const API_URL =
  raw.startsWith("http://") || raw.startsWith("https://")
    ? raw
    : `http://${raw}`;

export const GIFS_API_KEY = extra?.gifsApiKey ?? "";

export const firebaseConfig = extra
  ? {
      apiKey: extra.firebaseApiKey,
      authDomain: extra.firebaseAuthDomain,
      projectId: extra.firebaseProjectId,
      storageBucket: extra.firebaseStorageBucket,
      appId: extra.firebaseAppId,
    }
  : null;

export const MOBILE_OAUTH_CALLBACK_URI =
  extra?.mobileOAuthCallbackUri || "mobile://auth/callback";
