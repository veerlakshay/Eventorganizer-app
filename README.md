# OCCASIO : Event Organizer App

A modern React Native application for managing and organizing events. Built with Expo and Firebase, this app provides a seamless experience for creating, editing, and tracking events.

## Features

- 🔐 User Authentication (Sign In/Sign Up)
- 📅 Event Creation and Management
- ✨ Event Details View
- ⭐ Favorite Events
- 📱 Responsive UI Design
- 🔄 Real-time Updates

## Tech Stack

- React Native
- Expo
- Firebase
- React Navigation
- React Native Gesture Handler

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for development)

## Installation

1. Clone the repository:
```bash
git clone [https://github.com/veerlakshay/Eventorganizer-app]
cd EventOrganizerApp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Run on your preferred platform:
```bash
# For iOS
npm run ios
# or
yarn ios

# For Android
npm run android
# or
yarn android
```

## Project Structure

```
EventOrganizerApp/
├── assets/           # Static assets (images, fonts)
├── screens/          # Application screens
│   ├── SignInScreen.js
│   ├── SignUpScreen.js
│   ├── DashboardScreen.js
│   ├── CreateEventScreen.js
│   ├── EditEventScreen.js
│   ├── FavoriteEventsScreen.js
│   └── EventDetailScreen.js
├── config/           # Configuration files
├── App.js           # Main application component
├── app.json         # Expo configuration
└── package.json     # Project dependencies
```

## Firebase Configuration

1. Create a Firebase project
2. Enable Authentication
3. Set up Firestore Database
4. Add your Firebase configuration to the app

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
