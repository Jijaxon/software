import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {useState} from "react";
import CommonForm from "@/components/common/form.jsx";
import {verifyFormControls} from "@/config/index.js";
import {useDispatch} from "react-redux";
import {verifyUser} from "@/store/auth-slice/index.js";
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
    console.log(formData)
    dispatch(verifyUser({email, code: formData.code})).then((data) => {
      if (data?.payload?.success) {
        toast.success(data?.payload?.message || "Verify successfully!");
        navigate("/auth/login");
      } else {
        toast.error("User already exists! Please try again!", {
          variant: "destructive",
          style: {
            backgroundColor: "#ef4444",
            color: "#fff",
          },
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Verify your email
        </h1>
        <p className="mt-2">
          We sent a verification code to <b>{email}</b>. Enter it below:
        </p>
      </div>
      <CommonForm
        formControls={verifyFormControls}
        buttonText={"Verify"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthVerify;
