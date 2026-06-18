# Android Studio / USB Testing

This project has a native Android project at `android/`, generated from Expo prebuild.

## Open in Android Studio

```bash
npm run android:studio
```

If Android Studio asks to sync Gradle, allow it. This project is pinned to Gradle `8.14.3` for Expo/React Native Android plugin compatibility.

## Android SDK Setup

The SDK is configured on this machine at:

```text
/home/rowena001/Android/Sdk
```

The local Gradle pointer is:

```text
android/local.properties
```

If Android Studio asks for more packages, install them from `More Actions > SDK Manager`.

## USB Device Testing

On your Android phone:

1. Enable Developer Options.
2. Enable USB debugging.
3. Connect USB cable.
4. Accept the RSA debugging popup on the phone.

Then run:

```bash
npm run android:usb
```

That command uses Android Studio's bundled JDK if no system Java is installed, checks `adb devices`, then runs:

```bash
npx expo run:android --device
```

## If Metro LAN Does Not Connect

USB install is better than Expo Go LAN discovery. Once `adb` works, Expo/React Native can use the USB-connected device instead of relying on Wi-Fi discovery.

If the installed debug app opens but cannot load JavaScript, run:

```bash
export ANDROID_HOME=/home/rowena001/Android/Sdk
export PATH=$ANDROID_HOME/platform-tools:$PATH
adb reverse tcp:8081 tcp:8081
npm start
```

Then reload the app on the phone.

## Built Debug APK

The verified debug APK is:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Standalone Phone Install

For testing without Metro or Expo Go, build and install the release-style APK:

```bash
npm run android:release
npm run android:install-release
```

The release APK includes the JavaScript bundle, so it should not show `Unable to load script`.

Current release APK:

```text
android/app/build/outputs/apk/release/app-release.apk
```
