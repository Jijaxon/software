import { useSelector } from "react-redux";
import { MapPin, Package, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accImg from "../../assets/account.jpg";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import Profile from "@/components/shopping-view/profile.jsx";

const tabs = [
  { value: "orders", label: "Buyurtmalar", icon: Package },
  { value: "address", label: "Manzillar", icon: MapPin },
  { value: "profile", label: "Profil", icon: UserRound },
];

function ShoppingAccount() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex flex-col bg-ivory pb-20">
      <section className="px-3 pt-3 md:px-6 md:pt-4">
        <div className="relative h-[260px] overflow-hidden rounded-[32px] md:h-[320px]">
          <img
            src={accImg}
            alt=""
            className="h-full w-full animate-ken-burns object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/40 to-transparent" />
          <div className="absolute inset-0 flex items-end px-7 pb-10 md:px-14">
            <div className="text-white">
              <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.25em] text-blush">Shaxsiy kabinet</p>
              <h1 className="mt-2 animate-fade-up font-display text-5xl font-medium [animation-delay:100ms] md:text-6xl">
                Salom, <em className="text-petal">{user?.username}</em>
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-6 w-full max-w-6xl px-4 md:px-8">
        <Tabs defaultValue="orders" className="relative">
          <TabsList className="mx-auto flex h-auto w-fit gap-1 rounded-full border border-sand bg-white p-1.5 shadow-lg shadow-mocha/5">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-mocha transition-all duration-300 data-[state=active]:bg-espresso data-[state=active]:text-ivory data-[state=active]:shadow-md sm:px-6 sm:text-sm"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="orders" className="mt-8 animate-fade-up">
            <ShoppingOrders />
          </TabsContent>
          <TabsContent value="address" className="mt-8 animate-fade-up">
            <Address />
          </TabsContent>
          <TabsContent value="profile" className="mt-8 animate-fade-up">
            <Profile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ShoppingAccount;
