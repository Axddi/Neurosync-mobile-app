# NeuroSync Mobile App

NeuroSync is a mobile-first cognitive care coordination app built with React Native and Expo. It helps caregivers, doctors, and care teams monitor mood, track patterns, and stay connected in a low-friction way.

This repository contains the client application for the NeuroSync experience. The app uses AWS Cognito for authentication and calls remote AWS API Gateway/Lambda endpoints for mood data and community information.

## Overview

NeuroSync focuses on simple daily wellbeing tracking for people who may need ongoing cognitive or mental health support. The experience includes:

- secure sign-up and sign-in flows
- role-based access for caregivers and doctors
- daily mood logging with tags and notes
- trend views for recent mood history
- care feed filtering and sorting
- community directory with role-based search
- accessibility settings for low-stimulus, high-contrast, motion reduction, and font scaling
- onboarding to introduce the product

## Features

### Authentication and roles

- Email-based sign-up and sign-in using Amazon Cognito
- Role selection during registration (`caregiver` or `doctor`)
- Confirmation flow for newly created accounts
- Session validation before accessing protected screens

### Mood tracking

- Quick mood selection: Great, Good, Okay, Low, Difficult
- Optional supportive tags such as slept well, social, calm, active, and tired
- Notes field for caregiver context
- Recent mood summaries and trend chart on the dashboard

### Care feed

- View mood logs in a timeline format
- Sort newest or oldest entries
- Filter by mood category
- Review note details and tags associated with each log

### Community directory

- Search users by name
- Filter by role (`all`, `doctor`, `caregiver`)
- View user cards with initials, role badge, and email
- Navigate to user profiles from the community list

### Accessibility

- Low-stimulus mode
- High-contrast mode
- Reduced motion toggle
- Adjustable font scale
- App styling designed to support readability and comfort

## Tech Stack

- React Native
- Expo
- Expo Router
- TypeScript
- Amazon Cognito Identity JS
- AsyncStorage
- React Native Chart Kit
- AWS API Gateway / Lambda integration

## Project Structure

```text
neurosync-mobile/
├── app/                     # Expo Router screens and routes
│   ├── (auth)/              # login, signup, confirm, onboarding
│   ├── (tabs)/              # dashboard, feed, community, settings
│   ├── profile/             # profile detail screen
│   ├── _layout.tsx          # root layout
│   └── modal.tsx
├── src/                     # application logic and services
│   ├── context/             # UI settings context
│   ├── navigation/          # navigation helpers
│   ├── screens/            # legacy screen modules
│   ├── services/           # Cognito and API clients
│   └── theme/              # design tokens
├── components/              # shared UI components
├── constants/               # app constants
├── hooks/                   # custom hooks
├── assets/                  # images, fonts, and static assets
├── android/                 # Android project files
├── app.json                 # Expo app metadata
├── package.json             # project scripts and dependencies
├── tsconfig.json            # TypeScript config
├── metro.config.js          # Metro config
├── eslint.config.js         # ESLint config
├── eas.json                 # EAS build config
├── README.md                # project documentation
└── package-lock.json
```

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+ or later
- npm
- Expo CLI (or use the local Expo scripts)
- Android Studio / Xcode if you want native builds
- AWS Cognito configuration and an existing API backend

## Getting Started

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npx expo start
```

For Android:

```bash
npm run android
```

For iOS:

```bash
npm run ios
```

For web:

```bash
npm run web
```

## Configuration

This app expects a live AWS backend configuration. The mobile client currently contains the following key configuration values directly in the source:

- Cognito `UserPoolId` and `ClientId` in `app/(auth)/login.tsx` and `app/(auth)/signup.tsx`
- API base URL in `src/services/api.ts`
- Community endpoint in `app/(tabs)/community.tsx`

Update these values to match your AWS environment before running the app.

Example pattern:

```ts
const poolData = {
  UserPoolId: "YOUR_USER_POOL_ID",
  ClientId: "YOUR_APP_CLIENT_ID",
};

const BASE_URL = "https://your-api-gateway-url.execute-api.region.amazonaws.com/default";
```

## Backend Relationship

The repository does not include the AWS Lambda or DynamoDB implementation source. Instead, it is designed to connect to externally deployed backend resources, such as:

- Amazon Cognito for authentication
- API Gateway endpoints for mood and user data
- Lambda functions for business logic
- DynamoDB storage for app records

## Environment Notes

The app uses a few local storage keys for accessibility preferences and onboarding state, including:

- `seenOnboarding`
- low-stimulus settings
- high-contrast settings
- reduce-motion settings
- font scale settings

These are stored with `AsyncStorage` on-device.

## Notes

- The project is intentionally mobile-focused and is not a full-stack monorepo.
- The README reflects the current Expo client implementation in this repository.
- For production deployments, connect the app to your own Cognito user pool and deployed API endpoints.

## License

This project is currently private and does not include a separate license file.
