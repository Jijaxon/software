// import ProductImageUpload from "@/components/admin-view/image-upload";
// import { Button } from "@/components/ui/button";
// import {addFeatureImage, deleteFeatureImage, getFeatureImages} from "@/store/common-slice";
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import instance from "@/utils/axios.js";
// import {TrashIcon} from "lucide-react";
// import {toast} from "react-toastify";
//
// function AdminDashboard() {
//   const [imageFile, setImageFile] = useState(null);
//   const [uploadedImageUrl, setUploadedImageUrl] = useState("");
//   const [imageLoadingState, setImageLoadingState] = useState(false);
//   const dispatch = useDispatch();
//   const { featureImageList } = useSelector((state) => state.commonFeature);
//
//   function handleUploadFeatureImage() {
//     dispatch(addFeatureImage(imageFile)).then((data) => {
//       if (data?.payload?.success) {
//         dispatch(getFeatureImages());
//         setImageFile(null);
//         setUploadedImageUrl("");
//       }
//     });
//   }
//
//   function deleteImage(id) {
//     dispatch(deleteFeatureImage({id})).then((data) => {
//       if (data?.payload?.success) {
//         toast.error("Image deleted successfully!")
//       }
//     })
//   }
//
//   useEffect(() => {
//     dispatch(getFeatureImages());
//   }, [dispatch]);
//
//   return (
//     <div>
//       <ProductImageUpload
//         imageFile={imageFile}
//         setImageFile={setImageFile}
//         uploadedImageUrl={uploadedImageUrl}
//         setUploadedImageUrl={setUploadedImageUrl}
//         setImageLoadingState={setImageLoadingState}
//         imageLoadingState={imageLoadingState}
//         isCustomStyling={true}
//         // isEditMode={currentEditedId !== null}
//       />
//       <Button
//         onClick={handleUploadFeatureImage}
//         className="mt-5 w-full"
//         disabled={!imageFile}
//       >
//         Upload
//       </Button>
//       <div className="flex flex-col gap-4 mt-5 overflow-hidden">
//         {featureImageList && featureImageList.length > 0
//           ? featureImageList.map((featureImgItem) => (
//             <div className="relative w-full text-end" key={featureImgItem?._id}>
//               <Button
//                 variant={"destructive"}
//                 className={"mb-1"}
//                 onClick={() => deleteImage(featureImgItem?._id)}
//               >
//                 <TrashIcon color={"#fff"} />
//               </Button>
//               <img
//                 src={instance.defaults.baseURL + featureImgItem.image || ""}
//                 alt={"image"}
//                 className="w-full h-[300px] object-cover rounded-t-lg"
//               />
//             </div>
//           ))
//           : null}
//       </div>
//     </div>
//   );
// }
//
// export default AdminDashboard;


import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {getDashboard} from "@/store/admin/dashboard-slice/index.js";
import StatsCard from "@/components/admin-view/stats-card.jsx";
import {Card, CardContent} from "@/components/ui/card.jsx";
import {Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis} from "recharts";
import {Loader2} from "lucide-react";

function AdminDashboard() {
  const dispatch = useDispatch()

  const {dashboard, isLoading} = useSelector(state => state.dashboard)

  useEffect(() => {
    dispatch(getDashboard())
  }, [dispatch]);

  const pieColors = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444"];
  const barColors = [
    "#4F46E5",
    "#0EA5E9",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#14B8A6",
    "#D946EF",
    "#F43F5E",
    "#22C55E",
    "#EAB308",
    "#3B82F6"
  ];

  if (isLoading) return <div className={"flex justify-center animate-spin"}><Loader2 /></div>

  return (
    <>
      <div className="p-6 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Users" value={dashboard?.totalUsers}/>
          <StatsCard title="Total Products" value={dashboard?.totalProducts}/>
          <StatsCard title="Total Orders" value={dashboard?.totalOrders}/>
          <StatsCard title="Total Revenue" value={`$${dashboard?.totalRevenue}`}/>
        </div>

        {/* Pie Chart */}
        <Card className="p-4 rounded-2xl">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Order Status Breakdown</h2>

            <BarChart
              width={"100%"}
              height={350}
              data={dashboard?.ordersByStatus}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="_id" />
              <Tooltip />
              <Bar dataKey="count" label={{ position: "right", fill: "#000", fontSize: 12 }}>
                {dashboard?.ordersByStatus?.map((_, i) => (
                  <Cell key={i} fill={barColors[i % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </CardContent>
        </Card>

        <Card className="p-4 rounded-2xl">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Monthly Sales</h2>

            <LineChart
              width={"100%"}
              height={320}
              data={dashboard?.monthlySales}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="totalSales"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 6, fill: "#4F46E5" }}
                activeDot={{ r: 8 }}
                label={{ position: "top", fill: "#000", fontSize: 12 }}
              />
            </LineChart>
          </CardContent>
        </Card>


      </div>
    </>
  )
}

export default AdminDashboard