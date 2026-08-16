import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

/*
 * Layout das páginas autenticadas: menu lateral + cabeçalho + conteúdo.
 * Cada página recebe um título para manter a interface consistente.
 */
export default function AppLayout({ titulo, acoes, children }) {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Header />

        <main className="app-content">
          <div className="page-title">
            <h1>{titulo}</h1>
            {acoes}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}