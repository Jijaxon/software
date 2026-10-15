import {useEffect, useState} from "react";
import CommonForm from "../common/form";
import {MapPinPlus} from "lucide-react";
import {addressFormControls} from "@/config";
import {useDispatch, useSelector} from "react-redux";
import {addNewAddress, deleteAddress, editaAddress, fetchAllAddresses,} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import {toast} from "react-toastify";

const initialAddressFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};

function Address({setCurrentSelectedAddress, selectedId}) {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const dispatch = useDispatch();
  const {user} = useSelector((state) => state.auth);
  const {addressList} = useSelector((state) => state.shopAddress);

  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast.warning("Ko'pi bilan 3 ta manzil qo'shish mumkin");
      return;
    }

    currentEditedId !== null
      ? dispatch(
        editaAddress({
          userId: user?.id,
          addressId: currentEditedId,
          formData,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllAddresses(user?.id));
          setCurrentEditedId(null);
          setFormData(initialAddressFormData);
          toast.success("Manzil yangilandi");
        }
      })
      : dispatch(
        addNewAddress({
          ...formData,
          userId: user?.id,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllAddresses(user?.id));
          setFormData(initialAddressFormData);
          toast.success("Manzil qo'shildi");
        }
      });
  }

  function handleDeleteAddress(getCurrentAddress) {
    dispatch(
      deleteAddress({userId: user?.id, addressId: getCurrentAddress._id})
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        toast.info("Manzil o'chirildi");
      }
    });
  }

  function handleEditAddress(getCuurentAddress) {
    setCurrentEditedId(getCuurentAddress?._id);
    setFormData({
      ...formData,
      address: getCuurentAddress?.address,
      city: getCuurentAddress?.city,
      phone: getCuurentAddress?.phone,
      pincode: getCuurentAddress?.pincode,
      notes: getCuurentAddress?.notes,
    });
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key].trim() !== "")
      .every((item) => item);
  }

  useEffect(() => {
    dispatch(fetchAllAddresses(user?.id));
  }, [dispatch]);

  return (
    <div className="@container">
      <div className="grid gap-6 @3xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-sand bg-white/60 p-5 md:p-6">
          <div className="mb-5 flex items-baseline justify-between">
            <h3 className="font-display text-2xl font-semibold text-espresso">
              {setCurrentSelectedAddress ? "Yetkazib berish manzili" : "Mening manzillarim"}
            </h3>
            <span className="text-xs text-taupe">{addressList?.length || 0} / 3</span>
          </div>
          {addressList && addressList.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @3xl:grid-cols-1 @5xl:grid-cols-2">
              {addressList.map((singleAddressItem, index) => (
                <div key={singleAddressItem?._id || index} className="animate-fade-up" style={{animationDelay: `${index * 70}ms`}}>
                  <AddressCard
                    selectedId={selectedId}
                    handleDeleteAddress={handleDeleteAddress}
                    addressInfo={singleAddressItem}
                    handleEditAddress={handleEditAddress}
                    setCurrentSelectedAddress={setCurrentSelectedAddress}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-sand px-4 py-10 text-center text-sm text-taupe">
              Hali manzil qo'shilmagan. Yon tomondagi formadan foydalaning.
            </p>
          )}
          {setCurrentSelectedAddress && addressList?.length > 0 ? (
            <p className="mt-4 text-xs text-taupe">Buyurtma uchun manzilni tanlang — ustiga bosing.</p>
          ) : null}
        </div>
        <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm md:p-7">
          <h3 className="mb-5 flex items-center gap-2 font-display text-2xl font-semibold text-espresso">
            <MapPinPlus className="h-5 w-5 text-rose-deep" strokeWidth={1.6}/>
            {currentEditedId !== null ? "Manzilni tahrirlash" : "Yangi manzil"}
          </h3>
          <CommonForm
            variant="nafis"
            formControls={addressFormControls}
            formData={formData}
            setFormData={setFormData}
            buttonText={currentEditedId !== null ? "Saqlash" : "Qo'shish"}
            onSubmit={handleManageAddress}
            isBtnDisabled={!isFormValid()}
          />
        </div>
      </div>
    </div>
  );
}

export default Address;
