import { createFileRoute } from "@tanstack/react-router";

import ProtectedRoute from "../components/ProtectedRoute";
import ProdutosPage from "../pages/ProdutosPage";

/* Rota privada /produtos — acessível a qualquer usuário autenticado. */
export const Route = createFileRoute("/produtos/")({
  head: () => ({
    meta: [
      { title: "Produtos | Lions Market" },
      { name: "description", content: "Consulta e gestão de produtos e estoque." },
      { property: "og:title", content: "Produtos | Lions Market" },
      { property: "og:description", content: "Consulta e gestão de produtos e estoque." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <ProdutosPage />
    </ProtectedRoute>
  ),
});