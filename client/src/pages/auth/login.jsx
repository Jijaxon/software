import {Link} from "react-router-dom";
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

  function onSubmit(event) {
    event.preventDefault()
    dispatch(loginUser(formData)).then(data => {
      if (data?.payload.success) {
        toast.success(data?.payload.message);
      } else {
        toast.error(data?.payload.message)
      }
    })
    //toast.success("User successfully logged in");
  }


  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2">
          Don't have an account?
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={loginFormControls}
        buttonText={"Sign In"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthLogin;
