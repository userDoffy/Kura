import { Outlet } from "react-router";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar />

     <main className="flex-1 flex flex-col bg-base-100 min-h-screen ml-14 lg:ml-16">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;


