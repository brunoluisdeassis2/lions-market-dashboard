/*
 * Tradução de erros técnicos do Axios para mensagens que o usuário entende.
 *
 * A ideia é nunca mostrar algo como
 *   "AxiosError: Request failed with status code 400"
 * e sim uma frase útil, mantendo o detalhe técnico apenas no console.
 */
export function getApiErrorMessage(error, mensagemPadrao = "Não foi possível completar a operação.") {
  // Erro de rede: o backend não respondeu (não está rodando, CORS, etc.).
  if (!error?.response) {
    return "Não foi possível conectar ao servidor. Verifique se a API está disponível.";
  }

  const { status, data } = error.response;

  // Se o backend enviar uma mensagem própria, ela é a mais precisa.
  if (data) {
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;
    // Alguns backends retornam { errors: [{ message }] }
    if (Array.isArray(data.errors) && data.errors[0]?.message) return data.errors[0].message;
  }

  if (status === 400 || status === 422) return "Dados inválidos. Verifique as informações enviadas.";
  if (status === 401) return "Sessão expirada ou credenciais inválidas.";
  if (status === 403) return "Você não tem permissão para executar esta ação.";
  if (status === 404) return "Registro não encontrado.";
  if (status >= 500) return "O servidor apresentou um erro. Tente novamente mais tarde.";

  return mensagemPadrao;
}