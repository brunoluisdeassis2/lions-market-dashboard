import { Link } from "@tanstack/react-router";

import { useAuth } from "../contexts/AuthContext";

/*
 * Menu lateral do sistema.
 *
 * O item "Usuários" só aparece para administradores. Isso é apenas
 * reflexo visual da permissão: mesmo que alguém acesse a URL direto,
 * a rota é protegida e o backend recusa a requisição.
 */
export default function Sidebar() {
  const { ehAdmin } = useAuth();

  return (
    <nav className="sidebar" aria-label="Menu principal">
      <div className="sidebar-brand">Lions Market</div>

      <ul>
        {/* Dashboard é administrativo, então só é listado para admin. */}
        {ehAdmin && (
          <li>
            <Link to="/dashboard" activeProps={{ className: "active" }}>
              Dashboard
            </Link>
          </li>
        )}
        <li>
          <Link to="/produtos" activeProps={{ className: "active" }}>
            Produtos
          </Link>
        </li>
        <li>
          <Link to="/pedidos" activeProps={{ className: "active" }}>
            Pedidos
          </Link>
        </li>
        <li>
          <Link to="/perfil" activeProps={{ className: "active" }}>
            Perfil
          </Link>
        </li>
        {ehAdmin && (
          <li>
            <Link to="/usuarios" activeProps={{ className: "active" }}>
              Usuários
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}