import { useCallback, useEffect, useState } from "react";

import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import SuccessMessage from "../components/SuccessMessage";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { atualizarUsuario, excluirUsuario, listarUsuarios } from "../services/userService";
import { getApiErrorMessage } from "../utils/errors";
import { formatDate, getId } from "../utils/format";

const ITENS_POR_PAGINA = 10;

/*
 * GESTÃO DE USUÁRIOS (somente administrador)
 *
 * A rota é protegida por ProtectedRoute com somenteAdmin, o item do menu
 * só aparece para admin e o backend recusa a requisição de usuários comuns.
 * São três camadas: interface, rota e servidor.
 */
export default function UsuariosPage() {
  const { usuario: usuarioLogado } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Mesmo debounce usado na tela de produtos.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBuscaAplicada(busca.trim());
      setPagina(1);
    }, 400);

    return () => clearTimeout(temporizador);
  }, [busca]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await listarUsuarios({
        search: buscaAplicada || undefined,
        page: pagina,
        limit: ITENS_POR_PAGINA,
      });

      const lista = Array.isArray(resposta) ? resposta : resposta.data || [];
      setUsuarios(lista);
      setTotalPaginas(Array.isArray(resposta) ? 1 : resposta.totalPages || 1);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível carregar os usuários."));
      setUsuarios([]);
    } finally {
      setCarregando(false);
    }
  }, [buscaAplicada, pagina]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Alteração de perfil (role) de um usuário.
  async function handleAlterarPerfil(usuario, novoPerfil) {
    try {
      await atualizarUsuario(getId(usuario), { role: novoPerfil });
      setMensagem("Perfil do usuário atualizado.");
      setErro("");
      carregar();
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível alterar o perfil do usuário."));
    }
  }

  async function handleAlternarStatus(usuario) {
    try {
      await atualizarUsuario(getId(usuario), { active: usuario.active === false });
      setMensagem("Status do usuário atualizado.");
      setErro("");
      carregar();
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível alterar o status do usuário."));
    }
  }

  async function handleExcluir(usuario) {
    if (!window.confirm(`Excluir o usuário "${usuario.name}"?`)) return;

    try {
      await excluirUsuario(getId(usuario));
      setMensagem("Usuário excluído.");
      setErro("");
      carregar();
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível excluir o usuário."));
    }
  }

  return (
    <AppLayout titulo="Usuários">
      <div className="filters">
        <div className="form-field">
          <label htmlFor="busca-usuario">Buscar por nome ou e-mail</label>
          <input
            id="busca-usuario"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>
      </div>

      <SuccessMessage mensagem={mensagem} />
      <ErrorMessage mensagem={erro} onRetry={carregar} />

      {carregando && <Loading texto="Carregando usuários..." />}

      {!carregando && !erro && usuarios.length === 0 && (
        <EmptyState texto="Nenhum usuário encontrado." />
      )}

      {!carregando && usuarios.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                // Evitamos que o administrador altere ou remova a própria conta
                // por acidente e se tranque fora do sistema.
                const ehProprioUsuario = getId(usuario) === getId(usuarioLogado);

                return (
                  <tr key={getId(usuario)}>
                    <td>{usuario.name}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.role === "admin" ? "Administrador" : "Usuário comum"}</td>
                    <td>{usuario.active === false ? "Inativo" : "Ativo"}</td>
                    <td>{formatDate(usuario.createdAt)}</td>
                    <td className="actions">
                      <select
                        aria-label="Alterar perfil do usuário"
                        value={usuario.role || "user"}
                        disabled={ehProprioUsuario}
                        onChange={(evento) => handleAlterarPerfil(usuario, evento.target.value)}
                      >
                        <option value="user">Usuário comum</option>
                        <option value="admin">Administrador</option>
                      </select>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={ehProprioUsuario}
                        onClick={() => handleAlternarStatus(usuario)}
                      >
                        {usuario.active === false ? "Ativar" : "Desativar"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={ehProprioUsuario}
                        onClick={() => handleExcluir(usuario)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onMudarPagina={setPagina} />
    </AppLayout>
  );
}