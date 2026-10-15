import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import {Send} from "lucide-react";
import CommonForm from "@/components/common/form.jsx";
import {registerFormControls} from "@/config/index.js";
import {useDispatch} from "react-redux";
import {registerUser} from "@/store/auth-slice/index.js";
import {toast} from "react-toastify";

const initialState = {
  username: '',
  password: '',
}

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function onSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    dispatch(registerUser(formData)).then((data) => {
      setIsSubmitting(false);
      if (data?.payload?.success) {
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
      <CommonForm
        variant="nafis"
        formControls={registerFormControls}
        buttonText={isSubmitting ? "Yuborilmoqda..." : "Davom etish"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        isBtnDisabled={isSubmitting || !formData.username.trim() || formData.password.length < 6}
      />
      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#e5f1fb]/70 p-4 text-xs leading-5 text-[#2b5f8a]">
        <Send className="mt-0.5 h-4 w-4 shrink-0 text-[#2481cc]"/>
        <p>
          Keyingi qadamda hisobingizni <b>Telegram bot</b> orqali tasdiqlaysiz: bot telefon raqamingizni so'raydi
          va tasdiqlash kodini yuboradi.
        </p>
      </div>
    </div>
  );
}

export default AuthRegister;
