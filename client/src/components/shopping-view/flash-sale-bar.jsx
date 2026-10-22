import {useState} from "react";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {ArrowRight, Flame, X} from "lucide-react";
import Countdown from "@/components/common/countdown.jsx";
import {useT} from "@/i18n/index.jsx";

// Admin sozlamalaridagi flash-sale: sayt tepasida taymer bilan lenta
function FlashSaleBar() {
  const {t} = useT();
  const navigate = useNavigate();
  const flashSale = useSelector((state) => state.growth.settings.flashSale);
  const [hidden, setHidden] = useState(false);

  if (!flashSale || hidden) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-rose-deep via-rose to-rose-deep text-white">
      <div className="pointer-events-none absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.18)_50%,transparent_75%)] bg-[length:200%_100%]"/>
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-10 py-2.5 text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <Flame className="h-4 w-4 animate-pulse"/>
          {flashSale.title}
        </span>
        {flashSale.subtitle ? <span className="hidden text-white/85 md:inline">{flashSale.subtitle}</span> : null}
        <span className="flex items-center gap-2 text-xs">
          <span className="uppercase tracking-widest text-white/80">{t("flash.endsIn")}</span>
          <Countdown endsAt={flashSale.endsAt} className="rounded-full bg-white/20 px-3 py-1 font-semibold" onEnd={() => setHidden(true)}/>
        </span>
        <button
          onClick={() => {
            sessionStorage.removeItem("filters");
            navigate("/shop/listing");
          }}
          className="group flex items-center gap-1 text-xs font-semibold underline-offset-4 hover:underline"
        >
          {t("flash.shop")}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"/>
        </button>
      </div>
      <button
        onClick={() => setHidden(true)}
        aria-label={t("common.close")}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/80 hover:bg-white/15 hover:text-white"
      >
        <X className="h-4 w-4"/>
      </button>
    </div>
  );
}

export default FlashSaleBar;
