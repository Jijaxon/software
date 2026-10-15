import {Link} from "react-router-dom";
import {ArrowLeft, Sparkles} from "lucide-react";
import {useNafisTheme} from "@/lib/use-nafis-theme.js";

function NotFound(){
  useNafisTheme();

  return (
    <div className="theme-nafis relative flex min-h-screen items-center justify-center overflow-hidden bg-ivory px-6">
      <div className="pointer-events-none absolute left-[10%] top-[15%] h-72 w-72 animate-float rounded-full bg-petal/40 blur-3xl"/>
      <div className="pointer-events-none absolute bottom-[10%] right-[10%] h-72 w-72 animate-float rounded-full bg-gold/25 blur-3xl [animation-delay:2s]"/>
      <div className="relative animate-fade-up text-center">
        <Sparkles className="mx-auto h-6 w-6 text-rose"/>
        <p className="mt-4 font-display text-[9rem] font-medium leading-none text-espresso md:text-[12rem]">
          4<em className="text-rose-deep">0</em>4
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium text-espresso">Sahifa topilmadi</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-taupe">
          Siz izlagan sahifa mavjud emas yoki boshqa joyga ko'chirilgan.
        </p>
        <Link
          to="/shop/home"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-espresso px-7 py-4 text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-mocha"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"/>
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
export default NotFound;
