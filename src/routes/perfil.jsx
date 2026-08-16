import { createFileRoute } from "@tanstack/react-router";

import ProtectedRoute from "../components/ProtectedRoute";
import PerfilPage from "../pages/PerfilPage";

/* Rota privada /perfil — edição dos próprios dados. */
export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil | Lions Market" },
      { name: "description", content: "Edite seus dados de acesso no Lions Market." },
      { property: "og:title", content: "Meu perfil | Lions Market" },
      { property: "og:description", content: "Edite seus dados de acesso no Lions Market." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <PerfilPage />
    </ProtectedRoute>
  ),
});