import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoute/ProtectedRoute";

import { LoginPage } from "../features/auth/pages/LoginPage";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { ParkingSessionsPage } from "../features/auth/pages/parkingSessionsPage";

import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { VehicleCategoriesPage } from "../features/auth/pages/VehicleCategoriesPage";
import { PricingRulesPage } from "../features/auth/pages/PricingRulesPage";
import { ClientPage } from "../features/auth/pages/client";
import { ParkingSpotsPage } from "../features/auth/pages/ParkingSpotsPage/ParkingSpotsPage";
import { ReportsPage } from "../features/auth/pages/ReportsPage/ReportsPage";

import { DashboardLayout } from "../layouts/DashboardLayout";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route path="/clientes" element={<ClientPage />} />

            <Route
              path="/veiculos"
              element={<h1>Veículos</h1>}
            />

            <Route
              path="/categorias-veiculos"
              element={<VehicleCategoriesPage />}
            />

            <Route
              path="/estacionamento"
              element={<ParkingSessionsPage />}
            />

            <Route
              path="/vagas"
              element={<ParkingSpotsPage />}
            />

            <Route
              path="/regras-cobranca"
              element={<PricingRulesPage />}
            />

            <Route
              path="/tickets"
              element={<h1>Tickets</h1>}
            />

            <Route
              path="/relatorios"
              element={<ReportsPage />}
            />

            <Route
              path="/configuracoes"
              element={<h1>Configurações</h1>}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}