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
Create a `.env` file in the project root with the following variables:
```env
EXPO_PUBLIC_API_URL=https://react-native-challenge-api.tailor-hub.com/api
EXPO_PUBLIC_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```
*Note: A Google Maps API key is required for the location search functionality in the Create Restaurant screen.*

### 3. Deployed Preview Links
**Note**: For the most accurate design review, please run the project locally and scan the QR code, as deployed links may not reflect the very latest changes.

**Android**: [Preview Link](https://expo.dev/preview/update?message=fix+design+issues+deployment+20&updateRuntimeVersion=1.0.0&createdAt=2026-02-23T21%3A23%3A33.404Z&slug=exp&projectId=a3e15141-51d1-4ea1-bdaf-5f5fbaffc8e0&group=533356cb-2002-4f26-8fe1-817f91b864b6)

**iOS**: [Preview Link](https://expo.dev/preview/update?message=fix+design+issues+deployment+20&updateRuntimeVersion=1.0.0&createdAt=2026-02-23T19%3A54%3A14.940Z&slug=exp&projectId=a3e15141-51d1-4ea1-bdaf-5f5fbaffc8e0&group=d656046d-9d82-4f74-b404-f053b1cce8ba)

### 4. Run Development Server
```bash
npx expo start
```

### 5. Test on Device
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

### Status Bar Visibility
If status bar icons don't appear (common on some Android emulators):
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

### API Verification
To ensure full app functionality :
1. Verify API endpoints are reachable from your network environment.
2. Check that the provided `.env` variables match the backend configuration.
3. Ensure authentication headers are active in your test session.
4. Use tools like Postman to verify individual endpoint responses if needed.

## Version Information
- React Native: 0.74.x (via Expo SDK 50+)
- Expo SDK: 50.x
- React: 18.x
- TypeScript: 5.x