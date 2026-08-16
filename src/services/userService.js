import api from "./api";

/* Requisições de usuários — usadas apenas na área administrativa. */

export async function listarUsuarios(params) {
  const { data } = await api.get("/users", { params });
  return data;
}

// Usado para alterar perfil (role) e status (active) de um usuário.
export async function atualizarUsuario(id, payload) {
  const { data } = await api.patch(`/users/${id}`, payload);
  return data;
}

export async function excluirUsuario(id) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}