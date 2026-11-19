import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import Header from "./components/Header";
import { MyFooter } from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import RequireAuth from "./components/RequireAuth";
import Category from "./pages/Category";
import bannerwomens from "./assets/bannerwomens.png";
import bannermens from "./assets/bannermens.png";
import bannerkids from "./assets/bannerkids.png";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kids" element={<Category key="kid" category="kid" banner={bannerkids} />} />
          <Route path="/mens" element={<Category key="men" category="men" banner={bannermens} />} />
          <Route path="/womens" element={<Category key="women" category="women" banner={bannerwomens} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart-page" element={<Cart />} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <MyFooter />
    </div>
  );
}
