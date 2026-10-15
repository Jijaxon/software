const statusStyles = {
  pending: {label: "Kutilmoqda", className: "bg-[#f7ead6] text-[#93672c]", dot: "bg-[#b9823a]"},
  confirmed: {label: "Tasdiqlandi", className: "bg-[#e6efe6] text-[#4f6e52]", dot: "bg-sage"},
  inProcess: {label: "Tayyorlanmoqda", className: "bg-blush text-rose-deep", dot: "bg-rose-deep"},
  inShipping: {label: "Yo'lda", className: "bg-[#e5ebf3] text-[#4b6283]", dot: "bg-[#5d7aa3]"},
  delivered: {label: "Yetkazildi", className: "bg-[#e6efe6] text-[#4f6e52]", dot: "bg-sage"},
  rejected: {label: "Bekor qilindi", className: "bg-[#f8e1e2] text-destructive", dot: "bg-destructive"},
};

function OrderStatusBadge({status}) {
  const style = statusStyles[status] || {label: status, className: "bg-cream text-mocha", dot: "bg-taupe"};

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.className}`}>
      <span className={`relative h-1.5 w-1.5 rounded-full ${style.dot}`}>
        {status === "pending" || status === "inShipping" || status === "inProcess" ? (
          <span className={`absolute inset-0 animate-ping rounded-full ${style.dot}`}/>
        ) : null}
      </span>
      {style.label}
    </span>
  );
}

export default OrderStatusBadge;
