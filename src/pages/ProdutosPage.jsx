import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import Select from "../components/Select";
import SuccessMessage from "../components/SuccessMessage";
import ProdutoForm from "../components/ProdutoForm";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  alterarStatusProduto,
  atualizarProduto,
  criarProduto,
  excluirProduto,
  listarProdutos,
} from "../services/productService";
import { criarPedido } from "../services/orderService";
import { getApiErrorMessage } from "../utils/errors";
import { formatCurrency, getId } from "../utils/format";

// Quantidade fixa de itens por página (o backend recebe isso como "limit").
const ITENS_POR_PAGINA = 10;

/*
 * LISTAGEM DE PRODUTOS
 *
 * Tela usada pelos dois perfis:
 * - usuário comum: consulta, filtra e cria pedido;
 * - administrador: além disso, cadastra, edita, desativa e exclui.
 *
 * Busca, filtros, ordenação e paginação são enviados ao backend como
 * query params. O frontend não filtra listas em memória, porque a
 * paginação real acontece no servidor.
 */
export default function ProdutosPage() {
  const { ehAdmin } = useAuth();

  const [produtos, setProdutos] = useState([]);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Estados dos filtros. "busca" é aplicada com debounce para não
  // disparar uma requisição a cada tecla digitada.
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [categoria, setCategoria] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [ordenacao, setOrdenacao] = useState("name");
  const [pagina, setPagina] = useState(1);

  // Controle do modal de cadastro/edição (somente administrador).
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  // Debounce da busca: espera 400ms sem digitação antes de consultar a API.
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
      const resposta = await listarProdutos({
        search: buscaAplicada || undefined,
        category: categoria || undefined,
        availability: disponibilidade || undefined,
        sort: ordenacao,
        page: pagina,
        limit: ITENS_POR_PAGINA,
      });

      /*
       * O backend pode responder de duas formas:
       *  - um array simples;
       *  - um objeto paginado { data, totalPages }.
       * Tratamos os dois casos para o frontend não depender do formato final.
       */
      const lista = Array.isArray(resposta) ? resposta : resposta.data || [];
      setProdutos(lista);
      setTotalPaginas(Array.isArray(resposta) ? 1 : resposta.totalPages || 1);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível carregar os produtos."));
      setProdutos([]);
    } finally {
      setCarregando(false);
    }
  }, [buscaAplicada, categoria, disponibilidade, ordenacao, pagina]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Regra visual: produto inativo ou sem estoque não permite criar pedido.
  function produtoDisponivel(produto) {
    return produto.active !== false && Number(produto.stock) > 0;
  }

  function textoStatus(produto) {
    if (produto.active === false) return "Inativo";
    if (Number(produto.stock) <= 0) return "Sem estoque";
    return "Ativo";
  }

  // Criação de pedido a partir da listagem: pedimos a quantidade e enviamos
  // apenas produto + quantidade. O total é calculado pelo backend.
  async function handleCriarPedido(produto) {
    const entrada = window.prompt(`Quantidade de "${produto.name}":`, "1");
    if (entrada === null) return;

    const quantidade = Number(entrada);
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      setErro("Informe uma quantidade inteira maior que zero.");
      return;
    }

    try {
      await criarPedido([{ productId: getId(produto), quantity: quantidade }]);
      setMensagem("Pedido criado com sucesso.");
      setErro("");
      carregar();
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível criar o pedido."));
    }
  }

  // Salvamento do formulário: decide entre criar (POST) e editar (PUT).
  async function handleSalvar(payload) {
    if (produtoEditando) {
      await atualizarProduto(getId(produtoEditando), payload);
      setMensagem("Produto atualizado com sucesso.");
    } else {
      await criarProduto(payload);
      setMensagem("Produto cadastrado com sucesso.");
    }

    setModalAberto(false);
    setProdutoEditando(null);
    carregar();
  }

  async function handleAlternarStatus(produto) {
    try {
      await alterarStatusProduto(getId(produto), produto.active === false);
      carregar();
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível alterar o status do produto."));
    }
  }

  async function handleExcluir(produto) {
    // Confirmação simples antes de uma ação destrutiva.
    if (!window.confirm(`Excluir o produto "${produto.name}"?`)) return;

    try {
      await excluirProduto(getId(produto));
      setMensagem("Produto excluído.");
      carregar();
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível excluir o produto."));
    }
  }

  return (
    <AppLayout
      titulo="Produtos"
      acoes={
        ehAdmin && (
          <Button
            onClick={() => {
              setProdutoEditando(null);
              setModalAberto(true);
            }}
          >
            Novo produto
          </Button>
        )
      }
    >
      {/* FILTROS */}
      <div className="filters">
        <div className="form-field">
          <label htmlFor="busca">Buscar por nome</label>
          <input
            id="busca"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Ex.: teclado"
          />
        </div>

        <Select
          id="categoria"
          label="Categoria"
          value={categoria}
          onChange={(evento) => {
            setCategoria(evento.target.value);
            setPagina(1);
          }}
        >
          <option value="">Todas</option>
          <option value="eletronicos">Eletrônicos</option>
          <option value="informatica">Informática</option>
          <option value="acessorios">Acessórios</option>
          <option value="casa">Casa</option>
          <option value="outros">Outros</option>
        </Select>

        <Select
          id="disponibilidade"
          label="Disponibilidade"
          value={disponibilidade}
          onChange={(evento) => {
            setDisponibilidade(evento.target.value);
            setPagina(1);
          }}
        >
          <option value="">Todos</option>
          <option value="available">Com estoque</option>
          <option value="unavailable">Sem estoque</option>
          <option value="inactive">Inativos</option>
        </Select>

        <Select
          id="ordenacao"
          label="Ordenar por"
          value={ordenacao}
          onChange={(evento) => {
            setOrdenacao(evento.target.value);
            setPagina(1);
          }}
        >
          <option value="name">Nome (A-Z)</option>
          <option value="-name">Nome (Z-A)</option>
          <option value="price">Menor preço</option>
          <option value="-price">Maior preço</option>
          <option value="-createdAt">Mais recentes</option>
        </Select>
      </div>

      <SuccessMessage mensagem={mensagem} />
      <ErrorMessage mensagem={erro} onRetry={carregar} />

      {/* ESTADOS DA INTERFACE: carregando / vazio / tabela */}
      {carregando && <Loading texto="Carregando produtos..." />}

      {!carregando && !erro && produtos.length === 0 && (
        <EmptyState texto="Nenhum produto encontrado." />
      )}

      {!carregando && produtos.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr key={getId(produto)}>
                  <td>{produto.name}</td>
                  <td>{produto.category}</td>
                  <td>{formatCurrency(produto.price)}</td>
                  <td>{produto.stock}</td>
                  <td>{textoStatus(produto)}</td>
                  <td className="actions">
                    <Link to="/produtos/$id" params={{ id: getId(produto) }}>
                      Detalhes
                    </Link>

                    {/* Usuário comum cria pedido; o botão fica desabilitado
                        quando o produto está inativo ou sem estoque. */}
                    {!ehAdmin && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={!produtoDisponivel(produto)}
                        onClick={() => handleCriarPedido(produto)}
                      >
                        Pedir
                      </button>
                    )}

                    {ehAdmin && (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setProdutoEditando(produto);
                            setModalAberto(true);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleAlternarStatus(produto)}
                        >
                          {produto.active === false ? "Ativar" : "Desativar"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleExcluir(produto)}
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onMudarPagina={setPagina} />

      {/* Modal com o formulário de produto (apenas administrador) */}
      <Modal
        aberto={modalAberto}
        titulo={produtoEditando ? "Editar produto" : "Novo produto"}
        onFechar={() => {
          setModalAberto(false);
          setProdutoEditando(null);
        }}
      >
        <ProdutoForm
          produto={produtoEditando}
          onSalvar={handleSalvar}
          onCancelar={() => {
            setModalAberto(false);
            setProdutoEditando(null);
          }}
        />
      </Modal>
    </AppLayout>
  );
}