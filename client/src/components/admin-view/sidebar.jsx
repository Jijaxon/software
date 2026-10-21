import {
  BadgeCheck,
  ImageIcon,
  LayoutDashboard,
  Layers3,
  Sparkles,
  ShoppingBasket,
  Tag,
} from "lucide-react";
import {Fragment} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";

const adminSidebarMenuItems = [
  {id: "dashboard", label: "Boshqaruv paneli", path: "/admin/dashboard", icon: LayoutDashboard},
  {id: "banners", label: "Bannerlar", path: "/admin/banners", icon: ImageIcon},
  {id: "categories", label: "Go'zallik bo'limlari", path: "/admin/categories", icon: Layers3},
  {id: "brands", label: "Brendlar", path: "/admin/brands", icon: Tag},
  {id: "products", label: "Mahsulotlar", path: "/admin/products", icon: ShoppingBasket},
  {id: "orders", label: "Buyurtmalar", path: "/admin/orders", icon: BadgeCheck},
];

function Brand({onClick}) {
  return (
    <div onClick={onClick} className="flex cursor-pointer items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-rose to-rose-deep text-ivory shadow-lg shadow-rose-deep/30">
        <Sparkles className="h-5 w-5"/>
      </span>
      <div className="leading-tight">
        <h1 className="font-display text-2xl font-semibold tracking-[0.2em] text-ivory">NAFIS</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-blush/70">Admin panel</p>
      </div>
    </div>
  );
}

function MenuItems({setOpen}) {
  return (
    <nav className="mt-10 flex flex-col gap-1.5">
      {adminSidebarMenuItems.map((menuItem) => {
        const Icon = menuItem.icon;
        return (
          <NavLink
            to={menuItem.path}
            key={menuItem.id}
            onClick={() => setOpen?.(false)}
            className={({isActive}) =>
              `group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] transition-all duration-300 ${
                isActive
                  ? "bg-ivory/10 font-semibold text-ivory shadow-inner"
                  : "text-blush/70 hover:bg-ivory/5 hover:text-ivory"
              }`
            }
          >
            {({isActive}) => (
              <>
                <span
                  className={`absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full bg-rose transition-all duration-300 ${
                    isActive ? "w-1" : "w-0 group-hover:w-0.5"
                  }`}
                />
                <Icon className="h-5 w-5"/>
                <span>{menuItem.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

function AdminSideBar({open, setOpen}) {
  const navigate = useNavigate();

  return (
    <Fragment>
      {/* Mobile (sheet) menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-0 bg-espresso p-0">
          <div className="flex h-full flex-col bg-gradient-to-b from-espresso to-mocha p-6">
            <SheetHeader className="space-y-0 text-left">
              <SheetTitle className="mt-2">
                <Brand onClick={() => { navigate("/admin/dashboard"); setOpen(false); }}/>
              </SheetTitle>
              <SheetDescription className="sr-only">Admin panel menyusi</SheetDescription>
            </SheetHeader>
            <MenuItems setOpen={setOpen}/>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden w-72 flex-col bg-gradient-to-b from-espresso to-mocha p-6 lg:flex">
        <Brand onClick={() => navigate("/admin/dashboard")}/>
        <MenuItems/>
        <div className="mt-auto rounded-2xl bg-ivory/5 p-4 text-center">
          <p className="text-xs text-blush/60">NAFIS Beauty</p>
          <p className="text-[11px] text-blush/40">Boshqaruv tizimi</p>
        </div>
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
