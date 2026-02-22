# Restaurants App - Setup & Run Guide

## Prerequisites

### Required Versions
- **Node.js**: 18.x or higher (recommended 20.x LTS)
- **npm**: 9.x or higher
- **Expo CLI**: 6.x or higher
- **Android Studio**: Latest (for Android development)
- **Xcode**: Latest (for iOS development - macOS only)

### Environment Setup
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Install Expo CLI: `npm install -g @expo/cli`
3. Install Expo Go app on your mobile device (for testing)

## Quick Start

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd restaurants
npm install
```

### 2. Environment Configuration
Create `.env` file in project root:
```env
You need a google api key to use the location feature in create restaurant page
Check .env.example for required variables


```
### 3. Deployed links for both
### Note. Safe way to check latest design always run project on machine and scan a qr because deployed links may not reflect latest changes
```bash
android: https://expo.dev/preview/update?message=fix+design+issues+deployment+11&updateRuntimeVersion=1.0.0&createdAt=2026-02-20T23%3A21%3A36.129Z&slug=exp&projectId=a3e15141-51d1-4ea1-bdaf-5f5fbaffc8e0&group=933fe486-b64b-4d37-a25c-337521ebfc16

ios:https://expo.dev/preview/update?message=fix+design+issues+deployment+11&updateRuntimeVersion=1.0.0&createdAt=2026-02-20T23%3A19%3A17.353Z&slug=exp&projectId=a3e15141-51d1-4ea1-bdaf-5f5fbaffc8e0&group=db07c3dc-41cb-4cc7-8b37-77ded8e583c7



### 3. Run Development Server
```bash
npx expo start
```

### 4. Test on Device
- **Android**: Scan QR code with Expo Go app
- **iOS**: Scan QR code with Camera app (iOS 13+)

**Note**: This is a native-only app and will not build or run on web. Only Android and iOS platforms are supported.

## Platform-Specific Setup

### Android Development
1. Install Android Studio
2. Create Android Virtual Device (AVD)
3. Start emulator: `npx expo start --android`
4. Or connect physical device via USB with USB debugging enabled

### iOS Development (macOS only)
1. Install Xcode from App Store
2. Install iOS Simulator
3. Run: `npx expo start --ios`
4. Or connect physical iPhone via cable

## Common Issues & Solutions

### Known Backend Issues
The following are known backend API issues that may affect app functionality:

- **Status Bar**: Status bar icons may not appear on some Android emulators

### Status Bar Not Visible
If status bar icons don't appear:
1. Restart emulator/device completely
2. Check emulator settings: Extended controls → Display → Enable status bar
3. Run: `adb shell settings put global policy_control null`
4. Test on physical device

### Metro Bundle Issues
```bash
# Clear cache
npx expo start -c

# Reset node_modules
rm -rf node_modules package-lock.json
npm install
```

### Build Issues
```bash
# For Android
npx expo build:android

# For iOS
npx expo build:ios
```

## Project Structure
```
src/
├── api/           # API endpoints and React Query hooks
├── components/     # Reusable UI components
├── constants/      # App constants and themes
├── hooks/         # Custom React hooks
├── navigation/     # Navigation configuration
├── screens/        # App screens
├── storage/        # Local storage utilities
└── utils/         # Utility functions and SVG icons

app/
├── _layout.tsx    # Root layout with providers
└── (tabs)/        # Tab navigation
```

## Deployment

### Development Build
```bash
# Android APK
npx expo build:android --type apk

# iOS IPA
npx expo build:ios --type archive
```

### App Store Submission
1. Create EAS account: `npx expo register`
2. Configure build profiles in `eas.json`
3. Submit: `npx expo submit`

## AI Tools Used

This project was developed with assistance from AI tools to accelerate development and solve specific technical challenges:

### Claude AI (Anthropic)
- **Map Integration**: Implemented Google Maps integration with custom markers, map cards overlay, and marker selection synchronization
- **Root Navigator Setup**: Properly configured AuthStack and AppStack navigation structure
- **Context Handling**: Resolved authentication context issues and ensured proper state management across the app

### ChatGPT (OpenAI)
- **Bottom Tab Navigator**: Solved hidden tab issue in the bottom tab navigator, ensuring proper tab visibility and functionality

These AI tools were used as development assistants to accelerate implementation and resolve specific technical challenges, with all code reviewed and integrated into the final application.

## Technology Stack

### Data Fetching & State Management
- **React Query (@tanstack/react-query)**: Efficient server state management, caching, and background updates
- **Axios**: HTTP client for API requests with automatic token injection
- **TypeScript**: Type-safe API interfaces and response handling

### Navigation
- **React Navigation**: Declarative navigation with conditional routing
- **Expo Router**: File-based routing system for React Native
- **Safe Area Context**: Proper handling of device notches and safe areas

### Authentication & Storage
- **AsyncStorage**: Persistent local storage for tokens and user data
- **JWT (JSON Web Tokens)**: Stateless authentication with bearer tokens
- **Axios Interceptors**: Automatic token attachment to all API requests

### UI & Styling
- **React Native**: Cross-platform mobile development framework
- **Expo SDK**: Development platform and build tools
- **React Native Maps**: Google Maps integration with custom markers
- **React Native SVG**: Scalable vector graphics for icons and UI elements

## Support
For issues:
1. Check [Expo documentation](https://docs.expo.dev/)
2. Verify environment variables in `.env`
3. Ensure all dependencies are installed
4. Test on physical device if emulator fails

### Backend Troubleshooting
If experiencing issues with restaurant editing or missing comment names:
1. Verify backend API endpoints are properly implemented
2. Check API response structure matches expected format
3. Ensure authentication headers are properly sent
4. Test API endpoints directly (e.g., using Postman) to confirm functionality

## Version Information
- React Native: 0.74.x (via Expo SDK 50+)
- Expo SDK: 50.x
- React: 18.x
- TypeScript: 5.x