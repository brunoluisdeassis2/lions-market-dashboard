import { useEffect, useState } from "react";

import ErrorMessage from "./ErrorMessage";
import Loading from "./Loading";
import { obterPedido } from "../services/orderService";
import { getApiErrorMessage } from "../utils/errors";
import { formatCurrency, formatDate, shortId } from "../utils/format";

/*
 * DETALHES DO PEDIDO
 *
 * Buscamos o pedido completo pelo id (GET /orders/:id) porque a listagem
 * pode vir resumida.
 *
 * Regra importante: o preço unitário exibido é o preço REGISTRADO no pedido
 * (item.unitPrice). Nunca recalculamos com o preço atual do produto, senão
 * pedidos antigos mudariam de valor quando o produto sofresse reajuste.
 */
export default function PedidoDetalhe({ pedidoId }) {
  const [pedido, setPedido] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    setCarregando(true);
    setErro("");

    obterPedido(pedidoId)
      .then((dados) => {
        if (ativo) setPedido(dados);
      })
      .catch((error) => {
        if (ativo) setErro(getApiErrorMessage(error, "Não foi possível carregar o pedido."));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    // Evita atualizar o estado se o modal for fechado antes da resposta.
    return () => {
      ativo = false;
    };
  }, [pedidoId]);

  if (carregando) return <Loading texto="Carregando pedido..." />;
  if (erro) return <ErrorMessage mensagem={erro} />;
  if (!pedido) return null;

  const itens = Array.isArray(pedido.items) ? pedido.items : [];

  return (
    <div>
      <table className="table table-details">
        <tbody>
          <tr>
            <th>Pedido</th>
            <td>{shortId(pedido._id ?? pedido.id)}</td>
          </tr>
          <tr>
            <th>Usuário</th>
            <td>{pedido.user?.name || pedido.userName || "-"}</td>
          </tr>
          <tr>
            <th>Data</th>
            <td>{formatDate(pedido.createdAt)}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td>{pedido.status}</td>
          </tr>
        </tbody>
      </table>

      <h3 className="section-title">Itens</h3>

      <table className="table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Preço unitário</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, indice) => {
            // O subtotal também pode vir calculado do backend; se não vier,
            // apenas multiplicamos os valores JÁ registrados no pedido.
            const subtotal =
              item.subtotal !== undefined
                ? item.subtotal
                : Number(item.unitPrice) * Number(item.quantity);

            return (
              <tr key={item._id || indice}>
                <td>{item.product?.name || item.productName || "-"}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{formatCurrency(subtotal)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="total-line">
        <strong>Valor total:</strong> {formatCurrency(pedido.total)}
      </p>
    </div>
  );
}