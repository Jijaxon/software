import {useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import {CheckCircle2, ImagePlus, Loader2, Megaphone, Send, Users, X} from "lucide-react";
import {Button} from "@/components/ui/button.jsx";
import {Input} from "@/components/ui/input.jsx";
import {Label} from "@/components/ui/label.jsx";
import {Textarea} from "@/components/ui/textarea.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import {fetchBroadcasts, sendBroadcast} from "@/store/admin/marketing-slice/index.js";
import {formatDateTime} from "@/lib/utils";

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe";

// Tayyor shablonlar — admin tez boshlashi uchun
const templates = [
  {
    title: "Chegirma",
    text: "🌸 <b>Faqat 3 kun!</b>\n\nBarcha yuz parvarishi mahsulotlariga <b>20% chegirma</b>.\nPromokod: <code>BAHOR20</code>\n\nShoshiling — mahsulotlar soni cheklangan ⏳",
  },
  {
    title: "Yangi mahsulot",
    text: "✨ <b>Yangi kelgan mahsulotlar!</b>\n\nSevimli brendlaringizdan yangi kolleksiya do'konimizda. Birinchilardan bo'lib tanlang 💛",
  },
  {
    title: "Bepul yetkazish",
    text: "🚚 <b>Bugun — bepul yetkazib berish!</b>\n\nIstalgan summadagi xaridingizni bepul yetkazamiz. Faqat bugun!",
  },
];

// Telegram HTML'ning soddalashtirilgan preview'i
function renderPreview(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/<(\/?)(b|i|u|s|code)>/g, "\u0000$1$2\u0001")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\u0000/g, "<")
    .replace(/\u0001/g, ">")
    .replace(/\n/g, "<br/>");
}

function AdminMarketing() {
  const dispatch = useDispatch();
  const {broadcasts, audience} = useSelector((state) => state.marketing);
  const [message, setMessage] = useState("");
  const [buttonText, setButtonText] = useState("🛍 Xarid qilish");
  const [buttonUrl, setButtonUrl] = useState(`${window.location.origin}/shop/home`);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const hasActive = useMemo(() => broadcasts.some((b) => b.status === "sending"), [broadcasts]);

  useEffect(() => {
    dispatch(fetchBroadcasts());
  }, [dispatch]);

  // Yuborish davom etayotgan bo'lsa progressni yangilab turamiz
  useEffect(() => {
    if (!hasActive) return;
    const timer = setInterval(() => dispatch(fetchBroadcasts()), 3000);
    return () => clearInterval(timer);
  }, [hasActive, dispatch]);

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const limit = image ? 900 : 3800;

  async function handleSend() {
    setSending(true);
    const res = await dispatch(sendBroadcast({message, buttonText, buttonUrl, image}));
    setSending(false);
    setConfirmOpen(false);
    if (res?.payload?.success) {
      toast.success("Yuborish boshlandi!");
      setMessage("");
      setImage(null);
    } else {
      toast.error(res?.payload?.message || "Yuborib bo'lmadi");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-sand bg-gradient-to-br from-white to-cream/60 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso">Telegram marketing</h1>
          <p className="mt-1 text-sm text-taupe">
            Aksiya va yangiliklarni bot obunachilariga yuboring. Buyurtma holati va savat eslatmalari avtomatik ishlaydi.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm">
          <Users className="h-5 w-5 text-rose-deep"/>
          <div>
            <p className="font-display text-2xl font-semibold text-espresso">{audience}</p>
            <p className="text-[11px] text-taupe">obunachi</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5 rounded-3xl border border-sand bg-white p-6 shadow-sm">
          <div>
            <Label className={labelClass}>Tayyor shablonlar</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.title}
                  onClick={() => setMessage(tpl.text)}
                  className="rounded-full border border-sand px-4 py-1.5 text-xs font-medium text-mocha transition-colors hover:border-petal hover:bg-blush/50"
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className={labelClass}>Xabar matni *</Label>
              <span className={`text-[11px] ${message.length > limit ? "text-destructive" : "text-taupe"}`}>{message.length}/{limit}</span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="Xabar matni... <b>qalin</b>, <i>kursiv</i>, <code>PROMOKOD</code> teglarini ishlatish mumkin"
              className="mt-1.5 rounded-2xl border-sand font-mono text-sm"
            />
            <p className="mt-1 text-[11px] text-taupe">Formatlash: &lt;b&gt;qalin&lt;/b&gt;, &lt;i&gt;kursiv&lt;/i&gt;, &lt;code&gt;kod&lt;/code&gt;</p>
          </div>

          <div>
            <Label className={labelClass}>Rasm (ixtiyoriy)</Label>
            {preview ? (
              <div className="relative mt-2 w-fit">
                <img src={preview} alt="" className="h-32 rounded-2xl object-cover"/>
                <button onClick={() => setImage(null)} className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-espresso/80 text-white">
                  <X className="h-3.5 w-3.5"/>
                </button>
              </div>
            ) : (
              <label className="mt-2 flex h-24 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-petal bg-cream/40 text-sm text-taupe transition-colors hover:border-rose">
                <ImagePlus className="h-5 w-5"/> Rasm tanlash
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] || null)}/>
              </label>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className={labelClass}>Tugma matni</Label>
              <Input className="mt-1.5 h-11 rounded-2xl border-sand" value={buttonText} onChange={(e) => setButtonText(e.target.value)}/>
            </div>
            <div>
              <Label className={labelClass}>Tugma havolasi</Label>
              <Input className="mt-1.5 h-11 rounded-2xl border-sand" value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} placeholder="https://..."/>
            </div>
          </div>

          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!message.trim() || message.length > limit || hasActive}
            className="h-12 w-full gap-2 rounded-full bg-espresso text-ivory hover:bg-mocha"
          >
            <Send className="h-4 w-4"/>
            {hasActive ? "Oldingi xabar yuborilmoqda..." : `${audience} obunachiga yuborish`}
          </Button>
        </div>

        {/* Telegram ko'rinishi */}
        <div className="h-fit rounded-3xl bg-[#e7ebf0] p-4 lg:sticky lg:top-24">
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7b8c]">Telegram'da ko'rinishi</p>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {preview ? <img src={preview} alt="" className="max-h-56 w-full object-cover"/> : null}
            <div
              className="whitespace-normal break-words px-4 py-3 text-[14px] leading-snug text-[#0f1419] [&_code]:rounded [&_code]:bg-[#f2f4f6] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[#c7254e]"
              dangerouslySetInnerHTML={{
                __html: message
                  ? `${renderPreview(message)}<br/><br/><i style="color:#8a96a3">Aksiya xabarlarini o'chirish: /stop</i>`
                  : '<span style="color:#9aa5b1">Xabar matni shu yerda ko\'rinadi</span>',
              }}
            />
          </div>
          {buttonText && /^https?:\/\//.test(buttonUrl) ? (
            <div className="mt-1.5 rounded-xl bg-white/70 py-2.5 text-center text-sm font-medium text-[#2481cc]">{buttonText}</div>
          ) : null}
        </div>
      </div>

      {/* Tarix */}
      <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-espresso">
          <Megaphone className="h-5 w-5 text-rose-deep"/> Yuborilgan xabarlar
        </h2>
        {broadcasts.length ? (
          <div className="space-y-3">
            {broadcasts.map((b) => {
              const done = b.status === "done";
              const progress = b.totalCount ? Math.round(((b.sentCount + b.failedCount) / b.totalCount) * 100) : done ? 100 : 0;
              return (
                <div key={b._id} className="rounded-2xl border border-sand p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm text-mocha">{String(b.message).replace(/<[^>]+>/g, "")}</p>
                    <span className="shrink-0 text-[11px] text-taupe">{formatDateTime(b.createdAt)}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
                      <div className={`h-full rounded-full transition-all duration-700 ${done ? "bg-sage" : "bg-rose-deep"}`} style={{width: `${progress}%`}}/>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-mocha">
                      {done ? <CheckCircle2 className="h-3.5 w-3.5 text-sage"/> : <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-deep"/>}
                      {b.sentCount} yuborildi{b.failedCount ? ` · ${b.failedCount} xato` : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-sand py-10 text-center text-sm text-taupe">Hali xabar yuborilmagan</p>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-espresso">Xabarni yuborishni tasdiqlang</DialogTitle>
            <DialogDescription className="text-taupe">
              Xabar {audience} ta obunachiga yuboriladi. Yuborilgandan keyin uni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full border-sand" onClick={() => setConfirmOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleSend} disabled={sending} className="rounded-full bg-espresso text-ivory hover:bg-mocha">
              {sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>} Yuborish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminMarketing;
