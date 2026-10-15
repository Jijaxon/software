import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {useState} from "react";
import {MailCheck} from "lucide-react";
import CommonForm from "@/components/common/form.jsx";
import {verifyFormControls} from "@/config/index.js";
import {useDispatch} from "react-redux";
import {  verifyUser} from "@/store/auth-slice/index.js";
import {toast} from "react-toastify";

const initialState = {
  code: ""
}

function AuthVerify() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");


  function onSubmit(event) {
    event.preventDefault();
    dispatch(verifyUser({email, code: formData.code})).then((data) => {
      if (data?.payload?.success) {
        toast.success(data?.payload?.message || "Email tasdiqlandi!");
        navigate("/auth/login");
      } else if (!data?.payload?.error) {
        toast.error(data?.payload?.message || "Kod noto'g'ri. Qayta urinib ko'ring");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-10">
        <div className="mb-6 grid h-16 w-16 animate-float place-items-center rounded-full bg-blush">
          <MailCheck className="h-7 w-7 text-rose-deep" strokeWidth={1.5}/>
        </div>
        <h1 className="font-display text-5xl font-medium leading-tight text-espresso">
          Emailingizni tasdiqlang
        </h1>
        <p className="mt-3 text-sm leading-6 text-taupe">
          Tasdiqlash kodini <b className="font-semibold text-espresso">{email}</b> manziliga yubordik. Uni quyida kiriting.
        </p>
      </div>
      <CommonForm
        variant="nafis"
        formControls={verifyFormControls}
        buttonText={"Tasdiqlash"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
      <p className="mt-8 text-center text-xs text-taupe">
        Kod kelmadimi?
        <Link className="nav-link ml-1.5 font-semibold text-mocha" to="/auth/verify">
          Qayta yuborish
        </Link>
      </p>
    </div>
  );
}

export default AuthVerify;
