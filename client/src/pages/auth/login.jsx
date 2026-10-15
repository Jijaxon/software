import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import CommonForm from "@/components/common/form.jsx";
import {loginFormControls} from "@/config/index.js";
import {toast} from "react-toastify";
import {useDispatch} from "react-redux";
import {loginUser} from "@/store/auth-slice/index.js";

const initialState = {
  email: '',
  password: '',
}

function AuthLogin() {
  const [formData, setFormData] = useState(initialState)
  const dispatch = useDispatch();
  const navigate = useNavigate()

  function onSubmit(event) {
    event.preventDefault();
    dispatch(loginUser(formData)).then(data => {
      if (data?.payload?.success) {
        toast.success(data?.payload?.message || "Xush kelibsiz!");
        navigate("/shop/home")
      } else if (!data?.payload?.error) {
        toast.error(data?.payload?.message || "Email yoki parol noto'g'ri");
      }
    });
  }


  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-10">
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
      <CommonForm
        variant="nafis"
        formControls={loginFormControls}
        buttonText={"Kirish"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
      <p className="mt-8 text-center text-xs text-taupe">
        Emailingiz hali tasdiqlanmaganmi?
        <Link className="nav-link ml-1.5 font-semibold text-mocha" to="/auth/verify">
          Tasdiqlash
        </Link>
      </p>
    </div>
  );
}

export default AuthLogin;
