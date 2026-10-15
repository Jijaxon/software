import {Link, Outlet, useLocation} from "react-router-dom";
import {ArrowLeft, Sparkles} from "lucide-react";
import {useNafisTheme} from "@/lib/use-nafis-theme.js";

function AuthLayout() {
  const location = useLocation();
  useNafisTheme();

  return (
    <div className="theme-nafis flex min-h-screen w-full bg-ivory">
      <div className="relative hidden w-1/2 overflow-hidden p-4 lg:block">
        <div className="relative h-full overflow-hidden rounded-[32px] bg-mocha">
          <img
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=85"
            alt=""
            className="absolute inset-0 h-full w-full animate-ken-burns object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/25 to-espresso/10"/>
          <div className="pointer-events-none absolute right-12 top-16 h-40 w-40 animate-float rounded-full bg-petal/30 blur-2xl"/>

          <Link to="/shop/home" className="absolute left-10 top-10 flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-petal"/>
            <span className="font-display text-3xl font-semibold tracking-[0.22em]">NAFIS</span>
          </Link>

          <div className="absolute inset-x-10 bottom-12 max-w-md text-white">
            <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.25em] text-blush">
              Go'zallik do'koni
            </p>
            <h1 className="mt-4 animate-fade-up font-display text-5xl font-medium leading-[1.02] [animation-delay:120ms] xl:text-6xl">
              O'zingizga <em className="text-petal">mehr</em> bilan qarang.
            </h1>
            <p className="mt-5 animate-fade-up text-sm leading-6 text-white/75 [animation-delay:240ms]">
              Sevimli brendlaringiz, ishonchli tanlov va nafis xarid tajribasi — bir joyda.
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-5 py-8 sm:px-10">
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-blush blur-3xl lg:hidden"/>
        <div className="relative flex items-center justify-between">
          <Link
            to="/shop/home"
            className="group flex items-center gap-2 text-sm font-medium text-mocha transition-colors hover:text-espresso"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"/>
            Do'konga qaytish
          </Link>
          <Link to="/shop/home" className="flex items-center gap-2 lg:hidden">
            <Sparkles className="h-4 w-4 text-rose"/>
            <span className="font-display text-2xl font-semibold tracking-[0.22em] text-espresso">NAFIS</span>
          </Link>
        </div>
        <div key={location.pathname} className="relative flex flex-1 animate-fade-up items-center justify-center py-10">
          <Outlet/>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
