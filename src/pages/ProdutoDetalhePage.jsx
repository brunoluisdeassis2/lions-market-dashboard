import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";

import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import SuccessMessage from "../components/SuccessMessage";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { obterProduto } from "../services/productService";
import { criarPedido } from "../services/orderService";
import { getApiErrorMessage } from "../utils/errors";
import { formatCurrency, formatDate, getId } from "../utils/format";

/*
 * DETALHES DO PRODUTO (/produtos/:id)
 *
 * Além de exibir os dados, permite ao usuário comum criar um pedido
 * informando a quantidade. Enviamos somente produto e quantidade —
 * o preço e o total são responsabilidade do backend.
 */
export default function ProdutoDetalhePage() {
  const { id } = useParams({ from: "/produtos/$id" });
  const { ehAdmin } = useAuth();

  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [quantidade, setQuantidade] = useState("1");
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const dados = await obterProduto(id);
      setProduto(dados);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível carregar o produto."));
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const disponivel = produto ? produto.active !== false && Number(produto.stock) > 0 : false;

  async function handleCriarPedido(evento) {
    evento.preventDefault();
    setMensagem("");

    const numero = Number(quantidade);

    // Validação simples antes de chamar a API.
    if (!Number.isInteger(numero) || numero <= 0) {
      setErro("Informe uma quantidade inteira maior que zero.");
      return;
    }

    setEnviandoPedido(true);
    setErro("");

    try {
      await criarPedido([{ productId: getId(produto), quantity: numero }]);
      setMensagem("Pedido criado com sucesso. Consulte em Pedidos.");
      carregar();
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível criar o pedido."));
    } finally {
      setEnviandoPedido(false);
    }
  }

  return (
    <AppLayout
      titulo="Detalhes do produto"
      acoes={
        <Link to="/produtos" className="btn btn-secondary">
          Voltar
        </Link>
      }
    >
      {carregando && <Loading texto="Carregando produto..." />}
      <ErrorMessage mensagem={erro} />
      <SuccessMessage mensagem={mensagem} />

      {!carregando && produto && (
        <>
          <table className="table table-details">
            <tbody>
              <tr>
                <th>Nome</th>
                <td>{produto.name}</td>
              </tr>
              <tr>
                <th>Descrição</th>
                <td>{produto.description || "-"}</td>
              </tr>
              <tr>
                <th>Categoria</th>
                <td>{produto.category}</td>
              </tr>
              <tr>
                <th>Preço</th>
                <td>{formatCurrency(produto.price)}</td>
              </tr>
              <tr>
                <th>Estoque</th>
                <td>{produto.stock}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>
                  {produto.active === false
                    ? "Inativo"
                    : Number(produto.stock) <= 0
                      ? "Sem estoque"
                      : "Ativo"}
                </td>
              </tr>
              <tr>
                <th>Criado em</th>
                <td>{formatDate(produto.createdAt)}</td>
              </tr>
            </tbody>
          </table>

          {/* Administrador gerencia produtos na listagem; aqui apenas o
              usuário comum vê o formulário de pedido. */}
          {!ehAdmin && (
            <form className="inline-form" onSubmit={handleCriarPedido}>
              <div className="form-field">
                <label htmlFor="quantidade">Quantidade</label>
                <input
                  id="quantidade"
                  type="number"
                  min="1"
                  step="1"
                  value={quantidade}
                  onChange={(evento) => setQuantidade(evento.target.value)}
                  disabled={!disponivel}
                />
              </div>

              <Button type="submit" loading={enviandoPedido} loadingText="Enviando..." disabled={!disponivel}>
                Criar pedido
              </Button>

              {!disponivel && (
                <p className="state-message">
                  Este produto está indisponível e não permite criação de pedido.
                </p>
              )}
            </form>
          )}
        </>
      )}
    </AppLayout>
  );
}