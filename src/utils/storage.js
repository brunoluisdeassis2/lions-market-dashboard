/*
 * Funções utilitárias para guardar o token JWT e o usuário no navegador.
 *
 * Observação importante: o localStorage NÃO é usado como substituto do backend.
 * Ele guarda apenas o token e uma cópia do usuário para que a sessão sobreviva
 * ao recarregamento da página. A fonte da verdade continua sendo a API.
 *
 * Os acessos são protegidos com "typeof window" porque este projeto renderiza
 * no servidor: lá o objeto window não existe.
 */
const TOKEN_KEY = "lions.token";
const USER_KEY = "lions.user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  // Se o conteúdo estiver corrompido, preferimos limpar a sessão a quebrar a tela.
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}