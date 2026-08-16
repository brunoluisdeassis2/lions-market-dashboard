import { createFileRoute } from "@tanstack/react-router";

import LoginPage from "../pages/LoginPage";

/*
 * Rota pública /login.
 * O arquivo de rota é intencionalmente fino: ele apenas aponta para a página.
 */
export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | Lions Market" },
      { name: "description", content: "Acesse o sistema de gestão Lions Market." },
      { property: "og:title", content: "Login | Lions Market" },
      { property: "og:description", content: "Acesse o sistema de gestão Lions Market." },
    ],
  }),
  component: LoginPage,
});