import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Clientes",
    path: "/clientes",
  },
  {
    label: "Categorias de Veículos",
    path: "/categorias-veiculos",
  },
  {
    label: "Estacionamento",
    path: "/estacionamento",
  },
  {
    label: "Vagas",
    path: "/vagas",
  },
  {
    label: "Regras de Cobrança",
    path: "/regras-cobranca",
  },
  {
    label: "Tickets",
    path: "/tickets",
  },
  {
    label: "Relatórios",
    path: "/relatorios",
  },
  {
    label: "Configurações",
    path: "/configuracoes",
  },
];

export function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("@EstacioneJa:token");
    localStorage.removeItem("@EstacioneJa:user");

    navigate("/login");
  }

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.logo}>
          <span>▣</span>
          <strong>EstacioneJá</strong>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? `${styles.navItem} ${styles.active}`
                  : styles.navItem
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        type="button"
        className={styles.logoutButton}
        onClick={handleLogout}
      >
        ↳ Sair
      </button>
    </aside>
  );
}