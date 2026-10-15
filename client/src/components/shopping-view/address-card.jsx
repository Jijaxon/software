import { CheckCircle2, MapPin, Pencil, Phone, Trash2 } from "lucide-react";

function AddressCard({
                       addressInfo,
                       handleDeleteAddress,
                       handleEditAddress,
                       setCurrentSelectedAddress,
                       selectedId,
                     }) {
  const isSelected = selectedId?._id === addressInfo?._id;

  return (
    <div
      onClick={
        setCurrentSelectedAddress
          ? () => setCurrentSelectedAddress(addressInfo)
          : null
      }
      className={`group relative rounded-2xl border bg-white p-5 transition-all duration-300 ${
        setCurrentSelectedAddress ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-mocha/5" : ""
      } ${
        isSelected
          ? "border-rose-deep shadow-lg shadow-rose/15 ring-1 ring-rose-deep"
          : "border-sand hover:border-petal"
      }`}
    >
      {isSelected ? (
        <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 animate-pop text-rose-deep" />
      ) : null}
      <div className="flex items-start gap-3 pr-6">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blush text-rose-deep">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="min-w-0 space-y-1 text-sm">
          <p className="font-semibold text-espresso">{addressInfo?.address}</p>
          <p className="text-mocha/80">
            {addressInfo?.city}
            {addressInfo?.pincode ? `, ${addressInfo?.pincode}` : ""}
          </p>
          <p className="flex items-center gap-1.5 text-mocha/80">
            <Phone className="h-3.5 w-3.5" /> {addressInfo?.phone}
          </p>
          {addressInfo?.notes ? (
            <p className="pt-1 text-xs italic text-taupe">“{addressInfo?.notes}”</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex gap-2 border-t border-sand pt-4">
        <button
          onClick={(event) => {
            event.stopPropagation();
            handleEditAddress(addressInfo);
          }}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-mocha transition-colors hover:bg-cream"
        >
          <Pencil className="h-3.5 w-3.5" /> Tahrirlash
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation();
            handleDeleteAddress(addressInfo);
          }}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" /> O'chirish
        </button>
      </div>
    </div>
  );
}

export default AddressCard;
