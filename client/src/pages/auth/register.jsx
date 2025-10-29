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
        toast.success(data?.payload?.message || "Register successful!");
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

  console.log(formData);

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2">
          Already have an account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/login"

          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthRegister;
