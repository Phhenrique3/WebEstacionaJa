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
    label: "Tickets",
    path: "/tickets",
    icon: "bi bi-ticket-perforated",
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

  function handleLogout() {
    localStorage.removeItem("@EstacioneJa:token");
    localStorage.removeItem("@EstacioneJa:user");

    navigate("/login");
  }

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""
        }`}
    >
      <div>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <i className={`bi bi-p-square ${styles.logoIcon}`} />

            {!isCollapsed && <strong>EstacioneJá</strong>}
          </div>

          <button
            type="button"
            className={styles.toggleButton}
            onClick={onToggleSidebar}
            title={isCollapsed ? "Abrir menu" : "Fechar menu"}
          >
            <i
              className={
                isCollapsed ? "bi bi-layout-sidebar" : "bi bi-chevron-left"
              }
            />
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                isActive
                  ? `${styles.navItem} ${styles.active}`
                  : styles.navItem
              }
            >
              <i className={`${item.icon} ${styles.navIcon}`} />

              {!isCollapsed && (
                <span className={styles.navLabel}>{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        type="button"
        className={styles.logoutButton}
        onClick={handleLogout}
        title={isCollapsed ? "Sair" : undefined}
      >
        <i className="bi bi-box-arrow-left" />

        {!isCollapsed && <strong>Sair</strong>}
      </button>
    </aside>
  );
}