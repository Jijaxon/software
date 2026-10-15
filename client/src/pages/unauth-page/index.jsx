import {Link} from "react-router-dom";
import {ArrowLeft, Lock} from "lucide-react";
import {useNafisTheme} from "@/lib/use-nafis-theme.js";

function UnauthPage(){
  useNafisTheme();

  return(
    <div className="theme-nafis relative flex min-h-screen items-center justify-center overflow-hidden bg-ivory px-6">
      <div className="pointer-events-none absolute right-[15%] top-[20%] h-64 w-64 animate-float rounded-full bg-petal/40 blur-3xl"/>
      <div className="relative animate-fade-up text-center">
        <div className="mx-auto grid h-20 w-20 animate-float place-items-center rounded-full bg-blush">
          <Lock className="h-8 w-8 text-rose-deep" strokeWidth={1.4}/>
        </div>
        <h1 className="mt-6 font-display text-4xl font-medium text-espresso">Kirish cheklangan</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-taupe">
          Bu sahifani ko'rish uchun sizda ruxsat yo'q.
        </p>
        <Link
          to="/shop/home"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-espresso px-7 py-4 text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-mocha"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"/>
          Do'konga qaytish
        </Link>
      </div>
    </div>
  )
}
export default UnauthPage;
