import {useEffect, useState} from "react";
import CommonForm from "../common/form";
import {toast} from "react-toastify";
import {useDispatch, useSelector} from "react-redux";
import {profileFormControls} from "@/config/index.js";
import {updateUser} from "@/store/auth-slice/index.js";
import {Send} from "lucide-react";
import {formatPhone} from "@/lib/utils";

const initialProfileFormData = {
  username: "",
  password: "",
};


function Profile() {
  const [formData, setFormData] = useState(initialProfileFormData);

  const dispatch = useDispatch();
  const {user} = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user?.username ?? "",
        password: "",
      })
    }
  }, []);

  function isFormValid() {
    return formData.username.trim() !== "";
  }

  function handleManageProfile(e) {
    e.preventDefault();

    const payloadData = {username: formData.username.trim()};
    if (formData.password) payloadData.password = formData.password;

    dispatch(updateUser(payloadData)).then(({payload}) => {
      if (payload?.success) {
        toast.success(payload?.message || "Profil yangilandi")
        setFormData((prev) => ({...prev, password: ""}))
      } else {
        toast.error(payload?.message || "Nimadir xato ketdi. Qayta urinib ko'ring")
      }
    })
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 rounded-3xl border border-sand bg-white p-6 md:grid-cols-[220px_1fr] md:p-8">
      <div className="flex flex-col items-center text-center md:border-r md:border-sand md:pr-6">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-petal to-rose font-display text-4xl font-semibold text-white shadow-lg shadow-rose/25">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <p className="mt-4 font-display text-2xl font-semibold text-espresso">{user?.username}</p>
        <p className="mt-1 break-all text-xs text-taupe">{user?.phone ? formatPhone(user.phone) : user?.email}</p>
        {user?.phone ? (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e5f1fb] px-3 py-1 text-[11px] font-semibold text-[#2481cc]">
            <Send className="h-3 w-3"/> Telegram ulangan
          </span>
        ) : null}
      </div>
      <div>
        <h3 className="mb-5 font-display text-2xl font-semibold text-espresso">Profilni yangilash</h3>
        <CommonForm
          variant="nafis"
          formControls={profileFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={"Saqlash"}
          onSubmit={handleManageProfile}
          isBtnDisabled={!isFormValid()}
        />
      </div>
    </div>
  )
}

export default Profile
