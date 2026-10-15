import { useNavigate } from "react-router-dom";
import { ArrowRight, Flower2, Heart, Send, ShieldCheck, Sparkles } from "lucide-react";
import Reveal from "@/components/common/reveal.jsx";

const values = [
  {
    icon: ShieldCheck,
    title: "Ishonch",
    text: "Faqat original mahsulotlar va o'zini oqlagan brendlar.",
  },
  {
    icon: Flower2,
    title: "Nafislik",
    text: "Har bir tanlov teringiz va kayfiyatingiz uchun puxta o'ylangan.",
  },
  {
    icon: Heart,
    title: "Mehr",
    text: "Go'zallik — o'zingizga g'amxo'rlik qilishning eng yoqimli shakli.",
  },
];

const brandNames = ["CeraVe", "The Ordinary", "L'Oréal Paris", "Maybelline", "Dior", "Fenty Beauty"];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-ivory">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 animate-float rounded-full bg-petal/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 animate-float rounded-full bg-gold/20 blur-3xl [animation-delay:3s]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-2">
          <div>
            <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">Biz haqimizda</p>
            <h1 className="mt-4 animate-fade-up font-display text-6xl font-medium leading-[0.95] text-espresso [animation-delay:100ms] md:text-7xl">
              <span className="tracking-[0.12em]">NAFIS</span> — <em className="text-rose-deep">go'zallik</em> manzili
            </h1>
            <p className="mt-7 max-w-lg animate-fade-up text-base leading-8 text-mocha/85 [animation-delay:200ms]">
              Go'zallik va o'ziga mehr bilan qarash uchun tanlangan manzil. Biz yuz va soch parvarishi, makiyaj
              hamda atirlar bo'yicha kundalik ehtiyojingizga mos mahsulotlarni jamlaymiz.
            </p>
            <button
              onClick={() => navigate("/shop/listing")}
              className="group mt-9 inline-flex animate-fade-up items-center gap-2 rounded-full bg-espresso px-7 py-4 text-sm font-semibold text-ivory transition-all duration-300 [animation-delay:300ms] hover:-translate-y-0.5 hover:bg-mocha hover:shadow-lg hover:shadow-mocha/25"
            >
              Mahsulotlarni ko'rish
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
          <div className="relative animate-fade-up [animation-delay:200ms]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] bg-cream">
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80"
                alt="Kosmetika mahsulotlari"
                className="h-full w-full animate-ken-burns object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden animate-float rounded-3xl bg-white p-5 shadow-2xl shadow-mocha/15 md:block">
              <Sparkles className="h-5 w-5 text-rose" />
              <p className="mt-2 font-display text-3xl font-semibold text-espresso">6+</p>
              <p className="text-xs text-taupe">sevimli brendlar</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-sand bg-cream py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">Qadriyatlarimiz</p>
            <h2 className="mt-3 font-display text-4xl font-medium text-espresso md:text-5xl">Biz nimaga ishonamiz</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {values.map((item, index) => (
              <Reveal key={item.title} delay={index * 120}>
                <div className="group h-full rounded-3xl border border-sand bg-white p-8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-rose/10">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-blush text-rose-deep transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-110">
                    <item.icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-espresso">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-mocha/80">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
        <Reveal className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">Brendlar</p>
            <h2 className="mt-3 font-display text-4xl font-medium text-espresso">Sevimli nomlar bir joyda</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-mocha/80">
              NAFIS'da xarid qilish sodda: kerakli mahsulotni tanlang, savatga qo'shing va buyurtmani rasmiylashtiring.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {brandNames.map((brand) => (
              <span
                key={brand}
                className="rounded-full border border-sand bg-white px-6 py-3 font-display text-xl text-mocha transition-all duration-300 hover:-translate-y-0.5 hover:border-petal hover:text-rose-deep"
              >
                {brand}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="px-3 pb-20 md:px-6">
        <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-espresso px-6 py-16 text-center text-ivory md:py-20">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.25em] text-petal">Aloqa</p>
          <h2 className="relative mt-3 font-display text-4xl font-medium md:text-5xl">Savollaringiz bormi?</h2>
          <p className="relative mx-auto mt-4 max-w-md text-sm leading-6 text-ivory/70">
            Telegram orqali bog'laning — mahsulot tanlashda mamnuniyat bilan yordam beramiz.
          </p>
          <a
            href="https://t.me/moonlightt5"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative mt-8 inline-flex items-center gap-2 rounded-full bg-ivory px-7 py-4 text-sm font-semibold text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-black/20"
          >
            <Send className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:translate-x-0.5" />
            Telegram'da yozish
          </a>
        </Reveal>
      </section>
    </div>
  );
};

export default About;
