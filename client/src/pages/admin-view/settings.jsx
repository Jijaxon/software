import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import {Flame, Gift, Loader2, PackageMinus, Save, ShoppingCart, Truck} from "lucide-react";
import {Button} from "@/components/ui/button.jsx";
import {Input} from "@/components/ui/input.jsx";
import {Label} from "@/components/ui/label.jsx";
import {fetchAdminSettings, saveAdminSettings} from "@/store/admin/marketing-slice/index.js";
import {formatPrice, fromDateTimeLocal, toDateTimeLocal} from "@/lib/utils";

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe";
const inputClass = "mt-1.5 h-11 rounded-2xl border-sand";

function Section({icon: Icon, title, description, children}) {
  return (
    <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blush/60 text-rose-deep">
          <Icon className="h-5 w-5"/>
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-espresso">{title}</h2>
          <p className="text-sm text-taupe">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({checked, onChange, label}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 rounded-full border border-sand px-4 py-2.5 transition-colors hover:bg-cream"
    >
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-sage" : "bg-taupe/40"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`}/>
      </span>
      <span className="text-sm text-mocha">{label}</span>
    </button>
  );
}

function AdminSettings() {
  const dispatch = useDispatch();
  const {settings} = useSelector((state) => state.marketing);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminSettings());
  }, [dispatch]);

  useEffect(() => {
    if (!settings) return;
    setForm({
      ...settings,
      flash_sale: {
        ...settings.flash_sale,
        endsAt: toDateTimeLocal(settings.flash_sale?.endsAt),
      },
    });
  }, [settings]);

  if (!form) {
    return <div className="flex justify-center py-20 text-rose"><Loader2 className="h-6 w-6 animate-spin"/></div>;
  }

  const set = (key, value) => setForm((prev) => ({...prev, [key]: value}));
  const setFlash = (key, value) => setForm((prev) => ({...prev, flash_sale: {...prev.flash_sale, [key]: value}}));

  async function handleSave() {
    if (form.flash_sale.enabled && (!form.flash_sale.title || !form.flash_sale.endsAt)) {
      toast.error("Flash-sale uchun sarlavha va tugash vaqtini kiriting");
      return;
    }
    setSaving(true);
    const res = await dispatch(saveAdminSettings({
      ...form,
      flash_sale: {...form.flash_sale, endsAt: fromDateTimeLocal(form.flash_sale.endsAt)},
    }));
    setSaving(false);
    if (res?.payload?.success) toast.success("Sozlamalar saqlandi");
    else toast.error(res?.payload?.message || "Saqlab bo'lmadi");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-sand bg-gradient-to-br from-white to-cream/60 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso">Sozlamalar</h1>
          <p className="mt-1 text-sm text-taupe">Yetkazib berish, bonuslar va avtomatik marketing qoidalari</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-11 gap-2 rounded-full bg-espresso px-6 text-ivory hover:bg-mocha">
          {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>} Saqlash
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section icon={Truck} title="Yetkazib berish" description="Chegara summasidan oshgan xaridlarga yetkazish bepul — o'rtacha chekni oshiradi.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className={labelClass}>Yetkazish narxi (so'm)</Label>
              <Input type="number" min="0" className={inputClass} value={form.delivery_fee}
                onChange={(e) => set("delivery_fee", e.target.value)}/>
            </div>
            <div>
              <Label className={labelClass}>Bepul yetkazish chegarasi</Label>
              <Input type="number" min="0" className={inputClass} value={form.free_delivery_threshold}
                onChange={(e) => set("free_delivery_threshold", e.target.value)}/>
            </div>
          </div>
          <p className="mt-3 text-xs text-taupe">
            {Number(form.free_delivery_threshold) > 0
              ? `${formatPrice(form.free_delivery_threshold)}dan ortiq xaridda yetkazish bepul. 0 — doim pullik.`
              : "Bepul yetkazish o'chirilgan."}
          </p>
        </Section>

        <Section icon={Gift} title="Referal dasturi" description="Do'stini taklif qilgan va taklif qilingan mijozga birinchi xariddan so'ng beriladigan bonus.">
          <Label className={labelClass}>Bonus miqdori (so'm)</Label>
          <Input type="number" min="0" className={inputClass} value={form.referral_bonus}
            onChange={(e) => set("referral_bonus", e.target.value)}/>
          <p className="mt-3 text-xs text-taupe">Bonus keyingi xaridda chegirma sifatida ishlatiladi. 0 — dastur o'chirilgan.</p>
        </Section>

        <Section icon={ShoppingCart} title="Tashlab ketilgan savat" description="Savatini qoldirib ketgan mijozga Telegram'da eslatma va shaxsiy promokod yuboriladi.">
          <Toggle checked={Boolean(form.abandoned_cart_enabled)} onChange={(v) => set("abandoned_cart_enabled", v)} label="Eslatmalar yoqilgan"/>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label className={labelClass}>Necha soatdan keyin</Label>
              <Input type="number" min="1" className={inputClass} value={form.abandoned_cart_hours}
                onChange={(e) => set("abandoned_cart_hours", e.target.value)}/>
            </div>
            <div>
              <Label className={labelClass}>Chegirma (%)</Label>
              <Input type="number" min="0" max="50" className={inputClass} value={form.abandoned_cart_discount}
                onChange={(e) => set("abandoned_cart_discount", e.target.value)}/>
            </div>
          </div>
          <p className="mt-3 text-xs text-taupe">Shaxsiy promokod 24 soat amal qiladi va bir marta ishlatiladi. 0% — faqat eslatma.</p>
        </Section>

        <Section icon={PackageMinus} title="Kam qolgan mahsulot" description="Ombordagi soni shu chegaradan kam bo'lsa, saytda «Faqat N ta qoldi» belgisi chiqadi.">
          <Label className={labelClass}>Chegara (dona)</Label>
          <Input type="number" min="1" className={inputClass} value={form.low_stock_threshold}
            onChange={(e) => set("low_stock_threshold", e.target.value)}/>
        </Section>

        <div className="lg:col-span-2">
          <Section icon={Flame} title="Flash-sale lentasi" description="Sayt tepasida taymer bilan aksiya lentasi — impuls xaridni oshiradi.">
            <Toggle checked={Boolean(form.flash_sale.enabled)} onChange={(v) => setFlash("enabled", v)} label="Lenta ko'rsatilsin"/>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <Label className={labelClass}>Sarlavha</Label>
                <Input className={inputClass} value={form.flash_sale.title || ""} maxLength={120}
                  onChange={(e) => setFlash("title", e.target.value)} placeholder="Katta kuzgi aksiya — 30% gacha!"/>
              </div>
              <div>
                <Label className={labelClass}>Qo'shimcha matn</Label>
                <Input className={inputClass} value={form.flash_sale.subtitle || ""} maxLength={200}
                  onChange={(e) => setFlash("subtitle", e.target.value)} placeholder="Promokod: KUZ30"/>
              </div>
              <div>
                <Label className={labelClass}>Tugash vaqti</Label>
                <Input type="datetime-local" className={inputClass} value={form.flash_sale.endsAt || ""}
                  onChange={(e) => setFlash("endsAt", e.target.value)}/>
              </div>
            </div>
            <p className="mt-3 text-xs text-taupe">Vaqt tugagach lenta avtomatik yo'qoladi. Mahsulotlarning o'z chegirma taymerini mahsulot formasida belgilang.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
