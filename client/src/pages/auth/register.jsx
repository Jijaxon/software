import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Gift, Loader2, Send} from "lucide-react";
import {useDispatch} from "react-redux";
import {registerUser} from "@/store/auth-slice/index.js";
import {toast} from "react-toastify";
import {Button} from "@/components/ui/button.jsx";
import PhoneInput from "@/components/auth/phone-input.jsx";
import TelegramBotLink from "@/components/auth/telegram-bot-link.jsx";
import {useT} from "@/i18n/index.jsx";

const REF_KEY = "nafis-ref";

function AuthRegister() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {t} = useT();
  const [searchParams] = useSearchParams();
  // Taklif kodi: havoladagi ?ref= yoki avval saqlangani (foydalanuvchi sahifalarni almashtirgan bo'lsa ham)
  const [refCode, setRefCode] = useState(() => localStorage.getItem(REF_KEY) || "");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem(REF_KEY, ref.toUpperCase());
      setRefCode(ref.toUpperCase());
    }
  }, [searchParams]);

  const isValid = phone.length === 9 && password.length >= 6;

  function onSubmit(event) {
    event.preventDefault();
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    dispatch(registerUser({phone: `998${phone}`, password, ref: refCode || undefined})).then((data) => {
      setIsSubmitting(false);
      if (data?.payload?.success) {
        localStorage.removeItem(REF_KEY);
        toast.success(data?.payload?.message);
        navigate(`/auth/verify?token=${data.payload.token}`, {
          state: {telegramLink: data.payload.telegramLink},
        });
      } else if (!data?.payload?.error) {
        toast.error(data?.payload?.message || "Ro'yxatdan o'tib bo'lmadi. Qayta urinib ko'ring");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">NAFIS'ga qo'shiling</p>
        <h1 className="mt-3 font-display text-5xl font-medium leading-tight text-espresso">
          Yangi hisob yarating
        </h1>
        <p className="mt-3 text-sm text-taupe">
          Hisobingiz bormi?
          <Link className="nav-link ml-2 font-semibold text-rose-deep" to="/auth/login">
            Kirish
          </Link>
        </p>
      </div>

      {refCode ? (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-blush/60 p-4 text-xs leading-5 text-rose-deep">
          <Gift className="mt-0.5 h-4 w-4 shrink-0"/>
          <p>{t("referral.invitedBanner")}</p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="animate-fade-up">
        <label htmlFor="phone" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">
          Telefon raqam
        </label>
        <PhoneInput value={phone} onChange={setPhone} autoFocus disabled={isSubmitting}/>

        <label htmlFor="password" className="mb-2 mt-5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">
          Parol
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          disabled={isSubmitting}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Kamida 6 ta belgi"
          className="h-12 w-full rounded-2xl border border-sand bg-white px-4 text-sm text-espresso outline-none transition-all duration-300 placeholder:text-taupe/70 focus:border-petal focus:ring-4 focus:ring-blush disabled:opacity-60"
        />

        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="mt-6 h-12 w-full rounded-full bg-espresso text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-mocha disabled:translate-y-0 disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="animate-spin"/> : null}
          {isSubmitting ? "Yuborilmoqda..." : "Davom etish"}
        </Button>
      </form>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#e5f1fb]/70 p-4 text-xs leading-5 text-[#2b5f8a]">
        <Send className="mt-0.5 h-4 w-4 shrink-0 text-[#2481cc]"/>
        <p>
          Keyingi qadamda hisobingizni <b>Telegram bot</b> orqali tasdiqlaysiz: botga kirgan telefon raqamingizni
          yuborasiz va tasdiqlash kodini olasiz.
        </p>
      </div>
      <TelegramBotLink className="mt-4"/>
    </div>
  );
}

export default AuthRegister;
