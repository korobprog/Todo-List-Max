import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

if ("serviceWorker" in navigator) {
  registerSW({
    onNeedRefresh() {
      console.log("Новая версия доступна. Обновите страницу.");
    },
    onOfflineReady() {
      console.log("Приложение готово к офлайн работе");
    },
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        console.log("Service Worker зарегистрирован:", swUrl);
      }
    },
  });
}

createRoot(document.getElementById("root")!).render(<App />);
