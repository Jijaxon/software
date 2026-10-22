import {useEffect, useState} from "react";
import {useT} from "@/i18n/index.jsx";

function getRemaining(endsAt) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  return {
    total: diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const pad = (n) => String(n).padStart(2, "0");

// Aksiya tugashigacha qolgan vaqt. variant: "inline" (kichik matn) | "boxes" (kataklar)
function Countdown({endsAt, variant = "inline", className = "", onEnd}) {
  const {t} = useT();
  const [left, setLeft] = useState(() => getRemaining(endsAt));

  useEffect(() => {
    setLeft(getRemaining(endsAt));
    const timer = setInterval(() => {
      const next = getRemaining(endsAt);
      setLeft(next);
      if (next.total <= 0) {
        clearInterval(timer);
        onEnd?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (!endsAt || left.total <= 0) return null;

  const parts = [
    left.days > 0 ? [left.days, t("countdown.d")] : null,
    [left.hours, t("countdown.h")],
    [left.minutes, t("countdown.m")],
    [left.seconds, t("countdown.s")],
  ].filter(Boolean);

  if (variant === "boxes") {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {parts.map(([value, unit], index) => (
          <span key={index} className="flex min-w-11 flex-col items-center rounded-xl bg-white/15 px-2 py-1.5 backdrop-blur">
            <span className="font-display text-xl font-semibold leading-none tabular-nums">{pad(value)}</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-widest opacity-80">{unit}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <span className={`tabular-nums ${className}`}>
      {parts.map(([value, unit]) => `${pad(value)}${unit}`).join(" ")}
    </span>
  );
}

export default Countdown;
