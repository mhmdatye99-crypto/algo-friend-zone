import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background relative" dir="rtl">
      {/* Deep space star-dust overlay */}
      <div className="deep-space-overlay" />
      <main className="pb-24 relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
