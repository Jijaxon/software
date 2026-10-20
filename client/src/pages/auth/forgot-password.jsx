import {Link, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {ArrowLeft, KeyRound, Loader2, Send, ShieldCheck} from "lucide-react";
import {toast} from "react-toastify";
import {useDispatch} from "react-redux";
import {Button} from "@/components/ui/button.jsx";
import PhoneInput from "@/components/auth/phone-input.jsx";
import OtpInput from "@/components/auth/otp-input.jsx";
import {
  getTelegramInfo,
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetCode,
} from "@/store/auth-slice/index.js";
import {formatPhone} from "@/lib/utils";
import {useCountdown} from "@/lib/use-countdown.js";

function AuthForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState("phone"); // phone -> code -> password
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [botLink, setBotLink] = useState(null);
  const [cooldown, setCooldown] = useCountdown();

  const fullPhone = `998${phone}`;

  useEffect(() => {
    dispatch(getTelegramInfo()).then(({payload}) => setBotLink(payload?.botLink || null));
  }, [dispatch]);

  function handleRequest(event) {
    event?.preventDefault();
    if (phone.length !== 9 || isSubmitting) return;
    setIsSubmitting(true);
    dispatch(requestPasswordReset({phone: fullPhone})).then(({payload}) => {
      setIsSubmitting(false);
      if (payload?.cooldown) setCooldown(payload.cooldown);
      if (payload?.success) {
        toast.success(payload.message);
        setStep("code");
      } else if (payload?.cooldown) {
        setStep("code");
        toast.warning(payload.message);
      } else if (!payload?.error) {
        toast.error(payload?.message || "Kodni yuborib bo'lmadi");
      }
    });
  }

  function handleVerify(value = code) {
    if (value.length !== 6 || isSubmitting) return;
    setIsSubmitting(true);
    dispatch(verifyPasswordResetCode({phone: fullPhone, code: value})).then(({payload}) => {
      setIsSubmitting(false);
      if (payload?.success && payload?.resetToken) {
        setResetToken(payload.resetToken);
        setStep("password");
      } else {
        setCode("");
        toast.error(payload?.message || "Kod noto'g'ri");
      }
    });
  }

  function handleReset(event) {
    event?.preventDefault();
    if (password.length < 6 || password !== confirm || isSubmitting) return;
    setIsSubmitting(true);
    dispatch(resetPassword({resetToken, password})).then(({payload}) => {
      setIsSubmitting(false);
      if (payload?.success) {
        toast.success(payload.message || "Parol yangilandi");
        navigate("/shop/home");
      } else {
        toast.error(payload?.message || "Parolni yangilab bo'lmadi");
        if (!payload?.success && payload?.message?.includes("muddat")) setStep("phone");
      }
    });
  }

  const botHint = botLink ? (
    <a href={botLink} target="_blank" rel="noopener noreferrer" className="nav-link font-semibold text-[#2481cc]">
      Botni ochish
    </a>
  ) : null;

  // 3-qadam — yangi parol
  if (step === "password") {
    const passwordsMatch = password.length >= 6 && password === confirm;
    return (
      <div className="mx-auto w-full max-w-md animate-fade-up">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">Oxirgi qadam</p>
          <h1 className="mt-3 font-display text-5xl font-medium leading-tight text-espresso">Yangi parol</h1>
          <p className="mt-3 text-sm text-taupe">
            <b className="font-semibold text-espresso">{formatPhone(fullPhone)}</b> uchun yangi parol o'rnating.
          </p>
        </div>
        <form onSubmit={handleReset}>
          <label htmlFor="password" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">
            Yangi parol
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            autoFocus
            disabled={isSubmitting}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kamida 6 ta belgi"
            className="h-12 w-full rounded-2xl border border-sand bg-white px-4 text-sm text-espresso outline-none transition-all duration-300 placeholder:text-taupe/70 focus:border-petal focus:ring-4 focus:ring-blush disabled:opacity-60"
          />
          <label htmlFor="confirm" className="mb-2 mt-5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">
            Parolni takrorlang
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            disabled={isSubmitting}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Yangi parolni qayta kiriting"
            className="h-12 w-full rounded-2xl border border-sand bg-white px-4 text-sm text-espresso outline-none transition-all duration-300 placeholder:text-taupe/70 focus:border-petal focus:ring-4 focus:ring-blush disabled:opacity-60"
          />
          {confirm && password !== confirm ? (
            <p className="mt-2 text-xs font-medium text-rose-deep">Parollar mos kelmadi</p>
          ) : null}
          <Button
            type="submit"
            disabled={!passwordsMatch || isSubmitting}
            className="mt-6 h-12 w-full rounded-full bg-espresso text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-mocha disabled:translate-y-0 disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="animate-spin"/> : <ShieldCheck/>}
            Parolni yangilash
          </Button>
        </form>
      </div>
    );
  }

  // 2-qadam — kod
  if (step === "code") {
    return (
      <div className="mx-auto w-full max-w-md animate-fade-up">
        <button
          onClick={() => {
            setStep("phone");
            setCode("");
          }}
          className="group mb-5 flex items-center gap-1.5 text-xs font-semibold text-mocha hover:text-espresso"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"/> Raqamni o'zgartirish
        </button>
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">Parolni tiklash</p>
          <h1 className="mt-3 font-display text-5xl font-medium leading-tight text-espresso">Kodni kiriting</h1>
        </div>
        <p className="mb-5 text-sm leading-6 text-taupe">
          <b className="font-semibold text-espresso">{formatPhone(fullPhone)}</b> raqamiga ulangan Telegram'ga tiklash
          kodi yuborildi. Agar kelmagan bo'lsa, botda <b className="font-semibold text-espresso">/forgot</b> buyrug'ini
          yuboring. {botHint}
        </p>
        <OtpInput value={code} onChange={setCode} autoFocus disabled={isSubmitting} onComplete={handleVerify}/>
        <Button
          onClick={() => handleVerify()}
          disabled={code.length !== 6 || isSubmitting}
          className="mt-5 h-12 w-full rounded-full bg-espresso text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-mocha disabled:translate-y-0"
        >
          {isSubmitting ? <Loader2 className="animate-spin"/> : null}
          Davom etish
        </Button>
        <button
          onClick={handleRequest}
          disabled={cooldown > 0 || isSubmitting}
          className="mt-4 w-full text-center text-xs font-semibold text-mocha transition-colors hover:text-rose-deep disabled:cursor-not-allowed disabled:font-normal disabled:text-taupe"
        >
          {cooldown > 0 ? `Yangi kodni ${cooldown} soniyadan so'ng olishingiz mumkin` : "Kodni qayta yuborish"}
        </button>
      </div>
    );
  }

  // 1-qadam — telefon raqam
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">Parolni unutdingizmi?</p>
        <h1 className="mt-3 font-display text-5xl font-medium leading-tight text-espresso">
          Parolni tiklash
        </h1>
        <p className="mt-3 text-sm text-taupe">
          Hisobingizga ulangan telefon raqamni kiriting — Telegram botga tiklash kodi yuboramiz.
        </p>
      </div>

      <form onSubmit={handleRequest} className="animate-fade-up">
        <label htmlFor="phone" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">
          Telefon raqam
        </label>
        <PhoneInput value={phone} onChange={setPhone} autoFocus disabled={isSubmitting}/>
        <Button
          type="submit"
          disabled={phone.length !== 9 || isSubmitting}
          className="group mt-5 h-12 w-full rounded-full bg-[#2aabee] text-sm font-semibold text-white shadow-lg shadow-[#2aabee]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#229ed9] disabled:translate-y-0 disabled:bg-taupe/50 disabled:shadow-none"
        >
          {isSubmitting ? <Loader2 className="animate-spin"/> : <Send className="transition-transform duration-300 group-hover:-rotate-12"/>}
          Tiklash kodini yuborish
        </Button>
      </form>

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#e5f1fb]/70 p-4 text-xs leading-5 text-[#2b5f8a]">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#2481cc]"/>
        <p>
          Kod hisobingizga ulangan Telegram akkauntga keladi. Botda <b>/forgot</b> buyrug'ini yuborib ham
          kod olishingiz mumkin. {botHint}
        </p>
      </div>

      <button
        onClick={() => setStep("code")}
        className="mt-4 w-full text-center text-xs font-semibold text-mocha transition-colors hover:text-rose-deep"
      >
        Kodim bor — davom etish
      </button>

      <p className="mt-6 text-center text-sm text-taupe">
        <Link className="nav-link font-semibold text-rose-deep" to="/auth/login">
          Kirish sahifasiga qaytish
        </Link>
      </p>
    </div>
  );
}

export default AuthForgotPassword;
