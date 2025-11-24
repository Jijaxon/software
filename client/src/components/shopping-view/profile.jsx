import {useEffect, useState} from "react";
import CommonForm from "../common/form";
import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {toast} from "react-toastify";
import {useDispatch, useSelector} from "react-redux";
import {profileFormControls} from "@/config/index.js";
import {updateUser} from "@/store/auth-slice/index.js";

const initialProfileFormData = {
  email: "",
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
        email: user?.email ?? "",
        username: user?.username ?? "",
      })
    }
  }, []);

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key].trim() !== "")
      .every((item) => item);
  }

  function handleManageProfile(e) {
    e.preventDefault();

    dispatch(updateUser({...formData})).then(({payload}) => {
      if (payload?.success) {
        toast.success(`${payload?.message}`)
      } else {
        toast.error("Something went wrong")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {"Update profile"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CommonForm
          formControls={profileFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={"Update"}
          onSubmit={handleManageProfile}
          isBtnDisabled={!isFormValid()}
        />
      </CardContent>
    </Card>
  )
}

export default Profile