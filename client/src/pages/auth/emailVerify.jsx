import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import {Mail} from "lucide-react";
import CommonForm from "@/components/common/form.jsx";
import {reVerifyFormControls} from "@/config/index.js";
import {useDispatch} from "react-redux";
import {resendVerificationCode} from "@/store/auth-slice/index.js";
import {toast} from "react-toastify";

const initialState = {
  email: '',
}

function AuthEmailVerify() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  function onSubmit(event) {
    event.preventDefault();
    dispatch(resendVerificationCode(formData)).then((data) => {
      if (data?.payload?.success) {
        toast.success(data?.payload?.message || "Kod yuborildi!");
        setTimeout(() => {
          navigate("/auth/verify-email?email=" + formData.email);
        }, 200)
      } else if (!data?.payload?.error) {
        toast.error(data?.payload?.message || "Kodni yuborib bo'lmadi. Qayta urinib ko'ring");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-10">
        <div className="mb-6 grid h-16 w-16 animate-float place-items-center rounded-full bg-blush">
          <Mail className="h-7 w-7 text-rose-deep" strokeWidth={1.5}/>
        </div>
        <h1 className="font-display text-5xl font-medium leading-tight text-espresso">
          Emailni tasdiqlash
        </h1>
        <p className="mt-3 text-sm text-taupe">
          Hisobingiz tasdiqlanganmi?
          <Link className="nav-link ml-2 font-semibold text-rose-deep" to="/auth/login">
            Kirish
          </Link>
        </p>
      </div>
      <CommonForm
        variant="nafis"
        formControls={reVerifyFormControls}
        buttonText={"Tasdiqlash kodini yuborish"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthEmailVerify;
