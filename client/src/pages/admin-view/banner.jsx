import {Button} from "@/components/ui/button";
import {addFeatureImage, deleteFeatureImage, getFeatureImages} from "@/store/common-slice";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import instance from "@/utils/axios.js";
import {ImagePlus, Loader2, Trash2, UploadCloud} from "lucide-react";
import {toast} from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog.jsx";

function Banner() {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const dispatch = useDispatch();
  const {featureImageList, isLoading} = useSelector((state) => state.commonFeature);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  async function handleUpload() {
    if (!imageFile) return;
    setUploading(true);
    const res = await dispatch(addFeatureImage(imageFile));
    setUploading(false);
    if (res?.payload?.success) {
      dispatch(getFeatureImages());
      setImageFile(null);
      toast.success("Banner yuklandi!");
    } else {
      toast.error(res?.payload?.message || "Yuklashda xatolik");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await dispatch(deleteFeatureImage({id: deleteTarget}));
    if (res?.payload?.success) toast.success("Banner o'chirildi!");
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-sand bg-gradient-to-br from-white to-cream/60 p-6 shadow-sm">
        <h1 className="font-display text-3xl font-semibold text-espresso">Bannerlar</h1>
        <p className="mt-1 text-sm text-taupe">
          Bosh sahifadagi slayder rasmlarini boshqaring. Tavsiya etilgan o'lcham: 2200×900px.
        </p>
      </div>

      {/* Upload card */}
      <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
        <label
          htmlFor="banner-upload"
          className="flex min-h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-petal bg-cream/40 transition-colors hover:border-rose"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="h-56 w-full object-cover"/>
          ) : (
            <div className="flex flex-col items-center py-10 text-taupe">
              <ImagePlus className="mb-3 h-10 w-10 text-petal"/>
              <span className="font-medium text-mocha">Rasmni bu yerga tashlang yoki tanlang</span>
              <span className="mt-1 text-xs">PNG, JPG — 10MB gacha</span>
            </div>
          )}
        </label>
        <input
          id="banner-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
        <Button
          onClick={handleUpload}
          disabled={!imageFile || uploading}
          className="mt-4 h-12 w-full gap-2 rounded-full bg-espresso text-ivory hover:bg-mocha"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <UploadCloud className="h-4 w-4"/>}
          Yuklash
        </Button>
      </div>

      {/* Banners list */}
      <div>
        <h2 className="mb-4 font-display text-xl font-semibold text-espresso">
          Joriy bannerlar
          {featureImageList?.length ? (
            <span className="ml-2 rounded-full bg-blush/60 px-2.5 py-0.5 text-sm text-rose-deep">
              {featureImageList.length}
            </span>
          ) : null}
        </h2>

        {isLoading && !featureImageList?.length ? (
          <div className="flex justify-center py-12 text-rose">
            <Loader2 className="h-6 w-6 animate-spin"/>
          </div>
        ) : featureImageList?.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {featureImageList.map((item) => (
              <div
                key={item?._id}
                className="group relative overflow-hidden rounded-3xl border border-sand bg-white shadow-sm"
              >
                <img
                  src={instance.defaults.baseURL + item.image}
                  alt="banner"
                  className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"/>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-3 top-3 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setDeleteTarget(item?._id)}
                >
                  <Trash2 className="h-4 w-4"/>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-petal bg-white/70 py-14 text-center text-taupe">
            Hali banner yuklanmagan
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-espresso">Bannerni o'chirish</DialogTitle>
            <DialogDescription className="text-taupe">
              Ushbu banner o'chirilsinmi? Bu amalni ortga qaytarib bo'lmaydi.
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

export default Banner;
