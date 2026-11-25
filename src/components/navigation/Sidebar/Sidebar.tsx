import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
};

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "bi bi-speedometer2",
  },
  {
    label: "Clientes",
    path: "/clientes",
    icon: "bi bi-people",
  },
  {
    label: "Categorias de Veículos",
    path: "/categorias-veiculos",
    icon: "bi bi-car-front",
  },
  {
    label: "Estacionamento",
    path: "/estacionamento",
    icon: "bi bi-p-square",
  },
  {
    label: "Vagas",
    path: "/vagas",
    icon: "bi bi-grid-3x3-gap",
  },
  {
    label: "Regras de Cobrança",
    path: "/regras-cobranca",
    icon: "bi bi-cash-coin",
  },
  {
    label: "Veículos",
    path: "/veiculos",
    icon: "bi bi-car-front",
  },
  {
    label: "Relatórios",
    path: "/relatorios",
    icon: "bi bi-bar-chart",
  },
  {
    label: "Configurações",
    path: "/configuracoes",
    icon: "bi bi-gear",
  },
];

export function Sidebar({ isCollapsed, onToggleSidebar }: SidebarProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("@EstacioneJa:token");
    localStorage.removeItem("@EstacioneJa:user");

    navigate("/login");
  }

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <i className={`bi bi-p-square ${styles.logoIcon}`} aria-hidden="true" />
          <strong>EstacioneJá</strong>
        </div>

        <button
          type="button"
          className={`${styles.toggleButton} ${styles.desktopToggle}`}
          onClick={onToggleSidebar}
          aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          <i
            className={isCollapsed ? "bi bi-layout-sidebar" : "bi bi-chevron-left"}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          className={`${styles.toggleButton} ${styles.mobileToggle}`}
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="sidebar-menu"
        >
          <i className={isMobileMenuOpen ? "bi bi-x-lg" : "bi bi-list"} aria-hidden="true" />
        </button>
      </div>

      <div
        id="sidebar-menu"
        className={`${styles.menu} ${isMobileMenuOpen ? styles.menuOpen : ""}`}
      >
        <nav className={styles.nav} aria-label="Navegação principal">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              aria-label={item.label}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? `${styles.navItem} ${styles.active}`
                  : styles.navItem
              }
            >
              <i className={`${item.icon} ${styles.navIcon}`} aria-hidden="true" />
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
          title="Sair"
          aria-label="Sair"
        >
          <i className={`bi bi-box-arrow-left ${styles.navIcon}`} aria-hidden="true" />
          <strong>Sair</strong>
        </button>
      </div>
    </aside>
  );
}
