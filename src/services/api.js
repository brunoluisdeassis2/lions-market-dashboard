import axios from "axios";

import { getToken, clearSession } from "../utils/storage";

/*
 * Camada central de comunicação com o backend REST (Node/Express).
 *
 * Decisão: existe UMA única instância do Axios no projeto inteiro.
 * Assim a URL da API, os cabeçalhos e o tratamento de erros ficam
 * concentrados em um só lugar, e nenhum componente precisa conhecer
 * o endereço do servidor.
 *
 * A URL vem da variável de ambiente VITE_API_URL (ver .env.example).
 * Se ela não estiver definida, usamos o padrão de desenvolvimento.
 */
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

/*
 * INTERCEPTOR DE REQUISIÇÃO
 *
 * Antes de qualquer requisição sair do frontend, verificamos se existe
 * um token JWT salvo no navegador. Se existir, ele é enviado no
 * cabeçalho Authorization no formato esperado pelo backend:
 *
 *   Authorization: Bearer <token>
 *
 * Fazer isso aqui evita repetir o cabeçalho em cada chamada de serviço.
 */
api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*
 * INTERCEPTOR DE RESPOSTA
 *
 * Trata de forma centralizada os erros que interessam a toda a aplicação:
 *
 * - 401 (token inválido/expirado): limpamos a sessão local. O redirecionamento
 *   para /login acontece naturalmente porque as rotas privadas verificam o
 *   usuário autenticado no AuthContext.
 *
 * Erros de validação (400/422) continuam subindo para quem chamou, pois cada
 * tela precisa exibir a mensagem no contexto correto do formulário.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearSession();
    }

    // Durante o desenvolvimento é útil ver o erro técnico completo no console,
    // enquanto o usuário final vê apenas a mensagem amigável na interface.
    if (import.meta.env.DEV) {
      console.error("[API]", error.config?.method, error.config?.url, error.message);
    }

    return Promise.reject(error);
  },
);

export default api;