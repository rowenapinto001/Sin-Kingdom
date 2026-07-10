package com.rowena001.sinkingdom

import android.os.Build
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(null)
    enableImmersiveMode()
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) {
      enableImmersiveMode()
    }
  }

  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    val keyName = movementKeyName(event.keyCode) ?: return super.dispatchKeyEvent(event)
    val eventType = when (event.action) {
      KeyEvent.ACTION_DOWN -> "keydown"
      KeyEvent.ACTION_UP -> "keyup"
      else -> return super.dispatchKeyEvent(event)
    }

    HardwareKeyboardModule.emitKeyEvent(eventType, keyName, event.repeatCount)
    return true
  }

  private fun movementKeyName(keyCode: Int): String? {
    return when (keyCode) {
      KeyEvent.KEYCODE_W,
      KeyEvent.KEYCODE_DPAD_UP,
      KeyEvent.KEYCODE_SYSTEM_NAVIGATION_UP -> "arrowup"
      KeyEvent.KEYCODE_S,
      KeyEvent.KEYCODE_DPAD_DOWN,
      KeyEvent.KEYCODE_SYSTEM_NAVIGATION_DOWN -> "arrowdown"
      KeyEvent.KEYCODE_A,
      KeyEvent.KEYCODE_DPAD_LEFT,
      KeyEvent.KEYCODE_SYSTEM_NAVIGATION_LEFT -> "arrowleft"
      KeyEvent.KEYCODE_D,
      KeyEvent.KEYCODE_DPAD_RIGHT,
      KeyEvent.KEYCODE_SYSTEM_NAVIGATION_RIGHT -> "arrowright"
      else -> null
    }
  }

  private fun enableImmersiveMode() {
    window.setFlags(
      WindowManager.LayoutParams.FLAG_FULLSCREEN,
      WindowManager.LayoutParams.FLAG_FULLSCREEN
    )

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      window.setDecorFitsSystemWindows(false)
      window.insetsController?.let { controller ->
        controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
        controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
      }
    } else {
      @Suppress("DEPRECATION")
      window.decorView.systemUiVisibility =
        View.SYSTEM_UI_FLAG_FULLSCREEN or
        View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
        View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
        View.SYSTEM_UI_FLAG_LAYOUT_STABLE
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
