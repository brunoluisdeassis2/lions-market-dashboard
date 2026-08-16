import api from "./api";

/*
 * Requisições relacionadas à autenticação.
 * Cada serviço concentra as chamadas de um recurso do backend.
 */

// POST /auth/login -> espera { token, user }
export async function login(email, senha) {
  const { data } = await api.post("/auth/login", { email, password: senha });
  return data;
}

// POST /auth/register -> cadastro público, sempre cria usuário comum no backend.
export async function register({ nome, email, senha }) {
  const { data } = await api.post("/auth/register", {
    name: nome,
    email,
    password: senha,
  });
  return data;
}

// GET /auth/me -> valida o token atual e devolve o usuário logado.
export async function getPerfilAtual() {
  const { data } = await api.get("/auth/me");
  return data;
}

// PATCH /users/me -> atualização do próprio perfil (nome, e-mail e senha).
export async function atualizarMeuPerfil(payload) {
  const { data } = await api.patch("/users/me", payload);
  return data;
}