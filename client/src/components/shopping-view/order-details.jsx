import { useSelector } from "react-redux";
import {formatPrice, getFinalPrice} from "@/lib/utils";
import { MapPin } from "lucide-react";
import { DialogContent, DialogTitle } from "../ui/dialog";
import OrderStatusBadge from "./order-status";

const paymentStatusLabels = {
  pending: "Kutilmoqda",
  paid: "To'langan",
  failed: "Muvaffaqiyatsiz",
};

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span className="text-taupe">{label}</span>
      <span className="text-right font-medium text-espresso">{children}</span>
    </div>
  );
}

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <DialogContent className="nafis-scroll max-h-[90vh] w-[94vw] overflow-y-auto rounded-[28px] border-sand bg-ivory p-7 sm:max-w-[600px] sm:rounded-[28px] md:p-9">
      <div className="animate-fade-up">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-deep">Buyurtma tafsilotlari</p>
        <DialogTitle className="mt-2 break-all font-display text-2xl font-semibold text-espresso">
          #{orderDetails?._id}
        </DialogTitle>
        <div className="mt-3">
          <OrderStatusBadge status={orderDetails?.orderStatus} />
        </div>
      </div>

      <div className="divide-y divide-sand rounded-2xl border border-sand bg-white px-5">
        <InfoRow label="Sana">{orderDetails?.orderDate?.split("T")[0]}</InfoRow>
        <InfoRow label="To'lov usuli">{orderDetails?.paymentMethod}</InfoRow>
        <InfoRow label="To'lov holati">
          {paymentStatusLabels[orderDetails?.paymentStatus] || orderDetails?.paymentStatus}
        </InfoRow>
        <InfoRow label="Jami">
          <span className="font-display text-xl font-semibold">{formatPrice(orderDetails?.totalAmount)}</span>
        </InfoRow>
      </div>

      <div>
        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-taupe">Mahsulotlar</h4>
        <ul className="grid gap-2">
          {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
            ? orderDetails?.cartItems.map((item, index) => (
              <li
                key={item?.productId || index}
                className="flex items-center justify-between gap-3 rounded-2xl border border-sand bg-white px-4 py-3 text-sm"
              >
                <span className="min-w-0 flex-1 truncate font-medium text-espresso">{item.title}</span>
                <span className="text-taupe">× {item.quantity}</span>
                <span className="w-28 text-right font-semibold text-espresso">{formatPrice(getFinalPrice(item.price, item.salePrice))}</span>
              </li>
            ))
            : null}
        </ul>
      </div>

      <div className="rounded-2xl bg-blush/50 p-5">
        <h4 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-deep">
          <MapPin className="h-3.5 w-3.5" /> Yetkazib berish
        </h4>
        <div className="grid gap-0.5 text-sm text-mocha">
          <span className="font-semibold text-espresso">{user?.username}</span>
          <span>{orderDetails?.addressInfo?.address}</span>
          <span>
            {orderDetails?.addressInfo?.city}
            {orderDetails?.addressInfo?.pincode ? `, ${orderDetails?.addressInfo?.pincode}` : ""}
          </span>
          <span>{orderDetails?.addressInfo?.phone}</span>
          {orderDetails?.addressInfo?.notes ? (
            <span className="mt-1 text-xs italic text-taupe">“{orderDetails?.addressInfo?.notes}”</span>
          ) : null}
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
