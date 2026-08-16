import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import Loading from "../components/Loading";
import { useAuth } from "../contexts/AuthContext";

/*
 * Rota "/" — funciona apenas como porta de entrada.
 *
 * Depois que o AuthContext termina de verificar a sessão, redirecionamos:
 *  - sem sessão              -> /login
 *  - administrador           -> /dashboard
 *  - usuário comum           -> /produtos
 */
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lions Market | Sistema de gestão" },
      {
        name: "description",
        content: "Sistema de gestão de usuários, produtos, estoque e pedidos.",
      },
      { property: "og:title", content: "Lions Market | Sistema de gestão" },
      {
        property: "og:description",
        content: "Sistema de gestão de usuários, produtos, estoque e pedidos.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { carregando, autenticado, ehAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (carregando) return;

    if (!autenticado) {
      navigate({ to: "/login", replace: true });
few    } else if (ehAdmin) {
      navigate({ to: "/dashboard", replace: true });
    } else {
      navigate({ to: "/produtos", replace: true });
    }
  }, [carregando, autenticado, ehAdmin, navigate]);

  return <Loading texto="Carregando..." />;
}