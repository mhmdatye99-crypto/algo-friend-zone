import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background relative" dir="rtl">
      <div className="deep-space-overlay" />
      <TopBar />
      <main className="pb-24 relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
