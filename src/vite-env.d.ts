/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/// <reference types="vite/client" />

declare global {
  interface Window {
    __ENV__?: Record<string, string | undefined>;
  }

  // Типы для PWA install prompt (лучшая практика)
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
  }
}

// Расширяем WindowEventMap для beforeinstallprompt
interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
  appinstalled: Event;
}

export {};
