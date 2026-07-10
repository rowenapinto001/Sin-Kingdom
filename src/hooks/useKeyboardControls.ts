import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';
import { Direction } from '../game/types';

type NativeKeyPressEvent = {
  nativeEvent: {
    key: string;
  };
};

type AndroidHardwareKeyEvent = {
  type?: 'keydown' | 'keyup';
  key?: string;
  repeatCount?: number;
};

type UseKeyboardControlsOptions = {
  enabled?: boolean;
  disabled?: boolean;
  fallbackReleaseMs?: number;
  initialDirection?: Direction;
};

type KeyboardEventLike = {
  key?: string;
  target?: unknown;
  preventDefault?: () => void;
};

type BrowserWindowLike = {
  addEventListener?: (type: string, listener: (event: KeyboardEventLike) => void) => void;
  removeEventListener?: (type: string, listener: (event: KeyboardEventLike) => void) => void;
};

type BrowserDocumentLike = {
  visibilityState?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

type EditableTarget = {
  tagName?: string;
  isContentEditable?: boolean;
  parentElement?: EditableTarget | null;
  getAttribute?: (name: string) => string | null;
};

export type KeyboardControls = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  isMoving: boolean;
  direction: Direction;
  activeDirections: Direction[];
  onNativeKeyPress: (event: NativeKeyPressEvent) => void;
  resetKeyboardControls: () => void;
};

const DIRECTION_ORDER: Direction[] = ['up', 'down', 'left', 'right'];
const ANDROID_HARDWARE_KEY_EVENT = 'SinKingdomHardwareKey';

function normalizeKeyId(key: string) {
  return key.trim().toLowerCase();
}

function directionFromKeyId(keyId: string): Direction | undefined {
  if (keyId.startsWith('native:')) {
    const direction = keyId.slice('native:'.length);
    return DIRECTION_ORDER.includes(direction as Direction) ? (direction as Direction) : undefined;
  }

  switch (keyId) {
    case 'arrowup':
    case 'up':
    case 'w':
      return 'up';
    case 'arrowdown':
    case 'down':
    case 's':
      return 'down';
    case 'arrowleft':
    case 'left':
    case 'a':
      return 'left';
    case 'arrowright':
    case 'right':
    case 'd':
      return 'right';
    default:
      return undefined;
  }
}

function directionIsPressed(pressedKeyIds: Set<string>, direction: Direction) {
  for (const keyId of pressedKeyIds) {
    if (directionFromKeyId(keyId) === direction) return true;
  }
  return false;
}

function sameDirections(a: Direction[], b: Direction[]) {
  return a.length === b.length && a.every((direction, index) => direction === b[index]);
}

function isEditableTarget(target: unknown) {
  let node = target as EditableTarget | null | undefined;
  for (let depth = 0; node && depth < 4; depth += 1) {
    const tagName = typeof node.tagName === 'string' ? node.tagName.toLowerCase() : '';
    const role = typeof node.getAttribute === 'function' ? node.getAttribute('role') : null;

    if (
      node.isContentEditable ||
      role === 'textbox' ||
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select'
    ) {
      return true;
    }

    node = node.parentElement;
  }
  return false;
}

export function mergeDirectionInputs(...directionGroups: Direction[][]) {
  const merged: Direction[] = [];
  directionGroups.forEach((directions) => {
    directions.forEach((direction) => {
      if (!merged.includes(direction)) merged.push(direction);
    });
  });
  return merged;
}

export function useKeyboardControls({
  enabled = true,
  disabled = false,
  fallbackReleaseMs = 175,
  initialDirection = 'down',
}: UseKeyboardControlsOptions = {}): KeyboardControls {
  const controlsEnabled = enabled && !disabled;
  const [activeDirections, setActiveDirections] = useState<Direction[]>([]);
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const pressedKeyIdsRef = useRef<Set<string>>(new Set());
  const lastDirectionRef = useRef<Direction>(initialDirection);
  const nativeReleaseTimersRef = useRef<Partial<Record<Direction, ReturnType<typeof setTimeout>>>>({});

  const clearNativeReleaseTimers = useCallback(() => {
    Object.values(nativeReleaseTimersRef.current).forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
    nativeReleaseTimersRef.current = {};
  }, []);

  const syncActiveDirections = useCallback(() => {
    const nextDirections = DIRECTION_ORDER.filter((item) => directionIsPressed(pressedKeyIdsRef.current, item));

    setActiveDirections((current) => (sameDirections(current, nextDirections) ? current : nextDirections));

    if (nextDirections.length > 0 && !nextDirections.includes(lastDirectionRef.current)) {
      const nextDirection = nextDirections[nextDirections.length - 1];
      lastDirectionRef.current = nextDirection;
      setDirection(nextDirection);
    }
  }, []);

  const setKeyPressed = useCallback((keyId: string, pressed: boolean) => {
    const nextDirection = directionFromKeyId(keyId);
    if (!nextDirection) return;

    const pressedKeyIds = pressedKeyIdsRef.current;
    const changed = pressed ? !pressedKeyIds.has(keyId) : pressedKeyIds.has(keyId);
    if (!changed) return;

    if (pressed) {
      pressedKeyIds.add(keyId);
      lastDirectionRef.current = nextDirection;
      setDirection(nextDirection);
    } else {
      pressedKeyIds.delete(keyId);
    }

    syncActiveDirections();
  }, [syncActiveDirections]);

  const resetKeyboardControls = useCallback(() => {
    pressedKeyIdsRef.current.clear();
    clearNativeReleaseTimers();
    setActiveDirections((current) => (current.length === 0 ? current : []));
  }, [clearNativeReleaseTimers]);

  const releaseNativeDirection = useCallback((nextDirection: Direction) => {
    const existingTimer = nativeReleaseTimersRef.current[nextDirection];
    if (existingTimer) {
      clearTimeout(existingTimer);
      delete nativeReleaseTimersRef.current[nextDirection];
    }
    setKeyPressed(`native:${nextDirection}`, false);
  }, [setKeyPressed]);

  const holdNativeDirection = useCallback((nextDirection: Direction, releaseMs: number) => {
    const nativeKeyId = `native:${nextDirection}`;
    setKeyPressed(nativeKeyId, true);

    const existingTimer = nativeReleaseTimersRef.current[nextDirection];
    if (existingTimer) clearTimeout(existingTimer);
    nativeReleaseTimersRef.current[nextDirection] = setTimeout(() => {
      setKeyPressed(nativeKeyId, false);
      delete nativeReleaseTimersRef.current[nextDirection];
    }, releaseMs);
  }, [setKeyPressed]);

  useEffect(() => {
    if (!controlsEnabled) resetKeyboardControls();
  }, [controlsEnabled, resetKeyboardControls]);

  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;

    const browserWindow = globalThis as unknown as BrowserWindowLike;
    const browserDocument = (globalThis as unknown as { document?: BrowserDocumentLike }).document;
    if (!browserWindow.addEventListener || !browserWindow.removeEventListener) return undefined;

    const handleKeyDown = (event: KeyboardEventLike) => {
      const keyId = normalizeKeyId(event.key ?? '');
      if (!directionFromKeyId(keyId) || !controlsEnabled || isEditableTarget(event.target)) return;

      event.preventDefault?.();
      setKeyPressed(keyId, true);
    };

    const handleKeyUp = (event: KeyboardEventLike) => {
      const keyId = normalizeKeyId(event.key ?? '');
      if (!directionFromKeyId(keyId)) return;

      event.preventDefault?.();
      setKeyPressed(keyId, false);
    };

    const handleBlur = () => {
      resetKeyboardControls();
    };

    const handleVisibilityChange = () => {
      if (browserDocument?.visibilityState === 'hidden') resetKeyboardControls();
    };

    browserWindow.addEventListener('keydown', handleKeyDown);
    browserWindow.addEventListener('keyup', handleKeyUp);
    browserWindow.addEventListener('blur', handleBlur);
    browserDocument?.addEventListener?.('visibilitychange', handleVisibilityChange);

    return () => {
      browserWindow.removeEventListener?.('keydown', handleKeyDown);
      browserWindow.removeEventListener?.('keyup', handleKeyUp);
      browserWindow.removeEventListener?.('blur', handleBlur);
      browserDocument?.removeEventListener?.('visibilitychange', handleVisibilityChange);
    };
  }, [controlsEnabled, resetKeyboardControls, setKeyPressed]);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = DeviceEventEmitter.addListener(ANDROID_HARDWARE_KEY_EVENT, (event: AndroidHardwareKeyEvent) => {
      if (!controlsEnabled) return;

      const keyId = normalizeKeyId(event.key ?? '');
      const nextDirection = directionFromKeyId(keyId);
      if (!nextDirection) return;

      if (event.type === 'keydown') {
        holdNativeDirection(nextDirection, 900);
      } else if (event.type === 'keyup') {
        releaseNativeDirection(nextDirection);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [controlsEnabled, holdNativeDirection, releaseNativeDirection]);

  useEffect(() => () => {
    pressedKeyIdsRef.current.clear();
    clearNativeReleaseTimers();
  }, [clearNativeReleaseTimers]);

  const onNativeKeyPress = useCallback((event: NativeKeyPressEvent) => {
    if (Platform.OS === 'web' || !controlsEnabled) return;

    const keyId = normalizeKeyId(event.nativeEvent.key);
    const nextDirection = directionFromKeyId(keyId);
    if (!nextDirection) return;

    // Android hardware keys use the Activity event bridge above. This focused
    // TextInput fallback remains for native platforms that only surface key
    // presses through focused text inputs.
    holdNativeDirection(nextDirection, fallbackReleaseMs);
  }, [controlsEnabled, fallbackReleaseMs, holdNativeDirection]);

  const up = activeDirections.includes('up');
  const down = activeDirections.includes('down');
  const left = activeDirections.includes('left');
  const right = activeDirections.includes('right');

  return useMemo(() => ({
    up,
    down,
    left,
    right,
    isMoving: activeDirections.length > 0,
    direction,
    activeDirections,
    onNativeKeyPress,
    resetKeyboardControls,
  }), [activeDirections, direction, down, left, onNativeKeyPress, resetKeyboardControls, right, up]);
}
