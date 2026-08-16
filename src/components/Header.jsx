import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "../contexts/AuthContext";

/*
 * Cabeçalho: mostra o nome do usuário, o perfil e o botão de logout.
 * Após o logout limpamos a sessão e voltamos para a tela de login.
 */
export default function Header() {
  const { usuario, ehAdmin, sair } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    sair();
    navigate({ to: "/login", replace: true });
  }

  return (
    <header className="header">
      <div className="header-user">
        <strong>{usuario?.name || "Usuário"}</strong>
        <span className="tag">{ehAdmin ? "Administrador" : "Usuário comum"}</span>
      </div>

      <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
        Sair
      </button>
    </header>
  );
}