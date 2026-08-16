import { createFileRoute } from "@tanstack/react-router";

import ProtectedRoute from "../components/ProtectedRoute";
import DashboardPage from "../pages/DashboardPage";

/*
 * Rota privada e administrativa /dashboard.
 * "somenteAdmin" bloqueia o acesso de usuários comuns na interface.
 */
export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Lions Market" },
      { name: "description", content: "Indicadores administrativos do Lions Market." },
      { property: "og:title", content: "Dashboard | Lions Market" },
      { property: "og:description", content: "Indicadores administrativos do Lions Market." },
    ],
  }),
  component: () => (
    <ProtectedRoute somenteAdmin>
      <DashboardPage />
    </ProtectedRoute>
  ),
});