import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/navigation/Sidebar";
import styles from "./DashboardLayout.module.css";
import { useState } from "react";

export function DashboardLayout() {

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  function handleToggleSidebar(){
    setIsSidebarCollapsed((currentValue)=> !currentValue)
  }
  return (
    <div
      className={`${styles.layout} ${
        isSidebarCollapsed ? styles.layoutCollapsed : ""
      }`}
    >
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}