import {useEffect} from "react";

const SITE = "NAFIS";
const DEFAULT_DESCRIPTION = "NAFIS — yuz va soch parvarishi, makiyaj va atirlar do'koni";

function setMeta(selector, attr, value) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    const [, key, name] = /\[(\w+)="([^"]+)"\]/.exec(selector);
    tag.setAttribute(key, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute(attr, value);
}

// Sahifa sarlavhasi va description (SEO va brauzer tablari uchun)
export function useDocumentTitle(title, description) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} — Go'zallik do'koni`;
    document.title = fullTitle;
    setMeta('meta[name="description"]', "content", description || DEFAULT_DESCRIPTION);
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", description || DEFAULT_DESCRIPTION);
  }, [title, description]);
}
