"use client";

import { useEffect, useState } from "react";

import { buttonClassName } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const STORAGE_KEY = "leximemo-pwa-dismissed";

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return true;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(true);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setIsStandalone(isStandaloneMode());
    setIsDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsStandalone(isStandaloneMode());
    };

    const handleAppInstalled = () => {
      window.localStorage.removeItem(STORAGE_KEY);
      setDeferredPrompt(null);
      setIsDismissed(true);
      setIsStandalone(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt || isInstalling) {
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;

      if (result.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } finally {
      setIsInstalling(false);
    }
  }

  function handleDismiss() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setIsDismissed(true);
  }

  if (!deferredPrompt || isStandalone || isDismissed) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50">
      <Container className="pointer-events-auto">
        <div className="ml-auto max-w-md rounded-2xl border border-border bg-surface/95 p-4 shadow-lg backdrop-blur">
          <p className="text-sm font-semibold text-foreground">
            Установить приложение
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            LexiMemo можно открыть с домашнего экрана в отдельном окне без
            лишних вкладок браузера.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleInstall()}
              disabled={isInstalling}
              className={buttonClassName({ size: "sm" })}
            >
              {isInstalling ? "Подготавливаем..." : "Установить"}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className={buttonClassName({ variant: "secondary", size: "sm" })}
            >
              Позже
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
