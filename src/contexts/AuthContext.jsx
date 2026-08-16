import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import * as authService from "../services/authService";
import { clearSession, getStoredUser, getToken, setStoredUser, setToken } from "../utils/storage";

/*
 * CONTEXTO DE AUTENTICAÇÃO (Context API)
 *
 * Responsabilidades:
 * - guardar o usuário autenticado e o token;
 * - executar login, cadastro e logout;
 * - verificar a sessão ao abrir/recarregar a aplicação;
 * - disponibilizar essas informações para qualquer componente.
 *
 * Mantido simples de propósito: um estado com o usuário, um estado de
 * carregamento e funções que chamam os serviços.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  // "carregando" indica que ainda estamos verificando a sessão salva.
  // Enquanto for true, as rotas privadas não devem redirecionar para /login,
  // senão o usuário logado seria expulso a cada recarregamento da página.
  const [carregando, setCarregando] = useState(true);

  /*
   * Verificação da sessão.
   *
   * Roda dentro de useEffect (portanto apenas no navegador, já que o projeto
   * também renderiza no servidor). Se existir um token salvo:
   *  1) usamos imediatamente o usuário guardado para a tela não "piscar";
   *  2) confirmamos com a API (GET /auth/me) se o token continua válido.
   * Se a API recusar o token, limpamos a sessão.
   */
  useEffect(() => {
    const token = getToken();

    if (!token) {
      setCarregando(false);
      return;
    }

    setUsuario(getStoredUser());

    let ativo = true;

    authService
      .getPerfilAtual()
      .then((dados) => {
        if (!ativo) return;
        const usuarioApi = dados.user ?? dados;
        setUsuario(usuarioApi);
        setStoredUser(usuarioApi);
      })
      .catch(() => {
        // Token expirado/inválido ou API indisponível: encerramos a sessão local.
        if (!ativo) return;
        clearSession();
        setUsuario(null);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  /*
   * LOGIN
   * Envia as credenciais, guarda o token JWT e o usuário retornados
   * e devolve o usuário para que a tela decida o redirecionamento
   * (administrador vai para o Dashboard, usuário comum para Produtos).
   */
  const entrar = useCallback(async (email, senha) => {
    const dados = await authService.login(email, senha);

    setToken(dados.token);
    const usuarioApi = dados.user ?? null;
    setStoredUser(usuarioApi);
    setUsuario(usuarioApi);

    return usuarioApi;
  }, []);

  // CADASTRO: apenas repassa ao backend. O perfil é sempre definido lá.
  const cadastrar = useCallback(async (dadosFormulario) => {
    return authService.register(dadosFormulario);
  }, []);

  // LOGOUT: como o JWT é sem estado, basta descartar o token localmente.
  const sair = useCallback(() => {
    clearSession();
    setUsuario(null);
  }, []);

  // Atualiza o usuário no contexto depois de editar o próprio perfil.
  const atualizarUsuarioLocal = useCallback((novosDados) => {
    setUsuario(novosDados);
    setStoredUser(novosDados);
  }, []);

  /*
   * "ehAdmin" é derivado do usuário retornado pela API.
   * O frontend usa isso apenas para mostrar/esconder itens da interface;
   * a autorização real acontece no backend em cada requisição.
   */
  const valor = useMemo(
    () => ({
      usuario,
      carregando,
      autenticado: Boolean(usuario),
      ehAdmin: usuario?.role === "admin",
      entrar,
      cadastrar,
      sair,
      atualizarUsuarioLocal,
    }),
    [usuario, carregando, entrar, cadastrar, sair, atualizarUsuarioLocal],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// Hook de acesso ao contexto. Evita repetir useContext(AuthContext) nas telas.
export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth precisa ser usado dentro de <AuthProvider>.");
  }

  return contexto;
}