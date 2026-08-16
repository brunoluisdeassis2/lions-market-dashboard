import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "../contexts/AuthContext";
import Loading from "./Loading";

/*
 * PROTEÇÃO DE ROTAS
 *
 * Envolve as páginas privadas e decide se o conteúdo pode ser renderizado:
 *
 * 1) Enquanto o AuthContext ainda verifica a sessão salva, mostramos
 *    "Verificando sessão..." — sem isso, um usuário logado seria enviado
 *    para /login a cada recarregamento da página.
 * 2) Sem usuário autenticado -> redireciona para /login.
 * 3) Com "somenteAdmin" e usuário comum -> mostra aviso de acesso negado
 *    (o backend também bloqueia; aqui é só a interface refletindo a regra).
 */
export default function ProtectedRoute({ children, somenteAdmin = false }) {
  const { autenticado, carregando, ehAdmin } = useAuth();
  const navigate = useNavigate();

  // O redirecionamento acontece em efeito, após a renderização, para não
  // navegar durante o render do React.
  useEffect(() => {
    if (!carregando && !autenticado) {
      navigate({ to: "/login", replace: true });
    }
  }, [carregando, autenticado, navigate]);

  if (carregando) {
    return <Loading texto="Verificando sessão..." />;
  }

  if (!autenticado) {
    return <Loading texto="Redirecionando para o login..." />;
  }

  if (somenteAdmin && !ehAdmin) {
    return (
      <div className="alert alert-error" role="alert">
        Acesso restrito a administradores.
      </div>
    );
  }

  return children;
}