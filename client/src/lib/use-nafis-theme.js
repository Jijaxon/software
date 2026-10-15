import {useLayoutEffect} from "react";

// Portal orqali chiqadigan dialog, sheet va menyular ham client mavzusini olishi uchun
// klass body'ga qo'yiladi. Admin panelga o'tilganda olib tashlanadi.
export function useNafisTheme() {
  useLayoutEffect(() => {
    document.body.classList.add("theme-nafis");
    return () => document.body.classList.remove("theme-nafis");
  }, []);
}
