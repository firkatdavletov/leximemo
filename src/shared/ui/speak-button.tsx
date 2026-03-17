"use client";

import { useEffect, useMemo, useState } from "react";

import { buttonClassName } from "@/shared/ui/button";

type SpeakButtonProps = {
  text: string;
  lang?: string;
  className?: string;
};

function normalizeLang(input?: string): string {
  if (!input) {
    return "";
  }

  return input.trim().replace(/_/g, "-");
}

function pickVoiceByLang(
  voices: SpeechSynthesisVoice[],
  targetLang: string,
): SpeechSynthesisVoice | null {
  if (voices.length === 0 || !targetLang) {
    return null;
  }

  const normalizedTarget = normalizeLang(targetLang).toLowerCase();
  const primarySubtag = normalizedTarget.split("-")[0] ?? normalizedTarget;

  return (
    voices.find((voice) => normalizeLang(voice.lang).toLowerCase() === normalizedTarget) ??
    voices.find((voice) => normalizeLang(voice.lang).toLowerCase().startsWith(`${primarySubtag}-`)) ??
    voices.find((voice) => normalizeLang(voice.lang).toLowerCase() === primarySubtag) ??
    null
  );
}

export function SpeakButton({
  text,
  lang,
  className,
}: SpeakButtonProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const resolvedLang = useMemo(() => normalizeLang(lang) || "en-US", [lang]);
  const hasText = text.trim().length > 0;
  const isSupported =
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof SpeechSynthesisUtterance !== "undefined";

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const synthesis = window.speechSynthesis;
    const syncVoices = () => {
      setVoices(synthesis.getVoices());
    };

    syncVoices();
    synthesis.addEventListener("voiceschanged", syncVoices);

    return () => {
      synthesis.removeEventListener("voiceschanged", syncVoices);
      synthesis.cancel();
      setIsSpeaking(false);
    };
  }, [isSupported]);

  function handleSpeak() {
    if (typeof window === "undefined" || !isSupported || !hasText) {
      return;
    }

    const synthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text.trim());
    const voice = pickVoiceByLang(voices, resolvedLang);

    utterance.lang = voice?.lang ?? resolvedLang;

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesis.cancel();
    synthesis.speak(utterance);
  }

  const isDisabled = !isSupported || !hasText;

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={isDisabled}
      className={buttonClassName({ variant: "secondary", size: "sm", className })}
      title={isSupported ? "Озвучить слово" : "Озвучка не поддерживается в этом браузере"}
    >
      {isSpeaking ? "Озвучивается..." : "Озвучить"}
    </button>
  );
}
