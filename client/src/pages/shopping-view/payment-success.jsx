import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {confirmPayment} from "@/store/shop/order-slice/index.js";
import {clearCartItems} from "@/store/shop/cart-slice/index.js";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

    if (sessionId && orderId) {
      dispatch(confirmPayment({ sessionId, orderId }))
        .then(() => {
          console.log("Payment confirmed successfully!");
          dispatch(clearCartItems({userId: user?.id}))
        })
        .catch((err) => {
          console.error("Payment confirmation failed:", err);
        });
    }
  }, [searchParams, dispatch]);

  return (
    <Card className="p-10">
      <CardHeader className="p-0">
        <CardTitle className="text-4xl">Payment is successfully!</CardTitle>
      </CardHeader>
      <Button className="mt-5" onClick={() => navigate("/shop/account")}>
        View Orders
      </Button>
    </Card>
  );
}

export default PaymentSuccessPage;