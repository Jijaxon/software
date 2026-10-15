import { useEffect, useState } from "react";
import {formatPrice} from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ChevronRight, PackageOpen } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import ShoppingOrderDetailsView from "./order-details";
import OrderStatusBadge from "./order-status";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersByUserId(user?.id));
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  return (
    <div className="rounded-3xl border border-sand bg-white p-5 md:p-7">
      <h3 className="mb-6 font-display text-2xl font-semibold text-espresso">Buyurtmalar tarixi</h3>

      {orderList && orderList.length > 0 ? (
        <div className="grid gap-3">
          {orderList.map((orderItem, index) => (
            <button
              key={orderItem?._id}
              onClick={() => handleFetchOrderDetails(orderItem?._id)}
              style={{animationDelay: `${index * 60}ms`}}
              className="group flex animate-fade-up flex-wrap items-center gap-4 rounded-2xl border border-sand bg-ivory/60 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-petal hover:bg-white hover:shadow-lg hover:shadow-mocha/5 md:flex-nowrap md:px-6"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">Buyurtma</p>
                <p className="mt-0.5 truncate font-mono text-xs text-mocha">#{orderItem?._id}</p>
              </div>
              <div className="w-28">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">Sana</p>
                <p className="mt-0.5 text-sm text-espresso">{orderItem?.orderDate?.split("T")[0]}</p>
              </div>
              <div className="w-36">
                <OrderStatusBadge status={orderItem?.orderStatus} />
              </div>
              <div className="w-36 text-right">
                <p className="font-display text-xl font-semibold text-espresso">{formatPrice(orderItem?.totalAmount)}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-taupe transition-transform duration-300 group-hover:translate-x-1 group-hover:text-rose-deep" />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="grid h-20 w-20 animate-float place-items-center rounded-full bg-blush">
            <PackageOpen className="h-8 w-8 text-rose-deep" strokeWidth={1.4} />
          </div>
          <h4 className="mt-5 font-display text-2xl font-semibold text-espresso">Hali buyurtmalar yo'q</h4>
          <p className="mt-2 text-sm text-taupe">Birinchi xaridingiz shu yerda ko'rinadi.</p>
          <Button
            onClick={() => navigate("/shop/listing")}
            className="mt-6 h-11 rounded-full bg-espresso px-6 text-ivory hover:bg-mocha"
          >
            Xaridni boshlash
          </Button>
        </div>
      )}

      <Dialog
        open={openDetailsDialog}
        onOpenChange={() => {
          setOpenDetailsDialog(false);
          dispatch(resetOrderDetails());
        }}
      >
        <ShoppingOrderDetailsView orderDetails={orderDetails} />
      </Dialog>
    </div>
  );
}

export default ShoppingOrders;
