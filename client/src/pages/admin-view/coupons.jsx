import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import {Copy, Loader2, Pencil, Plus, TicketPercent, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button.jsx";
import {Input} from "@/components/ui/input.jsx";
import {Label} from "@/components/ui/label.jsx";
import {Badge} from "@/components/ui/badge.jsx";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle} from "@/components/ui/sheet.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import {createCoupon, deleteCoupon, fetchCoupons, updateCoupon} from "@/store/admin/marketing-slice/index.js";
import {formatDateTime, formatPrice, fromDateTimeLocal, toDateTimeLocal} from "@/lib/utils";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percent",
  discountValue: "",
  minOrder: "",
  maxUses: "",
  perUserLimit: "1",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe";
const inputClass = "mt-1.5 h-11 rounded-2xl border-sand";

function couponState(coupon) {
  const now = new Date();
  if (!coupon.isActive) return {label: "Nofaol", className: "bg-taupe/80"};
  if (coupon.expiresAt && new Date(coupon.expiresAt) <= now) return {label: "Muddati tugagan", className: "bg-taupe/80"};
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return {label: "Rejalashtirilgan", className: "bg-gold"};
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return {label: "Limit tugagan", className: "bg-taupe/80"};
  return {label: "Faol", className: "bg-sage/90"};
}

function AdminCoupons() {
  const dispatch = useDispatch();
  const {coupons, isLoading} = useSelector((state) => state.marketing);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  }

  function openEdit(coupon) {
    setEditId(coupon._id);
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrder: coupon.minOrder ? String(coupon.minOrder) : "",
      maxUses: coupon.maxUses ?? "",
      perUserLimit: String(coupon.perUserLimit ?? 1),
      startsAt: toDateTimeLocal(coupon.startsAt),
      expiresAt: toDateTimeLocal(coupon.expiresAt),
      isActive: coupon.isActive,
    });
    setSheetOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.code.trim() || !Number(form.discountValue)) {
      toast.error("Promokod va chegirma qiymatini kiriting");
      return;
    }
    setSaving(true);
    const body = {
      ...form,
      startsAt: fromDateTimeLocal(form.startsAt),
      expiresAt: fromDateTimeLocal(form.expiresAt),
    };
    const res = await dispatch(editId ? updateCoupon({id: editId, ...body}) : createCoupon(body));
    setSaving(false);
    if (res?.payload?.success) {
      toast.success(editId ? "Promokod yangilandi" : "Promokod yaratildi");
      setSheetOpen(false);
    } else {
      toast.error(res?.payload?.message || "Xatolik yuz berdi");
    }
  }

  async function toggleActive(coupon) {
    const res = await dispatch(updateCoupon({id: coupon._id, isActive: !coupon.isActive}));
    if (!res?.payload?.success) toast.error(res?.payload?.message || "Xatolik");
  }

  async function confirmDelete() {
    const res = await dispatch(deleteCoupon(deleteTarget._id));
    if (res?.payload?.success) toast.success("O'chirildi");
    setDeleteTarget(null);
  }

  async function copyCode(code) {
    await navigator.clipboard?.writeText(code).catch(() => {});
    toast.success(`${code} nusxalandi`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-sand bg-gradient-to-br from-white to-cream/60 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso">Promokodlar</h1>
          <p className="mt-1 text-sm text-taupe">
            Aksiya kodlarini yarating — mijozlar chekout sahifasida kiritadi. Tashlab ketilgan savat uchun shaxsiy kodlar avtomatik yaratiladi.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-11 gap-2 rounded-full bg-espresso px-5 text-ivory transition-all hover:-translate-y-0.5 hover:bg-mocha"
        >
          <Plus className="h-4 w-4"/> Yangi promokod
        </Button>
      </div>

      {isLoading && !coupons.length ? (
        <div className="flex justify-center py-16 text-rose"><Loader2 className="h-6 w-6 animate-spin"/></div>
      ) : !coupons.length ? (
        <div className="rounded-3xl border border-dashed border-petal bg-white/70 py-16 text-center">
          <TicketPercent className="mx-auto h-10 w-10 text-petal"/>
          <p className="mt-3 text-taupe">Hali promokod yo'q</p>
          <Button variant="link" onClick={openCreate} className="text-rose-deep">Birinchisini yarating</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coupons.map((coupon) => {
            const state = couponState(coupon);
            return (
              <div key={coupon._id} className="relative overflow-hidden rounded-3xl border border-sand bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blush/40">
                {/* chipta kesigi bezagi */}
                <span className="absolute -left-3 top-16 h-6 w-6 rounded-full bg-ivory"/>
                <span className="absolute -right-3 top-16 h-6 w-6 rounded-full bg-ivory"/>
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => copyCode(coupon.code)} className="group flex items-center gap-2 text-left">
                    <span className="font-display text-2xl font-semibold tracking-[0.15em] text-espresso">{coupon.code}</span>
                    <Copy className="h-3.5 w-3.5 text-taupe opacity-0 transition-opacity group-hover:opacity-100"/>
                  </button>
                  <Badge className={`border-0 text-white ${state.className}`}>{state.label}</Badge>
                </div>
                <p className="mt-1 font-display text-3xl font-semibold text-rose-deep">
                  {coupon.discountType === "percent" ? `−${coupon.discountValue}%` : `−${formatPrice(coupon.discountValue)}`}
                </p>
                <div className="my-4 border-t border-dashed border-sand"/>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <dt className="text-taupe">Ishlatilgan</dt>
                  <dd className="text-right font-semibold text-espresso">{coupon.usedCount}{coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}</dd>
                  <dt className="text-taupe">Berilgan chegirma</dt>
                  <dd className="text-right font-semibold text-espresso">{formatPrice(coupon.totalDiscount)}</dd>
                  {coupon.minOrder > 0 ? (<>
                    <dt className="text-taupe">Min. xarid</dt>
                    <dd className="text-right text-espresso">{formatPrice(coupon.minOrder)}</dd>
                  </>) : null}
                  <dt className="text-taupe">Tugaydi</dt>
                  <dd className="text-right text-espresso">{coupon.expiresAt ? formatDateTime(coupon.expiresAt) : "Muddatsiz"}</dd>
                </dl>
                {coupon.description ? <p className="mt-3 line-clamp-2 text-xs text-mocha">{coupon.description}</p> : null}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => openEdit(coupon)} className="h-9 flex-1 gap-1.5 rounded-full border-sand text-mocha hover:bg-cream">
                    <Pencil className="h-3.5 w-3.5"/> Tahrir
                  </Button>
                  <Button variant="outline" onClick={() => toggleActive(coupon)} className="h-9 rounded-full border-sand text-xs text-mocha hover:bg-cream">
                    {coupon.isActive ? "O'chirish" : "Yoqish"}
                  </Button>
                  <Button variant="outline" onClick={() => setDeleteTarget(coupon)} className="h-9 rounded-full border-petal text-rose-deep hover:bg-blush/50">
                    <Trash2 className="h-3.5 w-3.5"/>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full overflow-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl text-espresso">{editId ? "Promokodni tahrirlash" : "Yangi promokod"}</SheetTitle>
            <SheetDescription className="text-taupe">Kod lotin harf va raqamlardan iborat bo'ladi (masalan, BAHOR20).</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5 px-4 pb-6">
            <div>
              <Label className={labelClass}>Promokod *</Label>
              <Input
                className={`${inputClass} uppercase tracking-widest`}
                value={form.code}
                disabled={Boolean(editId)}
                onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})}
                placeholder="BAHOR20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={labelClass}>Turi</Label>
                <div className="mt-1.5 flex rounded-2xl border border-sand p-1">
                  {[["percent", "Foiz %"], ["fixed", "So'm"]].map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setForm({...form, discountType: value})}
                      className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${form.discountType === value ? "bg-espresso text-ivory" : "text-mocha hover:bg-cream"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className={labelClass}>Qiymati *</Label>
                <Input type="number" min="1" className={inputClass} value={form.discountValue}
                  onChange={(e) => setForm({...form, discountValue: e.target.value})}
                  placeholder={form.discountType === "percent" ? "20" : "30000"}/>
              </div>
            </div>
            <div>
              <Label className={labelClass}>Minimal xarid summasi (so'm)</Label>
              <Input type="number" min="0" className={inputClass} value={form.minOrder}
                onChange={(e) => setForm({...form, minOrder: e.target.value})} placeholder="0 — cheklovsiz"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={labelClass}>Umumiy limit</Label>
                <Input type="number" min="1" className={inputClass} value={form.maxUses}
                  onChange={(e) => setForm({...form, maxUses: e.target.value})} placeholder="Cheksiz"/>
              </div>
              <div>
                <Label className={labelClass}>Har bir mijozga</Label>
                <Input type="number" min="1" className={inputClass} value={form.perUserLimit}
                  onChange={(e) => setForm({...form, perUserLimit: e.target.value})}/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={labelClass}>Boshlanishi</Label>
                <Input type="datetime-local" className={inputClass} value={form.startsAt}
                  onChange={(e) => setForm({...form, startsAt: e.target.value})}/>
              </div>
              <div>
                <Label className={labelClass}>Tugashi</Label>
                <Input type="datetime-local" className={inputClass} value={form.expiresAt}
                  onChange={(e) => setForm({...form, expiresAt: e.target.value})}/>
              </div>
            </div>
            <div>
              <Label className={labelClass}>Izoh (ichki)</Label>
              <Input className={inputClass} value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Masalan, Instagram bloger aksiyasi"/>
            </div>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-sand px-4 py-3">
              <span className="text-sm text-mocha">Faol</span>
              <input type="checkbox" className="h-5 w-5 accent-rose-deep" checked={form.isActive}
                onChange={(e) => setForm({...form, isActive: e.target.checked})}/>
            </label>
            <Button type="submit" disabled={saving} className="h-12 w-full rounded-full bg-espresso text-ivory hover:bg-mocha">
              {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : editId ? "Saqlash" : "Yaratish"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-espresso">Promokodni o'chirish</DialogTitle>
            <DialogDescription className="text-taupe">
              "{deleteTarget?.code}" o'chirilsinmi? Foydalanish tarixi ham o'chadi. Vaqtincha to'xtatish uchun "O'chirish" (nofaol) tugmasidan foydalaning.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full border-sand" onClick={() => setDeleteTarget(null)}>Bekor qilish</Button>
            <Button variant="destructive" className="rounded-full" onClick={confirmDelete}>O'chirish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminCoupons;
