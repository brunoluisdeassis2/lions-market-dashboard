import api from "./api";

/*
 * Requisições de produtos.
 *
 * Os filtros, a busca, a ordenação e a paginação são enviados como
 * query params para o backend, que é quem realmente filtra os dados.
 */
export async function listarProdutos(params) {
  const { data } = await api.get("/products", { params });
  return data;
}

export async function obterProduto(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function criarProduto(payload) {
  const { data } = await api.post("/products", payload);
  return data;
}

export async function atualizarProduto(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
}

export async function excluirProduto(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

// Desativar/ativar é apenas uma atualização do campo "active".
export async function alterarStatusProduto(id, ativo) {
  const { data } = await api.patch(`/products/${id}`, { active: ativo });
  return data;
}