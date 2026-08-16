import api from "./api";

/*
 * Requisições de pedidos.
 *
 * Importante: o frontend NÃO envia o valor total do pedido.
 * Enviamos apenas os produtos e as quantidades; o backend consulta o preço,
 * valida o estoque, calcula o total e dá baixa no estoque.
 */
export async function listarPedidos(params) {
  const { data } = await api.get("/orders", { params });
  return data;
}

export async function obterPedido(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

// itens = [{ productId, quantity }]
export async function criarPedido(itens) {
  const { data } = await api.post("/orders", { items: itens });
  return data;
}

// Somente administradores usam esta rota (o backend valida o perfil).
export async function alterarStatusPedido(id, status) {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data;
}

// O backend é responsável por devolver o estoque ao cancelar.
export async function cancelarPedido(id) {
  const { data } = await api.patch(`/orders/${id}/cancel`);
  return data;
}