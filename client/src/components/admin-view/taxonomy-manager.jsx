import {useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import {ImagePlus, Loader2, Pencil, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button.jsx";
import {Input} from "@/components/ui/input.jsx";
import {Label} from "@/components/ui/label.jsx";
import {Textarea} from "@/components/ui/textarea.jsx";
import {Badge} from "@/components/ui/badge.jsx";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription} from "@/components/ui/sheet.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog.jsx";
import {addTaxonomy, deleteTaxonomy, fetchTaxonomy, updateTaxonomy} from "@/store/admin/taxonomy-slice/index.js";
import instance from "@/utils/axios.js";

const emptyForm = {name: "", slug: "", description: "", sortOrder: "", isActive: true};

function TaxonomyManager({type, title, subtitle, emptyLabel}) {
  const dispatch = useDispatch();
  const {categories, brands, isLoading} = useSelector((state) => state.taxonomy);
  const items = type === "brand" ? brands : categories;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchTaxonomy({type}));
  }, [dispatch, type]);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const sorted = useMemo(
    () => [...(items || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [items]
  );

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setImageFile(null);
    setPreviewUrl("");
    setSheetOpen(true);
  }

  function openEdit(item) {
    setEditId(item._id);
    setForm({
      name: item.name || "",
      slug: item.slug || "",
      description: item.description || "",
      sortOrder: item.sortOrder ?? "",
      isActive: item.isActive ?? true,
    });
    setImageFile(null);
    setPreviewUrl(item.image ? instance.defaults.baseURL + item.image : "");
    setSheetOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nom kiritilishi shart");
      return;
    }
    setSaving(true);
    const payload = {
      type,
      formData: {
        name: form.name,
        slug: form.slug,
        description: form.description,
        sortOrder: form.sortOrder === "" ? 0 : form.sortOrder,
        isActive: form.isActive,
      },
      image: imageFile || undefined,
    };

    const action = editId
      ? updateTaxonomy({...payload, id: editId})
      : addTaxonomy(payload);

    const res = await dispatch(action);
    setSaving(false);

    if (res?.payload?.success) {
      toast.success(editId ? "Yangilandi" : "Qo'shildi");
      setSheetOpen(false);
    } else {
      toast.error(res?.payload?.message || "Xatolik yuz berdi");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await dispatch(deleteTaxonomy({type, id: deleteTarget._id}));
    if (res?.payload?.success) toast.success("O'chirildi");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-sand bg-gradient-to-br from-white to-cream/60 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso">{title}</h1>
          <p className="mt-1 text-sm text-taupe">{subtitle}</p>
        </div>
        <Button
          onClick={openCreate}
          className="h-11 gap-2 rounded-full bg-espresso px-5 text-ivory transition-all hover:-translate-y-0.5 hover:bg-mocha"
        >
          <Plus className="h-4 w-4"/> Yangi qo'shish
        </Button>
      </div>

      {/* List */}
      {isLoading && sorted.length === 0 ? (
        <div className="flex justify-center py-16 text-rose">
          <Loader2 className="h-6 w-6 animate-spin"/>
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-petal bg-white/70 py-16 text-center">
          <p className="text-taupe">{emptyLabel || "Hozircha ma'lumot yo'q"}</p>
          <Button variant="link" onClick={openCreate} className="text-rose-deep">
            Birinchisini qo'shing
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((item) => (
            <div
              key={item._id}
              className="group relative overflow-hidden rounded-3xl border border-sand bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blush/40"
            >
              <div className="relative h-36 w-full overflow-hidden bg-cream">
                {item.image ? (
                  <img
                    src={instance.defaults.baseURL + item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-petal">
                    <ImagePlus className="h-8 w-8"/>
                  </div>
                )}
                <div className="absolute right-3 top-3">
                  <Badge
                    className={
                      item.isActive
                        ? "border-0 bg-sage/90 text-white"
                        : "border-0 bg-taupe/80 text-white"
                    }
                  >
                    {item.isActive ? "Faol" : "Nofaol"}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-semibold text-espresso">{item.name}</h3>
                    <p className="truncate text-xs text-taupe">/{item.slug}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-blush/60 px-2 py-0.5 text-[11px] font-semibold text-rose-deep">
                    #{item.sortOrder ?? 0}
                  </span>
                </div>
                {item.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-mocha">{item.description}</p>
                ) : null}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="h-9 flex-1 gap-1.5 rounded-full border-sand text-mocha hover:bg-cream"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5"/> Tahrir
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 gap-1.5 rounded-full border-petal text-rose-deep hover:bg-blush/50"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5"/>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full overflow-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl text-espresso">
              {editId ? "Tahrirlash" : "Yangi qo'shish"}
            </SheetTitle>
            <SheetDescription className="text-taupe">
              Rasm, nom va tartibni belgilang. Slug bo'sh qolsa, nomdan avtomatik yaratiladi.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 px-4 pb-6">
            {/* Image */}
            <div>
              <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">Rasm</Label>
              <label
                htmlFor="taxonomy-image"
                className="mt-2 flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-petal bg-cream/50 transition-colors hover:border-rose"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="h-full w-full object-cover"/>
                ) : (
                  <div className="flex flex-col items-center text-taupe">
                    <ImagePlus className="mb-1 h-7 w-7"/>
                    <span className="text-xs">Rasm tanlang</span>
                  </div>
                )}
              </label>
              <Input
                id="taxonomy-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">Nomi *</Label>
              <Input
                className="mt-1.5 h-11 rounded-2xl border-sand"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="Masalan, Yuz parvarishi"
              />
            </div>

            <div>
              <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">
                Slug {editId ? "" : "(ixtiyoriy)"}
              </Label>
              <Input
                className="mt-1.5 h-11 rounded-2xl border-sand"
                value={form.slug}
                onChange={(e) => setForm({...form, slug: e.target.value})}
                placeholder="skincare"
              />
              {editId ? (
                <p className="mt-1 text-[11px] text-taupe">
                  Diqqat: slug o'zgartirilsa, mavjud mahsulotlar bog'lanishi uzilishi mumkin.
                </p>
              ) : null}
            </div>

            <div>
              <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">Tavsif</Label>
              <Textarea
                className="mt-1.5 rounded-2xl border-sand"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Qisqa tavsif (ixtiyoriy)"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">Tartib</Label>
                <Input
                  type="number"
                  className="mt-1.5 h-11 rounded-2xl border-sand"
                  value={form.sortOrder}
                  onChange={(e) => setForm({...form, sortOrder: e.target.value})}
                  placeholder="0"
                />
              </div>
              <button
                type="button"
                onClick={() => setForm({...form, isActive: !form.isActive})}
                className="mt-6 flex items-center gap-2 rounded-full border border-sand px-4 py-2.5 transition-colors hover:bg-cream"
              >
                <span
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    form.isActive ? "bg-sage" : "bg-taupe/40"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                      form.isActive ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </span>
                <span className="text-sm text-mocha">{form.isActive ? "Faol" : "Nofaol"}</span>
              </button>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="h-12 w-full rounded-full bg-espresso text-ivory hover:bg-mocha"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : editId ? "Saqlash" : "Qo'shish"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-espresso">O'chirishni tasdiqlang</DialogTitle>
            <DialogDescription className="text-taupe">
              "{deleteTarget?.name}" o'chirilsinmi? Bu amalni ortga qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-full border-sand" onClick={() => setDeleteTarget(null)}>
              Bekor qilish
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={confirmDelete}>
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TaxonomyManager;
