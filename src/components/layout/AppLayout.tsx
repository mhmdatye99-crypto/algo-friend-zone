import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
