import {Link, useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {Instagram, Send, Sparkles} from "lucide-react";
import {categoryOptionsMap} from "@/config";

function ShoppingFooter() {
  const navigate = useNavigate();
  const {categories} = useSelector((state) => state.taxonomy);

  // Bazadan kelgan bo'limlar; bo'sh bo'lsa config'dagi standart ro'yxat
  const footerCategories = categories?.length
    ? categories.map((c) => ({id: c.slug, label: c.name}))
    : Object.entries(categoryOptionsMap).map(([id, label]) => ({id, label}));

  function handleCategory(categoryId) {
    sessionStorage.setItem("filters", JSON.stringify({category: [categoryId]}));
    navigate(`/shop/listing?category=${categoryId}`);
  }

  return (
    <footer className="relative mt-auto overflow-hidden bg-espresso text-ivory">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose/20 blur-3xl"/>
      <div className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl"/>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10">
        <div>
          <Link to="/shop/home" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-petal"/>
            <span className="font-display text-3xl font-semibold tracking-[0.2em]">NAFIS</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-ivory/65">
            Har kungi go'zallik marosimingiz uchun sevimli brendlarning ishonchli mahsulotlari — bir joyda.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="https://t.me/moonlightt5"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="grid h-10 w-10 place-items-center rounded-full border border-ivory/15 transition-all duration-300 hover:-translate-y-0.5 hover:border-petal hover:bg-petal hover:text-espresso"
            >
              <Send className="h-4 w-4"/>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid h-10 w-10 place-items-center rounded-full border border-ivory/15 transition-all duration-300 hover:-translate-y-0.5 hover:border-petal hover:bg-petal hover:text-espresso"
            >
              <Instagram className="h-4 w-4"/>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-petal">Bo'limlar</h4>
          <ul className="mt-5 space-y-3 text-sm text-ivory/70">
            {footerCategories.map(({id, label}) => (
              <li key={id}>
                <button onClick={() => handleCategory(id)} className="transition-colors hover:text-ivory">
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-petal">NAFIS</h4>
          <ul className="mt-5 space-y-3 text-sm text-ivory/70">
            <li><Link to="/shop/about" className="transition-colors hover:text-ivory">Biz haqimizda</Link></li>
            <li><Link to="/shop/search" className="transition-colors hover:text-ivory">Qidiruv</Link></li>
            <li><Link to="/shop/account" className="transition-colors hover:text-ivory">Buyurtmalarim</Link></li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-ivory/45 md:flex-row md:px-10">
          <span>© {new Date().getFullYear()} NAFIS. Barcha huquqlar himoyalangan.</span>
          <span>Go'zallik — o'zingizga mehr bilan qarashdan boshlanadi.</span>
        </div>
      </div>
    </footer>
  );
}

export default ShoppingFooter;
