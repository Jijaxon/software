import {useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {ArrowLeft, Brush, Droplets, Flower2, Loader2, RotateCcw, Sparkles, Wallet, Wind} from "lucide-react";
import instance from "@/utils/axios.js";
import {Button} from "@/components/ui/button";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import {fetchProductDetails} from "@/store/shop/products-slice";
import {addToCart, fetchCartItems} from "@/store/shop/cart-slice";
import {useT} from "@/i18n/index.jsx";
import {useDocumentTitle} from "@/lib/use-document-title.js";

const STORAGE_KEY = "nafis-quiz";

// Maqsad -> kategoriya slug'i (admin yangi kategoriya qo'shsa ham, mos kelmasa butun katalogdan tanlanadi)
const GOAL_CATEGORY = {skin: "skincare", makeup: "makeup", hair: "haircare", scent: "fragrance"};

// Teri turiga mos kalit so'zlar (nom/tavsifda uchrasa, mahsulot yuqoriroq turadi)
const SKIN_KEYWORDS = {
  dry: ["quruq", "namlov", "nam ", "hyaluron", "gialuron", "moist", "hydra", "увлаж", "сух"],
  oily: ["yog'li", "matt", "oil-free", "niacin", "salicyl", "salitsil", "жирн", "матир"],
  combo: ["aralash", "balans", "balance", "niacin", "комбин"],
  sensitive: ["sezgir", "sensitive", "ceramide", "seramid", "cica", "gentle", "чувств"],
};

const BUDGETS = {
  low: [0, 100000],
  mid: [100000, 300000],
  high: [300000, Infinity],
  any: [0, Infinity],
};

const finalPrice = (p) => Number(p.price || 0) * (1 - Number(p.salePrice || 0) / 100);

function recommend(products, answers) {
  const category = GOAL_CATEGORY[answers.goal];
  const [min, max] = BUDGETS[answers.budget] || BUDGETS.any;
  const keywords = SKIN_KEYWORDS[answers.skin] || [];

  const inStock = products.filter((p) => p.totalStock > 0);
  const byCategory = inStock.filter((p) => p.category === category);
  const pool = byCategory.length ? byCategory : inStock;
  const inBudget = pool.filter((p) => finalPrice(p) >= min && finalPrice(p) < max);
  const candidates = inBudget.length ? inBudget : pool;

  return candidates
    .map((p) => {
      const text = `${p.title} ${p.description}`.toLowerCase();
      const keywordHits = keywords.filter((k) => text.includes(k)).length;
      const score =
        keywordHits * 10 +
        (Number(p.averageReview) || 0) * 2 +
        Math.log1p(p.soldCount || 0) * 3 +
        (p.salePrice > 0 ? 2 : 0);
      return {product: p, score};
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => item.product);
}

function OptionCard({icon: Icon, label, onClick, selected}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-4 rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blush/50 ${
        selected ? "border-rose-deep bg-blush/60" : "border-sand bg-white hover:border-petal"
      }`}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream text-rose-deep transition-transform duration-500 group-hover:rotate-12">
        <Icon className="h-5 w-5" strokeWidth={1.6}/>
      </span>
      <span className="font-display text-xl font-medium text-espresso">{label}</span>
    </button>
  );
}

function ShoppingQuiz() {
  const {t} = useT();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {user} = useSelector((state) => state.auth);
  const {productDetails} = useSelector((state) => state.shopProducts);
  const [answers, setAnswers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });
  const [step, setStep] = useState(() => (answers.budget ? 3 : 0));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  useDocumentTitle(t("quiz.title"));

  // Teri turi savoli faqat teri/makiyaj uchun ma'noli
  const questions = useMemo(() => {
    const list = [
      {
        key: "goal",
        title: t("quiz.goal"),
        options: [
          {id: "skin", label: t("quiz.goal.skin"), icon: Droplets},
          {id: "makeup", label: t("quiz.goal.makeup"), icon: Brush},
          {id: "hair", label: t("quiz.goal.hair"), icon: Wind},
          {id: "scent", label: t("quiz.goal.scent"), icon: Flower2},
        ],
      },
    ];
    if (!answers.goal || answers.goal === "skin" || answers.goal === "makeup") {
      list.push({
        key: "skin",
        title: t("quiz.skin"),
        options: [
          {id: "dry", label: t("quiz.skin.dry"), icon: Droplets},
          {id: "oily", label: t("quiz.skin.oily"), icon: Sparkles},
          {id: "combo", label: t("quiz.skin.combo"), icon: Flower2},
          {id: "sensitive", label: t("quiz.skin.sensitive"), icon: Wind},
        ],
      });
    }
    list.push({
      key: "budget",
      title: t("quiz.budget"),
      options: [
        {id: "low", label: t("quiz.budget.low"), icon: Wallet},
        {id: "mid", label: t("quiz.budget.mid"), icon: Wallet},
        {id: "high", label: t("quiz.budget.high"), icon: Wallet},
        {id: "any", label: t("quiz.budget.any"), icon: Sparkles},
      ],
    });
    return list;
  }, [answers.goal, t]);

  const isDone = step >= questions.length;

  useEffect(() => {
    if (!isDone || products.length) return;
    setLoading(true);
    instance
      .get("/shop/products/get", {params: {sortBy: "popular"}})
      .then(({data}) => setProducts(data?.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [isDone, products.length]);

  useEffect(() => {
    if (productDetails !== null && isDone) setOpenDetails(true);
  }, [productDetails]);

  function choose(key, value) {
    const next = {...answers, [key]: value};
    if (key === "goal" && !(value === "skin" || value === "makeup")) delete next.skin;
    setAnswers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setStep((s) => s + 1);
  }

  function restart() {
    setAnswers({});
    localStorage.removeItem(STORAGE_KEY);
    setStep(0);
  }

  function handleAddtoCart(productId) {
    dispatch(addToCart({userId: user?.id, productId, quantity: 1})).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast.success(t("toast.addedToCart"));
      }
    });
  }

  const results = isDone ? recommend(products, answers) : [];
  const question = questions[Math.min(step, questions.length - 1)];

  return (
    <div className="bg-ivory pb-24">
      <section className="relative overflow-hidden border-b border-sand bg-cream">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 animate-float rounded-full bg-petal/40 blur-3xl"/>
        <div className="relative mx-auto max-w-4xl px-5 py-14 text-center md:py-16">
          <p className="flex animate-fade-up items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-deep">
            <Sparkles className="h-3.5 w-3.5"/> {t("quiz.eyebrow")}
          </p>
          <h1 className="mt-3 animate-fade-up font-display text-4xl font-medium text-espresso [animation-delay:100ms] md:text-6xl">
            {isDone ? t("quiz.resultTitle") : t("quiz.title")}
          </h1>
          {!isDone ? (
            <div className="mx-auto mt-8 flex max-w-xs gap-2">
              {questions.map((q, index) => (
                <span
                  key={q.key}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${index <= step ? "bg-rose-deep" : "bg-sand"}`}
                />
              ))}
            </div>
          ) : (
            <p className="mx-auto mt-3 max-w-md text-sm text-mocha/80">{t("quiz.resultText")}</p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 pt-12 md:px-10">
        {!isDone ? (
          <div key={question.key} className="animate-fade-up">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-taupe">
              {t("quiz.step", {current: step + 1, total: questions.length})}
            </p>
            <h2 className="mt-2 text-center font-display text-3xl font-medium text-espresso md:text-4xl">{question.title}</h2>
            <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
              {question.options.map((option) => (
                <OptionCard
                  key={option.id}
                  icon={option.icon}
                  label={option.label}
                  selected={answers[question.key] === option.id}
                  onClick={() => choose(question.key, option.id)}
                />
              ))}
            </div>
            {step > 0 ? (
              <div className="mt-8 text-center">
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="rounded-full text-mocha hover:bg-blush/50">
                  <ArrowLeft className="h-4 w-4"/> {t("quiz.back")}
                </Button>
              </div>
            ) : null}
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20 text-rose">
            <Loader2 className="h-6 w-6 animate-spin"/>
          </div>
        ) : (
          <div className="animate-fade-up">
            {results.length ? (
              <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((product) => (
                  <ShoppingProductTile
                    key={product._id}
                    product={product}
                    handleGetProductDetails={(id) => dispatch(fetchProductDetails(id))}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-3xl border border-dashed border-sand py-14 text-center text-sm text-taupe">
                {t("quiz.noResults")}
              </p>
            )}
            <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="outline" onClick={restart} className="h-12 rounded-full border-sand px-7 hover:bg-blush">
                <RotateCcw className="h-4 w-4"/> {t("quiz.restart")}
              </Button>
              <Button onClick={() => navigate("/shop/listing")} className="h-12 rounded-full bg-espresso px-7 text-ivory hover:bg-mocha">
                {t("home.allProducts")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <ProductDetailsDialog open={openDetails} setOpen={setOpenDetails} productDetails={productDetails}/>
    </div>
  );
}

export default ShoppingQuiz;
