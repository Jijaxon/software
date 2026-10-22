import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import {Copy, Gem, Gift, Loader2, Send, ShoppingBag, Users} from "lucide-react";
import {fetchReferral} from "@/store/shop/growth-slice/index.js";
import {formatPrice} from "@/lib/utils";
import {useT} from "@/i18n/index.jsx";

function StatTile({icon: Icon, label, value}) {
  return (
    <div className="rounded-2xl border border-sand bg-white p-4">
      <Icon className="h-5 w-5 text-rose-deep"/>
      <p className="mt-3 font-display text-2xl font-semibold text-espresso">{value}</p>
      <p className="text-xs text-taupe">{label}</p>
    </div>
  );
}

function Referral() {
  const dispatch = useDispatch();
  const {t} = useT();
  const {referral, referralLoading} = useSelector((state) => state.growth);

  useEffect(() => {
    dispatch(fetchReferral());
  }, [dispatch]);

  if (referralLoading && !referral) {
    return (
      <div className="flex justify-center py-16 text-rose">
        <Loader2 className="h-6 w-6 animate-spin"/>
      </div>
    );
  }
  if (!referral) return null;

  const bonusText = formatPrice(referral.bonus);
  const shareText = t("referral.shareText", {amount: bonusText});

  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t("common.copied"));
    } catch {
      window.prompt(t("common.copy"), value);
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-espresso via-mocha to-rose-deep p-7 text-ivory md:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 animate-float rounded-full bg-petal/30 blur-3xl"/>
        <Gift className="h-10 w-10 text-petal" strokeWidth={1.4}/>
        <h2 className="mt-4 font-display text-4xl font-medium">{t("referral.title")}</h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-ivory/80">{t("referral.subtitle", {amount: bonusText})}</p>

        <div className="mt-7 grid gap-4 md:grid-cols-[auto_1fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-blush/80">{t("referral.yourCode")}</p>
            <button
              onClick={() => copy(referral.code)}
              className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-petal/60 bg-white/10 px-5 py-3 font-display text-3xl font-semibold tracking-[0.25em] backdrop-blur transition-colors hover:bg-white/20"
            >
              {referral.code}
              <Copy className="h-4 w-4 opacity-70"/>
            </button>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-blush/80">{t("referral.link")}</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => copy(referral.link)}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-left text-sm backdrop-blur hover:bg-white/20"
              >
                <span className="truncate">{referral.link}</span>
                <Copy className="h-4 w-4 shrink-0 opacity-70"/>
              </button>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referral.link)}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-ivory px-5 py-3 text-sm font-semibold text-espresso transition-transform hover:-translate-y-0.5"
              >
                <Send className="h-4 w-4 text-[#2481cc]"/>
                {t("referral.shareTelegram")}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon={Gem} label={t("referral.balance")} value={formatPrice(referral.balance)}/>
        <StatTile icon={Users} label={t("referral.invited")} value={referral.invited}/>
        <StatTile icon={ShoppingBag} label={t("referral.rewarded")} value={referral.rewarded}/>
        <StatTile icon={Gift} label={t("referral.earned")} value={formatPrice(referral.earned)}/>
      </div>

      <ol className="grid gap-3 md:grid-cols-3">
        {[t("referral.how1"), t("referral.how2"), t("referral.how3")].map((step, index) => (
          <li key={index} className="flex items-start gap-3 rounded-2xl bg-cream p-4 text-sm text-mocha">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-espresso text-xs font-semibold text-ivory">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Referral;
