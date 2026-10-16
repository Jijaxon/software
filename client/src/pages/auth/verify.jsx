import {Link, useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Check, Loader2, Send, ShieldCheck, Smartphone, TimerReset} from "lucide-react";
import {useDispatch} from "react-redux";
import {toast} from "react-toastify";
import {Button} from "@/components/ui/button.jsx";
import OtpInput from "@/components/auth/otp-input.jsx";
import TelegramBotLink from "@/components/auth/telegram-bot-link.jsx";
import {getVerificationStatus, resendVerificationCode, verifyUser} from "@/store/auth-slice/index.js";
import {useCountdown} from "@/lib/use-countdown.js";

const STATUS_POLL_MS = 3000;

function Step({index, title, text, isDone, isActive, children}) {
  return (
    <div className={`relative flex gap-4 pb-7 last:pb-0 ${isActive || isDone ? "" : "opacity-50"}`}>
      <div className="flex flex-col items-center">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition-all duration-500 ${
            isDone ? "bg-sage text-white" : isActive ? "bg-espresso text-ivory shadow-lg shadow-mocha/25" : "border border-sand bg-white text-taupe"
          }`}
        >
          {isDone ? <Check className="h-4 w-4 animate-pop"/> : index}
        </span>
        <span className="mt-2 w-px flex-1 bg-sand"/>
      </div>
      <div className="min-w-0 flex-1 pt-1.5">
        <p className="text-sm font-semibold text-espresso">{title}</p>
        {text ? <p className="mt-1 text-xs leading-5 text-taupe">{text}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}

function AuthVerify() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useCountdown();

  const telegramLink = status?.telegramLink || location.state?.telegramLink;
  const isLinked = Boolean(status?.telegramLinked);
  const isPhoneShared = Boolean(status?.phoneShared);

  // Foydalanuvchi botda raqamini yuborgunicha holatni tekshirib turamiz
  useEffect(() => {
    if (!token) {
      setError("Tasdiqlash havolasi topilmadi");
      return undefined;
    }

    let isCancelled = false;
    let timer;

    async function loadStatus() {
      const {payload} = await dispatch(getVerificationStatus(token));
      if (isCancelled) return;

      if (!payload?.success) {
        setError(payload?.message || "Havola eskirgan");
        return;
      }
      setStatus(payload);
      if (payload.phoneShared) {
        setCooldown((value) => value || payload.cooldown);
      } else {
        timer = setTimeout(loadStatus, STATUS_POLL_MS);
      }
    }

    loadStatus();
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [token, dispatch]);

  function handleVerify(value = code) {
    if (value.length !== 6 || isSubmitting) return;
    setIsSubmitting(true);
    dispatch(verifyUser({token, code: value})).then(({payload}) => {
      setIsSubmitting(false);
      if (payload?.success) {
        toast.success(payload.message);
        navigate("/shop/home");
      } else {
        setCode("");
        toast.error(payload?.message || "Kod noto'g'ri");
      }
    });
  }

  function handleResend() {
    dispatch(resendVerificationCode({token})).then(({payload}) => {
      if (payload?.cooldown) setCooldown(payload.cooldown);
      if (payload?.success) {
        toast.success(payload.message);
      } else if (payload?.message) {
        toast.warning(payload.message);
      }
    });
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 animate-float place-items-center rounded-full bg-blush">
          <TimerReset className="h-7 w-7 text-rose-deep" strokeWidth={1.5}/>
        </div>
        <h1 className="mt-6 font-display text-4xl font-medium text-espresso">Havola eskirgan</h1>
        <p className="mt-3 text-sm leading-6 text-taupe">
          Tasdiqlash havolasi eskirgan yoki noto'g'ri. Parolingiz bilan kiring — tasdiqlash shu yerdan davom etadi
          yoki qaytadan ro'yxatdan o'ting.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild className="h-11 rounded-full bg-espresso px-6 text-ivory hover:bg-mocha">
            <Link to="/auth/login">Kirish</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full border-sand px-6 hover:bg-blush">
            <Link to="/auth/register">Ro'yxatdan o'tish</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">Oxirgi qadam</p>
        <h1 className="mt-3 font-display text-5xl font-medium leading-tight text-espresso">
          Telegram orqali tasdiqlang
        </h1>
        {status?.username ? (
          <p className="mt-3 text-sm text-taupe">
            Hisob: <b className="font-semibold text-espresso">{status.username}</b>
          </p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
        <Step
          index={1}
          title="Botni oching va «Start» ni bosing"
          text="Tugma Telegram'dagi NAFIS botini ochadi."
          isActive={!isLinked}
          isDone={isLinked}
        >
          {!isLinked ? (
            telegramLink ? (
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#2aabee] px-5 text-sm font-semibold text-white shadow-lg shadow-[#2aabee]/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#229ed9]"
              >
                <Send className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12"/>
                Telegram'da ochish
              </a>
            ) : status ? (
              <p className="rounded-xl bg-[#f7ead6] px-3 py-2 text-xs text-[#93672c]">
                Telegram bot hali sozlanmagan. Administrator bilan bog'laning.
              </p>
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-taupe"/>
            )
          ) : null}
        </Step>

        <Step
          index={2}
          title="Telefon raqamingizni yuboring"
          text="Botdagi «📱 Telefon raqamni yuborish» tugmasini bosing."
          isActive={isLinked && !isPhoneShared}
          isDone={isPhoneShared}
        >
          {isLinked && !isPhoneShared ? (
            <p className="flex items-center gap-2 text-xs font-medium text-rose-deep">
              <Smartphone className="h-4 w-4 animate-pulse"/> Raqamingiz kutilmoqda...
            </p>
          ) : null}
        </Step>

        <Step
          index={3}
          title="Botdan kelgan kodni kiriting"
          text={isPhoneShared ? "6 xonali kod Telegram'ga yuborildi." : null}
          isActive={isPhoneShared}
          isDone={false}
        >
          {isPhoneShared ? (
            <div className="animate-fade-up">
              <OtpInput
                value={code}
                onChange={setCode}
                autoFocus
                disabled={isSubmitting}
                onComplete={handleVerify}
              />
              <Button
                onClick={() => handleVerify()}
                disabled={code.length !== 6 || isSubmitting}
                className="mt-5 h-12 w-full rounded-full bg-espresso text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-mocha disabled:translate-y-0"
              >
                {isSubmitting ? <Loader2 className="animate-spin"/> : <ShieldCheck/>}
                Tasdiqlash
              </Button>
              <button
                onClick={handleResend}
                disabled={cooldown > 0}
                className="mt-4 w-full text-center text-xs font-semibold text-mocha transition-colors hover:text-rose-deep disabled:cursor-not-allowed disabled:font-normal disabled:text-taupe"
              >
                {cooldown > 0 ? `Yangi kodni ${cooldown} soniyadan so'ng olishingiz mumkin` : "Kodni qayta yuborish"}
              </button>
            </div>
          ) : null}
        </Step>
      </div>

      {/* Ulanmagan bo'lsa, 1-qadamdagi token havolasi ishlatiladi */}
      {isLinked ? (
        <TelegramBotLink
          label={isPhoneShared ? "Kodni ko'rish uchun botni ochish" : "Telegram botga o'tish"}
          className="mt-6"
        />
      ) : null}

      <p className="mt-6 text-center text-xs text-taupe">
        Kod bot orqali keladi. Uni hech kimga bermang.
      </p>
    </div>
  );
}

export default AuthVerify;
