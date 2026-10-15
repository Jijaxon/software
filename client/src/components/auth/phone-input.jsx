// O'zbekiston raqami: +998 prefiksi qotirilgan, qolgan 9 raqam "90 123 45 67" ko'rinishida
function formatLocal(digits) {
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)];
  return parts.filter(Boolean).join(" ");
}

// value — faqat 9 ta mahalliy raqam (masalan "901234567")
function PhoneInput({value, onChange, autoFocus, disabled, id = "phone"}) {
  function handleChange(event) {
    let digits = event.target.value.replace(/\D/g, "");
    if (digits.length > 9 && digits.startsWith("998")) digits = digits.slice(3);
    onChange(digits.slice(0, 9));
  }

  return (
    <div className="group flex h-12 items-center rounded-2xl border border-sand bg-white px-4 transition-all duration-300 focus-within:border-petal focus-within:ring-4 focus-within:ring-blush">
      <span className="mr-2 border-r border-sand pr-3 text-sm font-semibold text-mocha">+998</span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        autoFocus={autoFocus}
        disabled={disabled}
        value={formatLocal(value)}
        onChange={handleChange}
        placeholder="90 123 45 67"
        className="h-full w-full bg-transparent text-sm tracking-wide text-espresso outline-none placeholder:text-taupe/70 disabled:opacity-60"
      />
    </div>
  );
}

export default PhoneInput;
