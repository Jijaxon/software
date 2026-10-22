import {Link2, Send, Share2} from "lucide-react";
import {toast} from "react-toastify";
import instance from "@/utils/axios.js";
import {useT} from "@/i18n/index.jsx";

// Ulashish havolasi backend'dagi OG-sahifaga olib boradi — Telegram/Instagram chiroyli preview ko'rsatadi
export function productShareUrl(productId) {
  const api = new URL(instance.defaults.baseURL, window.location.origin);
  return `${api.origin}${api.pathname.replace(/\/$/, "")}/seo/product/${productId}`;
}

function ShareButtons({product}) {
  const {t} = useT();
  if (!product?._id) return null;

  const url = productShareUrl(product._id);
  const text = `${t("product.shareText")} ${product.title}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("common.copied"));
    } catch {
      window.prompt(t("product.copyLink"), url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({title: product.title, text, url});
    } catch {
      // foydalanuvchi bekor qildi
    }
  }

  const buttonClass =
    "flex h-10 items-center gap-2 rounded-full border border-sand bg-white px-4 text-xs font-semibold text-mocha transition-all duration-300 hover:-translate-y-0.5 hover:border-petal hover:bg-blush/50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-taupe">{t("product.share")}</span>
      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <Send className="h-3.5 w-3.5 text-[#2481cc]"/> {t("product.shareTelegram")}
      </a>
      <button onClick={copyLink} className={buttonClass}>
        <Link2 className="h-3.5 w-3.5"/> {t("product.copyLink")}
      </button>
      {typeof navigator !== "undefined" && navigator.share ? (
        <button onClick={nativeShare} className={buttonClass} aria-label={t("product.share")}>
          <Share2 className="h-3.5 w-3.5"/>
        </button>
      ) : null}
    </div>
  );
}

export default ShareButtons;
