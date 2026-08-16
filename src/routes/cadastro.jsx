import { createFileRoute } from "@tanstack/react-router";

import CadastroPage from "../pages/CadastroPage";

/* Rota pública /cadastro — cria sempre um usuário comum. */
export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta | Lions Market" },
      { name: "description", content: "Crie sua conta de acesso ao Lions Market." },
      { property: "og:title", content: "Criar conta | Lions Market" },
      { property: "og:description", content: "Crie sua conta de acesso ao Lions Market." },
    ],
  }),
  component: CadastroPage,
});