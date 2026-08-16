import { useCallback, useEffect, useState } from "react";

import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import Select from "../components/Select";
import SuccessMessage from "../components/SuccessMessage";
import PedidoDetalhe from "../components/PedidoDetalhe";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { alterarStatusPedido, cancelarPedido, listarPedidos } from "../services/orderService";
import { getApiErrorMessage } from "../utils/errors";
import { formatCurrency, formatDate, getId, shortId } from "../utils/format";
import { podeCancelar, proximosStatus, STATUS_PEDIDO } from "../utils/orderStatus";

const ITENS_POR_PAGINA = 10;

/*
 * LISTAGEM DE PEDIDOS
 *
 * A separação entre "meus pedidos" e "todos os pedidos" é feita pelo backend:
 * a mesma rota GET /orders devolve apenas os pedidos do usuário autenticado
 * quando ele não é administrador. O frontend não filtra isso por conta própria,
 * pois seria uma regra de segurança no lugar errado.
 */
export default function PedidosPage() {
  const { ehAdmin } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [statusFiltro, setStatusFiltro] = useState("");
  const [pagina, setPagina] = useState(1);

  // Pedido exibido no modal de detalhes.
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await listarPedidos({
        status: statusFiltro || undefined,
        page: pagina,
        limit: ITENS_POR_PAGINA,
      });

      const lista = Array.isArray(resposta) ? resposta : resposta.data || [];
      setPedidos(lista);
      setTotalPaginas(Array.isArray(resposta) ? 1 : resposta.totalPages || 1);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível carregar os pedidos."));
      setPedidos([]);
    } finally {
      setCarregando(false);
    }
  }, [statusFiltro, pagina]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  /*
   * CANCELAMENTO
   * Pedimos confirmação e só então chamamos a API.
   * A devolução do estoque é feita pelo backend.
   */
  async function handleCancelar(pedido) {
    if (!window.confirm("Tem certeza que deseja cancelar este pedido?")) return;

    try {
      await cancelarPedido(getId(pedido));
      setMensagem("Pedido cancelado.");
      setErro("");
      carregar();
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível cancelar o pedido."));
    }
  }

  /*
   * ALTERAÇÃO DE STATUS (administrador)
   * O select oferece apenas transições consideradas válidas na interface
   * (ver utils/orderStatus.js). A validação final é do backend.
   */
  async function handleAlterarStatus(pedido, novoStatus) {
    if (!novoStatus) return;

    try {
      await alterarStatusPedido(getId(pedido), novoStatus);
      setMensagem("Status atualizado.");
      setErro("");
      carregar();
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível alterar o status do pedido."));
    }
  }

  // Alguns backends devolvem itemsCount; se não vier, contamos os itens recebidos.
  function quantidadeItens(pedido) {
    if (typeof pedido.itemsCount === "number") return pedido.itemsCount;
    return Array.isArray(pedido.items) ? pedido.items.length : "-";
  }

  return (
    <AppLayout titulo={ehAdmin ? "Pedidos (todos)" : "Meus pedidos"}>
      <div className="filters">
        <Select
          id="status"
          label="Status"
          value={statusFiltro}
          onChange={(evento) => {
            setStatusFiltro(evento.target.value);
            setPagina(1);
          }}
        >
          <option value="">Todos</option>
          {STATUS_PEDIDO.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>

      <SuccessMessage mensagem={mensagem} />
      <ErrorMessage mensagem={erro} onRetry={carregar} />

      {carregando && <Loading texto="Carregando pedidos..." />}

      {!carregando && !erro && pedidos.length === 0 && (
        <EmptyState texto="Nenhum pedido encontrado." />
      )}

      {!carregando && pedidos.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Pedido</th>
                {ehAdmin && <th>Usuário</th>}
                <th>Data</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={getId(pedido)}>
                  <td>{shortId(getId(pedido))}</td>
                  {ehAdmin && <td>{pedido.user?.name || pedido.userName || "-"}</td>}
                  <td>{formatDate(pedido.createdAt)}</td>
                  <td>{quantidadeItens(pedido)}</td>
                  <td>{formatCurrency(pedido.total)}</td>
                  <td>{pedido.status}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPedidoSelecionado(pedido)}
                    >
                      Detalhes
                    </button>

                    {podeCancelar(pedido.status) && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelar(pedido)}
                      >
                        Cancelar
                      </button>
                    )}

                    {/* Administrador altera o status; estados finais não têm opções. */}
                    {ehAdmin && proximosStatus(pedido.status).length > 0 && (
                      <select
                        aria-label="Alterar status do pedido"
                        defaultValue=""
                        onChange={(evento) => handleAlterarStatus(pedido, evento.target.value)}
                      >
                        <option value="">Alterar status</option>
                        {proximosStatus(pedido.status).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onMudarPagina={setPagina} />

      <Modal
        aberto={Boolean(pedidoSelecionado)}
        titulo="Detalhes do pedido"
        onFechar={() => setPedidoSelecionado(null)}
      >
        {pedidoSelecionado && <PedidoDetalhe pedidoId={getId(pedidoSelecionado)} />}
      </Modal>
    </AppLayout>
  );
}