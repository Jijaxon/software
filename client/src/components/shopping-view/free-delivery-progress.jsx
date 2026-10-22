import {useSelector} from "react-redux";
import {Truck} from "lucide-react";
import {formatPrice} from "@/lib/utils";
import {useT} from "@/i18n/index.jsx";

// "Yana X so'm — yetkazish bepul" progress-bar. subtotal — chegirmali mahsulotlar summasi
function FreeDeliveryProgress({subtotal, className = ""}) {
  const {t} = useT();
  const threshold = useSelector((state) => state.growth.settings.freeDeliveryThreshold);

  if (!threshold || threshold <= 0) return null;

  const remaining = Math.max(0, threshold - subtotal);
  const percent = Math.min(100, Math.round((subtotal / threshold) * 100));
  const unlocked = remaining <= 0;

  return (
    <div className={`rounded-2xl border border-sand bg-white px-4 py-3 ${className}`}>
      <p className={`flex items-center gap-2 text-xs font-medium ${unlocked ? "text-sage" : "text-mocha"}`}>
        <Truck className="h-4 w-4 shrink-0"/>
        {unlocked ? t("delivery.unlocked") : t("delivery.remaining", {amount: formatPrice(remaining)})}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${unlocked ? "bg-sage" : "bg-gradient-to-r from-petal to-rose-deep"}`}
          style={{width: `${percent}%`}}
        />
      </div>
    </div>
  );
}

export default FreeDeliveryProgress;
