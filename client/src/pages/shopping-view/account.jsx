import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Gift, MapPin, Package, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import Profile from "@/components/shopping-view/profile.jsx";
import Referral from "@/components/shopping-view/referral.jsx";
import { displayName } from "@/lib/utils";
import { useT } from "@/i18n/index.jsx";
import { useDocumentTitle } from "@/lib/use-document-title.js";

const tabs = [
  { value: "orders", labelKey: "account.orders", icon: Package },
  { value: "referral", labelKey: "account.referral", icon: Gift },
  { value: "address", labelKey: "account.addresses", icon: MapPin },
  { value: "profile", labelKey: "account.profile", icon: UserRound },
];

const bannerImage =
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=2200&q=85";

function ShoppingAccount() {
  const { user } = useSelector((state) => state.auth);
  const { t } = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = tabs.some((tab) => tab.value === searchParams.get("tab")) ? searchParams.get("tab") : "orders";
  useDocumentTitle(t("account.eyebrow"));

  return (
    <div className="flex flex-col bg-ivory pb-20">
      <section className="px-3 pt-3 md:px-6 md:pt-4">
        <div className="relative h-[260px] overflow-hidden rounded-[32px] md:h-[320px]">
          <img
            src={bannerImage}
            alt=""
            className="h-full w-full animate-ken-burns object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/40 to-transparent" />
          <div className="absolute inset-0 flex items-end px-7 pb-10 md:px-14">
            <div className="text-white">
              <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.25em] text-blush">{t("account.eyebrow")}</p>
              <h1 className="mt-2 animate-fade-up font-display text-5xl font-medium [animation-delay:100ms] md:text-6xl">
                {t("account.hello")} <em className="text-petal">{displayName(user)}</em>
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-6 w-full max-w-6xl px-4 md:px-8">
        <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })} className="relative">
          <TabsList className="mx-auto flex h-auto w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-sand bg-white p-1.5 shadow-lg shadow-mocha/5">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-semibold text-mocha transition-all duration-300 data-[state=active]:bg-espresso data-[state=active]:text-ivory data-[state=active]:shadow-md sm:px-6 sm:text-sm"
              >
                <tab.icon className="h-4 w-4" />
                <span className={tab.value === "referral" ? "hidden sm:inline" : ""}>{t(tab.labelKey)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="orders" className="mt-8 animate-fade-up">
            <ShoppingOrders />
          </TabsContent>
          <TabsContent value="referral" className="mt-8 animate-fade-up">
            <Referral />
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
