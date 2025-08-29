import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-2 overflow-auto bg-base-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
