import {useRef} from "react";

// 6 xonali kod uchun alohida katakchalar: avtomatik o'tish, Backspace va nusxa joylash qo'llab-quvvatlanadi
function OtpInput({value, onChange, length = 6, disabled, autoFocus, onComplete}) {
  const inputsRef = useRef([]);
  const digits = Array.from({length}, (_, index) => value[index] || "");

  function update(nextValue) {
    const clean = nextValue.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  }

  function focusAt(index) {
    inputsRef.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  }

  function handleChange(index, event) {
    const typed = event.target.value.replace(/\D/g, "");
    if (!typed) return;

    if (typed.length > 1) {
      update(value.slice(0, index) + typed);
      focusAt(index + typed.length);
      return;
    }

    const next = digits.slice();
    next[index] = typed;
    update(next.join(""));
    focusAt(index + 1);
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = digits.slice();
      if (next[index]) {
        next[index] = "";
      } else if (index > 0) {
        next[index - 1] = "";
        focusAt(index - 1);
      }
      onChange(next.join("").replace(/\s/g, ""));
    } else if (event.key === "ArrowLeft") {
      focusAt(index - 1);
    } else if (event.key === "ArrowRight") {
      focusAt(index + 1);
    }
  }

  function handlePaste(event) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    update(pasted);
    focusAt(pasted.length);
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => (inputsRef.current[index] = element)}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          aria-label={`${index + 1}-raqam`}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
          className={`h-14 w-full min-w-0 rounded-2xl border bg-white text-center font-display text-3xl font-semibold text-espresso outline-none transition-all duration-300 focus:border-petal focus:ring-4 focus:ring-blush disabled:opacity-50 sm:h-16 ${
            digit ? "border-petal" : "border-sand"
          }`}
        />
      ))}
    </div>
  );
}

export default OtpInput;
