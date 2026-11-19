import { Navigate, Route, Routes } from "react-router";
import SideBar from "../componets/SideBar";
import AddProduct from "../componets/AddProduct";
import ListProduct from "../componets/ListProduct";
import Orders from "../componets/Orders";

export default function Admin() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
      <SideBar />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <Routes>
          <Route path="/" element={<Navigate to="/listproduct" replace />} />
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/listproduct" element={<ListProduct />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="*" element={<Navigate to="/listproduct" replace />} />
        </Routes>
      </main>
    </div>
  );
}
