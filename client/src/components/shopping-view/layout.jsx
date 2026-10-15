import {Outlet, useLocation} from "react-router-dom";
import {useEffect} from "react";
import ShoppingHeader from "@/components/shopping-view/header.jsx";
import ShoppingFooter from "@/components/shopping-view/footer.jsx";
import {useNafisTheme} from "@/lib/use-nafis-theme.js";

function ShoppingLayout() {
  const location = useLocation();
  useNafisTheme();

  useEffect(() => {
    window.scrollTo({top: 0, behavior: "smooth"});
  }, [location.pathname]);

  return (
    <div className="theme-nafis flex min-h-screen flex-col overflow-x-clip bg-ivory">
      <ShoppingHeader/>
      <main key={location.pathname} className="flex w-full flex-1 flex-col animate-fade-in">
        <Outlet/>
      </main>
      <ShoppingFooter/>
    </div>
  );
}

export default ShoppingLayout;
