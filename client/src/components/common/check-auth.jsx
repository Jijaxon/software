// import { Navigate, useLocation } from "react-router-dom";
//
// function CheckAuth({ isAuthenticated, user, children }) {
//   const location = useLocation();
//
//   if (location.pathname === "/") {
//     if (!isAuthenticated) {
//       return <Navigate to="/auth/login"/>;
//     } else {
//       if (user?.role === "admin") {
//         return <Navigate to="/admin/dashboard"/>;
//       } else {
//         return <Navigate to="/shop/home"/>;
//       }
//     }
//   }
//   if (
//     !isAuthenticated &&
//     !(
//       location.pathname.includes("/login") ||
//       location.pathname.includes("/register")
//     )
//   ) {
//     return <Navigate to="/auth/login" />;
//   }
//   if (
//     isAuthenticated &&
//     (location.pathname.includes("/login") ||
//       location.pathname.includes("/register"))
//   ) {
//     if (user?.role === "admin") {
//       return <Navigate to="/admin/dashboard" />;
//     } else {
//       return <Navigate to="/shop/home" />;
//     }
//   }
//
//   if (
//       isAuthenticated &&
//       user?.role !== "admin" &&
//       location.pathname.includes("admin")
//     ) {
//       return <Navigate to="/unauth-page" />;
//     }
//     if (
//       isAuthenticated &&
//       user?.role === "admin" &&
//       location.pathname.includes("shop")
//     ) {
//       return <Navigate to="/admin/dashboard" />;
//     }
//     return <>{children}</>;
// }
//
//   export default CheckAuth;

import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();
  const path = location.pathname;

  // Guest userga ruxsat beriladigan routelar
  const guestAllowedRoutes = [
    "/shop/home",
    "/shop/listing",
    "/shop/search",
    "/shop/about",
  ];

  // agar product detail bo‘lsa "/shop/product/123"
  const isProductDetail =
    path.startsWith("/shop/product") || path.startsWith("/shop/details");

  // ROOT path "/" ga kirsa
  if (location.pathname === "/") {
    // Guest user bo'lsa → shop/home
    if (!isAuthenticated) {
      return <Navigate to="/shop/home" />;
    }

    // Auth user bo'lsa role'ga qarab redirect
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/shop/home" />;
    }
  }

  // 🟦 Guest userga shopning baʼzi routelari ko‘rinishi kerak
  if (!isAuthenticated) {
    if (
      guestAllowedRoutes.includes(path) ||
      isProductDetail
    ) {
      return <>{children}</>;
    }

    // guest checkout va accountga kira olmaydi
    return <Navigate to="/auth/login" />;
  }

  // 🟩 Auth user login/registerga kirmasin
  if (
    isAuthenticated &&
    (path.includes("/auth/login") || path.includes("/auth/register"))
  ) {
    if (user?.role === "admin") return <Navigate to="/admin/dashboard" />;
    return <Navigate to="/shop/home" />;
  }

  // 🔴 Oddiy user admin pagega kira olmaydi
  if (
    isAuthenticated &&
    user?.role !== "admin" &&
    path.includes("/admin")
  ) {
    return <Navigate to="/unauth-page" />;
  }

  // 🔴 Admin user shop pagega kira olmaydi
  if (
    isAuthenticated &&
    user?.role === "admin" &&
    path.includes("/shop")
  ) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <>{children}</>;
}

export default CheckAuth;
