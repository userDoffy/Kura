import { Outlet } from "react-router";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 flex flex-col pl-12 sm:pl-14 bg-base-100 min-h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
