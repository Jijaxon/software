import {AlignJustify, LogOut} from "lucide-react";
import {Button} from "../ui/button";
import {useDispatch} from "react-redux";
import {logoutUser} from "@/store/auth-slice";

function AdminHeader({setOpen}) {
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-sand/70 bg-ivory/80 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setOpen(true)}
          variant="ghost"
          size="icon"
          className="text-espresso hover:bg-blush/50 lg:hidden"
        >
          <AlignJustify/>
          <span className="sr-only">Menyuni ochish</span>
        </Button>
        <div className="hidden sm:block">
          <p className="text-[11px] uppercase tracking-[0.25em] text-taupe">Xush kelibsiz</p>
          <p className="font-display text-lg font-semibold text-espresso">Administrator</p>
        </div>
      </div>

      <Button
        onClick={handleLogout}
        className="inline-flex items-center gap-2 rounded-full border border-petal bg-white px-4 py-2 text-sm font-medium text-rose-deep shadow-none transition-all hover:-translate-y-0.5 hover:bg-blush/50"
      >
        <LogOut className="h-4 w-4"/>
        Chiqish
      </Button>
    </header>
  );
}

export default AdminHeader;
