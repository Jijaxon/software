import {ToastContainer, cssTransition} from "react-toastify";
import {AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle} from "lucide-react";

const nafisTransition = cssTransition({
  enter: "nafis-toast-in",
  exit: "nafis-toast-out",
  collapseDuration: 250,
});

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  default: Info,
};

function ToastIcon({type, isLoading}) {
  const Icon = isLoading ? Loader2 : toastIcons[type] || Info;

  return (
    <span className="nafis-toast__icon">
      <Icon className={`h-[18px] w-[18px] ${isLoading ? "animate-spin" : ""}`} strokeWidth={2}/>
    </span>
  );
}

function ToastCloseButton({closeToast}) {
  return (
    <button type="button" aria-label="Yopish" onClick={closeToast} className="nafis-toast__close">
      <X className="h-3.5 w-3.5"/>
    </button>
  );
}

function NafisToaster() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={2800}
      newestOnTop
      limit={4}
      pauseOnFocusLoss={false}
      theme="light"
      transition={nafisTransition}
      icon={ToastIcon}
      closeButton={ToastCloseButton}
      className="nafis-toaster"
      toastClassName="nafis-toast"
    />
  );
}

export default NafisToaster;
