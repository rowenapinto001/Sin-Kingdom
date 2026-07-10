package com.rowena001.sinkingdom

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.lang.ref.WeakReference

class HardwareKeyboardModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  init {
    reactContextRef = WeakReference(reactContext)
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun addListener(eventName: String) {
    // Required by React Native event emitter bookkeeping.
  }

  @ReactMethod
  fun removeListeners(count: Double) {
    // Required by React Native event emitter bookkeeping.
  }

  companion object {
    const val NAME = "SinKingdomHardwareKeyboard"
    const val EVENT_NAME = "SinKingdomHardwareKey"
    private var reactContextRef: WeakReference<ReactApplicationContext>? = null

    fun emitKeyEvent(type: String, key: String, repeatCount: Int) {
      val reactContext = reactContextRef?.get()
      if (reactContext?.hasActiveReactInstance() != true) return

      val payload = Arguments.createMap().apply {
        putString("type", type)
        putString("key", key)
        putInt("repeatCount", repeatCount)
      }

      reactContext.emitDeviceEvent(EVENT_NAME, payload)
    }
  }
}
