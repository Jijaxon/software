import {Navigate, Route, Routes} from "react-router-dom";
import AuthLayout from "@/components/auth/layout.jsx";
import AuthLogin from "@/pages/auth/login.jsx";
import AuthRegister from "@/pages/auth/register.jsx";
import AdminProducts from "@/pages/admin-view/products.jsx";
import AdminLayout from "@/components/admin-view/layout.jsx";
import AdminDashboard from "@/pages/admin-view/dashboard.jsx";
import AdminOrders from "@/pages/admin-view/order.jsx";
import AdminFeatures from "@/pages/admin-view/features.jsx";
import ShoppingLayout from "@/components/shopping-view/layout.jsx";
import NotFound from "@/pages/not-found/index.jsx";
import ShoppingHome from "@/pages/shopping-view/home.jsx";
import ShoppingAccount from "@/pages/shopping-view/account.jsx";
import ShoppingListing from "@/pages/shopping-view/listing.jsx";
import ShoppingCheckout from "@/pages/shopping-view/checkout.jsx";
import CheckAuth from "@/components/common/check-auth.jsx";
import UnauthPage from "@/pages/unauth-page/index.jsx";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {checkAuth} from "@/store/auth-slice/index.js";
import {Skeleton} from "@/components/ui/skeleton"
import About from "@/pages/shopping-view/about.jsx";
import Search from "@/pages/shopping-view/search.jsx";
import PaymentSuccessPage from "@/pages/shopping-view/payment-success.jsx";


function App() {
  const {user, isAuthenticated, isLoading} = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) return <Skeleton className="h-[600px] w-[800] bg-black"/>

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        <Route path="/auth"
               element={<AuthLayout/>}>
          <Route path="login" element={<AuthLogin/>}/>
          <Route path="register" element={<AuthRegister/>}/>
        </Route>
        <Route path="/admin"
               element={<CheckAuth isAuthenticated={isAuthenticated} user={user}><AdminLayout/></CheckAuth>}>
          <Route path="products" element={<AdminProducts/>}/>
          <Route path="dashboard" element={<AdminDashboard/>}/>
          <Route path="orders" element={<AdminOrders/>}/>
          <Route path="features" element={<AdminFeatures/>}/>
        </Route>
        <Route path="shop" element={<CheckAuth isAuthenticated={isAuthenticated} user={user}><ShoppingLayout/></CheckAuth>}>
          <Route path="home" element={<ShoppingHome/>}/>
          <Route path="Account" element={<ShoppingAccount/>}/>
          <Route path="listing" element={<ShoppingListing/>}/>
          <Route path="checkout" element={<ShoppingCheckout/>}/>
          <Route path="success" element={<PaymentSuccessPage/>}/>
          <Route path="about" element={<About/>}/>
          <Route path="search" element={<Search/>}/>
          <Route path="account" element={<ShoppingAccount/>}/>
        </Route>

        <Route path="/" element={<Navigate to={'/shop/home'} />}/>

        <Route path="*" element={<NotFound/>}></Route>
        <Route path="unauth-page" element={<UnauthPage/>}/>
      </Routes>
    </div>
  )
}

export default App;
