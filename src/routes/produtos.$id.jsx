import { createFileRoute } from "@tanstack/react-router";

import ProtectedRoute from "../components/ProtectedRoute";
import ProdutoDetalhePage from "../pages/ProdutoDetalhePage";

/* Rota privada /produtos/:id com os detalhes de um produto. */
export const Route = createFileRoute("/produtos/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do produto | Lions Market" },
      { name: "description", content: "Informações detalhadas do produto e criação de pedido." },
      { property: "og:title", content: "Detalhes do produto | Lions Market" },
      {
        property: "og:description",
        content: "Informações detalhadas do produto e criação de pedido.",
      },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <ProdutoDetalhePage />
    </ProtectedRoute>
  ),
});