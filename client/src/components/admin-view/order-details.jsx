import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {toast} from "react-toastify";
import {Loader2, MapPin, Send} from "lucide-react";
import {formatDateTime, formatPhone, formatPrice} from "@/lib/utils";
import {DialogContent, DialogDescription, DialogTitle} from "../ui/dialog";
import {Button} from "../ui/button";
import OrderStatusBadge from "@/components/shopping-view/order-status.jsx";
import {getAllOrdersForAdmin, getOrderDetailsForAdmin, updateOrderStatus} from "@/store/admin/order-slice";
import instance from "@/utils/axios.js";

// Holatlar tartibi — mijozga har o'zgarishda Telegram xabari boradi
const STATUS_FLOW = [
  {id: "confirmed", label: "Tasdiqlandi"},
  {id: "inProcess", label: "Tayyorlanmoqda"},
  {id: "inShipping", label: "Yo'lda"},
  {id: "delivered", label: "Yetkazildi"},
  {id: "rejected", label: "Bekor qilindi"},
];

function Row({label, children, strong}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-taupe">{label}</span>
      <span className={strong ? "font-display text-xl font-semibold text-espresso" : "text-espresso"}>{children}</span>
    </div>
  );
}

function AdminOrderDetailsView({orderDetails}) {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(orderDetails?.orderStatus);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(orderDetails?.orderStatus);
  }, [orderDetails?.orderStatus]);

  async function handleUpdateStatus() {
    setSaving(true);
    const res = await dispatch(updateOrderStatus({id: orderDetails._id, orderStatus: status}));
    setSaving(false);
    if (res?.payload?.success) {
      toast.success(res.payload.notified ? "Holat yangilandi — mijozga Telegram xabari yuborildi" : "Holat yangilandi");
      dispatch(getOrderDetailsForAdmin(orderDetails._id));
      dispatch(getAllOrdersForAdmin());
    } else {
      toast.error(res?.payload?.message || "Holatni yangilab bo'lmadi");
    }
  }

  const address = orderDetails?.addressInfo || {};
  const customer = orderDetails?.userId;

  return (
    <DialogContent className="nafis-scroll max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-[640px]">
      <div className="space-y-6">
        <div>
          <DialogTitle className="font-display text-2xl text-espresso">
            Buyurtma #{orderDetails?._id?.slice(0, 8).toUpperCase()}
          </DialogTitle>
          <DialogDescription className="mt-1 flex flex-wrap items-center gap-2 text-taupe">
            {formatDateTime(orderDetails?.orderDate)}
            <OrderStatusBadge status={orderDetails?.orderStatus}/>
            <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs text-mocha">
              {orderDetails?.paymentStatus} · {orderDetails?.paymentMethod}
            </span>
          </DialogDescription>
        </div>

        {/* Holatni o'zgartirish */}
        <div className="rounded-2xl border border-sand bg-cream/50 p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">Holatni o'zgartirish</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_FLOW.map((item) => (
              <button
                key={item.id}
                onClick={() => setStatus(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  status === item.id
                    ? item.id === "rejected" ? "bg-destructive text-white" : "bg-espresso text-ivory"
                    : "border border-sand bg-white text-mocha hover:bg-blush/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Button
            onClick={handleUpdateStatus}
            disabled={saving || status === orderDetails?.orderStatus}
            className="mt-4 h-10 w-full gap-2 rounded-full bg-espresso text-ivory hover:bg-mocha"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
            Saqlash va mijozga xabar berish
          </Button>
        </div>

        {/* Mahsulotlar */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">Mahsulotlar</p>
          <ul className="space-y-2">
            {(orderDetails?.cartItems || []).map((item) => (
              <li key={item.productId} className="flex items-center gap-3 rounded-2xl border border-sand p-2.5">
                {item.image ? (
                  <img src={instance.defaults.baseURL + item.image} alt="" className="h-12 w-12 rounded-xl object-cover"/>
                ) : null}
                <span className="min-w-0 flex-1 truncate text-sm text-espresso">{item.title}</span>
                <span className="text-xs text-taupe">× {item.quantity}</span>
                <span className="w-28 text-right text-sm font-semibold text-espresso">
                  {formatPrice((item.unitPrice ?? item.price * (1 - (item.salePrice || 0) / 100)) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Narx tarkibi */}
        <div className="space-y-2 rounded-2xl border border-sand p-4">
          {orderDetails?.subtotal != null ? <Row label="Mahsulotlar">{formatPrice(orderDetails.subtotal)}</Row> : null}
          <Row label="Yetkazib berish">{orderDetails?.deliveryFee > 0 ? formatPrice(orderDetails.deliveryFee) : "Bepul"}</Row>
          {orderDetails?.discountAmount > 0 ? (
            <Row label={`Promokod (${orderDetails.couponCode})`}>−{formatPrice(orderDetails.discountAmount)}</Row>
          ) : null}
          {orderDetails?.bonusUsed > 0 ? <Row label="Bonus">−{formatPrice(orderDetails.bonusUsed)}</Row> : null}
          <div className="border-t border-sand pt-2">
            <Row label="Jami" strong>{formatPrice(orderDetails?.totalAmount)}</Row>
          </div>
        </div>

        {/* Mijoz va manzil */}
        <div className="flex items-start gap-3 rounded-2xl bg-cream/60 p-4 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-deep"/>
          <div className="space-y-0.5 text-mocha">
            <p className="font-semibold text-espresso">
              {customer?.username || formatPhone(customer?.phone) || customer?.email || "Mijoz"}
            </p>
            <p>{[address.city, address.district, address.address].filter(Boolean).join(", ")}</p>
            {address.phone ? <p>{address.phone}</p> : null}
            {address.notes ? <p className="text-taupe">{address.notes}</p> : null}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
