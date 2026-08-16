import { createFileRoute } from "@tanstack/react-router";

import ProtectedRoute from "../components/ProtectedRoute";
import PedidosPage from "../pages/PedidosPage";

/*
 * Rota privada /pedidos.
 * Usuário comum vê apenas os próprios pedidos — quem aplica esse filtro é o backend.
 */
export const Route = createFileRoute("/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos | Lions Market" },
      { name: "description", content: "Acompanhamento e gestão de pedidos." },
      { property: "og:title", content: "Pedidos | Lions Market" },
      { property: "og:description", content: "Acompanhamento e gestão de pedidos." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <PedidosPage />
    </ProtectedRoute>
  ),
});