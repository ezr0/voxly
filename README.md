# Voxly

Voxly is a modern, ad-free React Native podcast app for iOS and Android built with Expo.

## Features

- **Discover** page with podcast search and curated discovery feed
- **Library** page backed by Firestore for saved podcasts
- **Profile** page with Firebase auth/session status
- Uses the **Apple iTunes Search API** (free tier, no API key required)
- Uses **Firebase Authentication** (anonymous auth) + **Cloud Firestore**

## Tech stack

- Expo + React Native + TypeScript
- Expo Router tabs navigation
- Firebase JS SDK (Auth + Firestore)

## 1) Install

```bash
npm install
```

## 2) Configure Firebase

Create `.env` in the repository root:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Firebase requirements:

- Enable **Anonymous Authentication**
- Create **Cloud Firestore** database

## 3) Run

```bash
npm run android
npm run ios
```

You can also run web preview with:

```bash
npm run web
```

## Optional Firebase Functions

You can add Firebase Functions later for recommendation ranking, personalization, or feed aggregation if you want server-side logic.
