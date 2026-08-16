import { createFileRoute } from "@tanstack/react-router";

import ProtectedRoute from "../components/ProtectedRoute";
import UsuariosPage from "../pages/UsuariosPage";

/* Rota privada e administrativa /usuarios. */
export const Route = createFileRoute("/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários | Lions Market" },
      { name: "description", content: "Gestão de usuários e perfis de acesso." },
      { property: "og:title", content: "Usuários | Lions Market" },
      { property: "og:description", content: "Gestão de usuários e perfis de acesso." },
    ],
  }),
  component: () => (
    <ProtectedRoute somenteAdmin>
      <UsuariosPage />
    </ProtectedRoute>
  ),
});