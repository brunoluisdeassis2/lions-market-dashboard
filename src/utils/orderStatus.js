/*
 * Regras de exibição dos status de pedido.
 *
 * ATENÇÃO: isto é apenas apoio à interface. Quem decide de fato se uma
 * transição de status é permitida é o backend. Aqui só evitamos oferecer
 * ao administrador opções obviamente inválidas.
 */
export const STATUS_PEDIDO = ["PENDENTE", "PAGO", "CANCELADO", "FINALIZADO"];

// Transições consideradas válidas na interface.
const TRANSICOES = {
  PENDENTE: ["PAGO", "CANCELADO"],
  PAGO: ["FINALIZADO", "CANCELADO"],
  // Pedidos cancelados ou finalizados são estados finais: não voltam para PENDENTE.
  CANCELADO: [],
  FINALIZADO: [],
};

export function proximosStatus(statusAtual) {
  return TRANSICOES[statusAtual] || [];
}

// O usuário comum só pode cancelar pedidos que ainda não foram concluídos.
export function podeCancelar(status) {
  return status === "PENDENTE" || status === "PAGO";
}