require('dotenv').config();

module.exports = {
  expo: {
    name: 'mobile',
    slug: 'mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'mobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      googleServicesFile: './GoogleService-Info.plist',
    },
    notification: {
      vapidPublicKey: process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY,
      serviceWorkerPath: "/service-worker.js",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.martinanajdovska.mobile',
      googleServicesFile: './google-services.json',
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "mobile",
              host: "auth",
              pathPrefix: "/callback",
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      "expo-notifications",
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '5f6a4e37-7199-41c4-8920-0ac67f9bb786',
      },
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      mobileOAuthCallbackUri:
        process.env.EXPO_PUBLIC_MOBILE_OAUTH_CALLBACK_URI ||
        'mobile://auth/callback',
      gifsApiKey: process.env.GIFS_API_KEY,
    },
    owner: 'martinanajdovska',
  },
};
