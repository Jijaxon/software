import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import CommonForm from "@/components/common/form.jsx";
import {registerFormControls} from "@/config/index.js";
import {useDispatch} from "react-redux";
import {registerUser} from "@/store/auth-slice/index.js";
import {toast} from "react-toastify";

const initialState = {
  username: '',
  email: '',
  password: '',
}

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  function onSubmit(event) {
    event.preventDefault();
    dispatch(registerUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast.success(data?.payload?.message || "Ro'yxatdan o'tdingiz! Emailingizni tasdiqlang");
        setTimeout(() => {
          navigate("/auth/verify-email?email=" + formData.email);
        }, 200)
      } else if (!data?.payload?.error) {
        toast.error(data?.payload?.message || "Bu foydalanuvchi allaqachon mavjud");
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
        buttonText={"Ro'yxatdan o'tish"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthRegister;
