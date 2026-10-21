import {useEffect, useMemo, useState} from "react";
import {formatPrice} from "@/lib/utils";
import {Button} from "../ui/button.jsx";
import {Badge} from "../ui/badge.jsx";
import {Input} from "../ui/input.jsx";
import {Dialog} from "../ui/dialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import Pagination from "./pagination.jsx";
import {useDispatch, useSelector} from "react-redux";
import {getAllOrdersForAdmin, getOrderDetailsForAdmin, resetOrderDetails} from "@/store/admin/order-slice";
import {Search} from "lucide-react";

const PAGE_SIZE = 10;

function paymentBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return "bg-sage/90 text-white";
  if (s === "pending") return "bg-gold/90 text-white";
  if (s === "rejected" || s === "failed") return "bg-rose-deep text-white";
  return "bg-taupe/80 text-white";
}

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const {orderList, orderDetails} = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = orderList || [];
    if (!term) return list;
    return list.filter((o) =>
      [o?._id, o?.userId?.username, o?.userId?.phone, o?.userId?.email, o?.paymentStatus]
        .some((v) => String(v || "").toLowerCase().includes(term))
    );
  }, [orderList, searchTerm]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-sand bg-gradient-to-br from-white to-cream/60 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso">Buyurtmalar</h1>
          <p className="mt-1 text-sm text-taupe">Jami {orderList?.length || 0} ta buyurtma</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe"/>
          <Input
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="ID, mijoz yoki holat bo'yicha..."
            className="h-11 rounded-full border-sand bg-white pl-11"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-sand bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-sand hover:bg-transparent">
              <TableHead className="text-taupe">Buyurtma ID</TableHead>
              <TableHead className="text-taupe">Mijoz</TableHead>
              <TableHead className="text-taupe">Sana</TableHead>
              <TableHead className="text-taupe">Summa</TableHead>
              <TableHead className="text-taupe">To'lov holati</TableHead>
              <TableHead className="text-right text-taupe">Tafsilot</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length > 0 ? (
              paged.map((orderItem) => (
                <TableRow key={orderItem?._id} className="border-sand">
                  <TableCell className="font-mono text-xs text-mocha">{orderItem?._id?.slice(0, 8)}…</TableCell>
                  <TableCell className="text-espresso">
                    {orderItem?.userId?.username || "—"}
                    <span className="block text-xs text-taupe">
                      {orderItem?.userId?.phone ? `+${orderItem.userId.phone}` : orderItem?.userId?.email}
                    </span>
                  </TableCell>
                  <TableCell className="text-mocha">{orderItem?.orderDate?.split("T")[0]}</TableCell>
                  <TableCell className="font-semibold text-espresso">{formatPrice(orderItem?.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge className={`border-0 ${paymentBadgeClass(orderItem?.paymentStatus)}`}>
                      {orderItem?.paymentStatus || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => handleFetchOrderDetails(orderItem?._id)}
                      className="h-9 rounded-full bg-espresso px-4 text-ivory hover:bg-mocha"
                    >
                      Ko'rish
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-taupe">
                  {(orderList?.length || 0) === 0 ? "Hali buyurtma yo'q" : "Qidiruv bo'yicha buyurtma topilmadi"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage}/>

      {/* Single details dialog */}
      <Dialog
        open={openDetailsDialog}
        onOpenChange={() => {
          setOpenDetailsDialog(false);
          dispatch(resetOrderDetails());
        }}
      >
        <AdminOrderDetailsView orderDetails={orderDetails}/>
      </Dialog>
    </div>
  );
}

export default AdminOrdersView;
