import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import {addFeatureImage, deleteFeatureImage, getFeatureImages} from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import instance from "@/utils/axios.js";
import {TrashIcon} from "lucide-react";
import {toast} from "react-toastify";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(imageFile)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  function deleteImage(id) {
    dispatch(deleteFeatureImage({id})).then((data) => {
      if (data?.payload?.success) {
        toast.error("Image deleted successfully!")
      }
    })
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
        // isEditMode={currentEditedId !== null}
      />
      <Button
        onClick={handleUploadFeatureImage}
        className="mt-5 w-full"
        disabled={!imageFile}
      >
        Upload
      </Button>
      <div className="flex flex-col gap-4 mt-5 overflow-hidden">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((featureImgItem) => (
            <div className="relative w-full text-end" key={featureImgItem?._id}>
              <Button
                variant={"destructive"}
                className={"mb-1"}
                onClick={() => deleteImage(featureImgItem?._id)}
              >
                <TrashIcon color={"#fff"} />
              </Button>
              <img
                src={instance.defaults.baseURL + featureImgItem.image || ""}
                alt={"image"}
                className="w-full h-[300px] object-cover rounded-t-lg"
              />
            </div>
          ))
          : null}
      </div>
    </div>
  );
}

export default AdminDashboard;