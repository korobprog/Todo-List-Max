/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/// <reference types="vite/client" />

declare global {
  interface Window {
    __ENV__?: Record<string, string | undefined>;
  }
}

export {};
