import {Link, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {ArrowLeft, KeyRound, Loader2, Send} from "lucide-react";
import CommonForm from "@/components/common/form.jsx";
import {loginFormControls} from "@/config/index.js";
import {toast} from "react-toastify";
import {useDispatch} from "react-redux";
import {Button} from "@/components/ui/button.jsx";
import PhoneInput from "@/components/auth/phone-input.jsx";
import OtpInput from "@/components/auth/otp-input.jsx";
import TelegramBotLink from "@/components/auth/telegram-bot-link.jsx";
import {
  getTelegramInfo,
  loginUser,
  requestTelegramLogin,
  verifyTelegramLogin,
} from "@/store/auth-slice/index.js";
import {formatPhone} from "@/lib/utils";
import {useCountdown} from "@/lib/use-countdown.js";

const initialState = {
  login: '',
  password: '',
}

const tabs = [
  {id: "telegram", label: "Telegram kod", icon: Send},
  {id: "password", label: "Parol bilan", icon: KeyRound},
];

function TelegramLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone");
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
    dispatch(requestTelegramLogin({phone: fullPhone})).then(({payload}) => {
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
    dispatch(verifyTelegramLogin({phone: fullPhone, code: value})).then(({payload}) => {
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

  if (step === "code") {
    return (
      <div className="animate-fade-up">
        <button
          onClick={() => {
            setStep("phone");
            setCode("");
          }}
          className="group mb-5 flex items-center gap-1.5 text-xs font-semibold text-mocha hover:text-espresso"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"/> Raqamni o'zgartirish
        </button>
        <p className="mb-5 text-sm leading-6 text-taupe">
          <b className="font-semibold text-espresso">{formatPhone(fullPhone)}</b> raqamiga ulangan Telegram'ga kirish kodi yuborildi.
          {botLink ? (
            <a href={botLink} target="_blank" rel="noopener noreferrer" className="nav-link ml-1 font-semibold text-[#2481cc]">
              Botni ochish
            </a>
          ) : null}
        </p>
        <OtpInput value={code} onChange={setCode} autoFocus disabled={isSubmitting} onComplete={handleVerify}/>
        <Button
          onClick={() => handleVerify()}
          disabled={code.length !== 6 || isSubmitting}
          className="mt-5 h-12 w-full rounded-full bg-espresso text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-mocha disabled:translate-y-0"
        >
          {isSubmitting ? <Loader2 className="animate-spin"/> : null}
          Kirish
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

  return (
    <form onSubmit={handleRequest} className="animate-fade-up">
      <label htmlFor="phone" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">
        Telefon raqam
      </label>
      <PhoneInput value={phone} onChange={setPhone} autoFocus/>
      <Button
        type="submit"
        disabled={phone.length !== 9 || isSubmitting}
        className="group mt-5 h-12 w-full rounded-full bg-[#2aabee] text-sm font-semibold text-white shadow-lg shadow-[#2aabee]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#229ed9] disabled:translate-y-0 disabled:bg-taupe/50 disabled:shadow-none"
      >
        {isSubmitting ? <Loader2 className="animate-spin"/> : <Send className="transition-transform duration-300 group-hover:-rotate-12"/>}
        Telegram'ga kod yuborish
      </Button>
      <p className="mt-4 text-center text-xs leading-5 text-taupe">
        Kod hisobingizga ulangan Telegram akkauntga NAFIS boti orqali keladi.
      </p>
    </form>
  );
}

function PasswordLogin() {
  const [formData, setFormData] = useState(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  function onSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    dispatch(loginUser(formData)).then(data => {
      setIsSubmitting(false);
      const payload = data?.payload;
      if (payload?.success) {
        toast.success(payload?.message || "Xush kelibsiz!");
        navigate("/shop/home")
      } else if (payload?.needsVerification) {
        toast.info(payload.message);
        navigate(`/auth/verify?token=${payload.token}`, {state: {telegramLink: payload.telegramLink}});
      } else if (!payload?.error) {
        toast.error(payload?.message || "Login yoki parol noto'g'ri");
      }
    });
  }

  return (
    <div className="animate-fade-up">
      <CommonForm
        variant="nafis"
        formControls={loginFormControls}
        buttonText={isSubmitting ? "Kirilmoqda..." : "Kirish"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        isBtnDisabled={isSubmitting || !formData.login.trim() || !formData.password}
      />
      <p className="mt-4 text-center text-xs text-taupe">
        Parolni unutdingizmi? «Telegram kod» orqali kiring.
      </p>
    </div>
  );
}

function AuthLogin() {
  const [activeTab, setActiveTab] = useState("telegram");

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">Xush kelibsiz</p>
        <h1 className="mt-3 font-display text-5xl font-medium leading-tight text-espresso">
          Hisobingizga kiring
        </h1>
        <p className="mt-3 text-sm text-taupe">
          Hisobingiz yo'qmi?
          <Link className="nav-link ml-2 font-semibold text-rose-deep" to="/auth/register">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-1 rounded-full border border-sand bg-white p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold transition-all duration-300 sm:text-sm ${
              activeTab === tab.id ? "bg-espresso text-ivory shadow-md" : "text-mocha hover:bg-cream"
            }`}
          >
            <tab.icon className="h-4 w-4"/>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "telegram" ? <TelegramLogin/> : <PasswordLogin/>}

      <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">
        <span className="h-px flex-1 bg-sand"/>
        yoki
        <span className="h-px flex-1 bg-sand"/>
      </div>
      <TelegramBotLink/>
    </div>
  );
}

export default AuthLogin;
