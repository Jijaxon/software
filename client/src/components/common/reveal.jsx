import {useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";

// Element ekranga kirganda ohista paydo bo'ladi
function Reveal({as: Component = "div", delay = 0, className, style, children, ...props}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {threshold: 0.12, rootMargin: "0px 0px -40px 0px"}
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      className={cn("reveal", isVisible && "is-visible", className)}
      style={{"--reveal-delay": `${delay}ms`, ...style}}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Reveal;
