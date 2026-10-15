import { useState } from "react";
import { StarIcon } from "lucide-react";

function StarRatingComponent({ rating, handleRatingChange, size = "md" }) {
  const [hovered, setHovered] = useState(0);
  const isInteractive = Boolean(handleRatingChange);
  const activeValue = hovered || rating;
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-7 w-7" : "h-5 w-5";

  return [1, 2, 3, 4, 5].map((star) => {
    const isFilled = star <= Math.round(activeValue);
    const icon = (
      <StarIcon
        className={`${iconSize} transition-all duration-300 ${
          isFilled ? "fill-gold text-gold" : "fill-transparent text-[#d9c8bd]"
        }`}
        strokeWidth={1.5}
      />
    );

    if (!isInteractive) {
      return <span key={star}>{icon}</span>;
    }

    return (
      <button
        type="button"
        key={star}
        aria-label={`${star} yulduz`}
        className="rounded-full p-0.5 transition-transform duration-200 hover:scale-125 active:scale-95"
        onMouseEnter={() => setHovered(star)}
        onMouseLeave={() => setHovered(0)}
        onClick={() => handleRatingChange(star)}
      >
        {icon}
      </button>
    );
  });
}

export default StarRatingComponent;
