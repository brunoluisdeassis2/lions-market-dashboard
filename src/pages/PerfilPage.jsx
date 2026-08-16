import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";
import Input from "../components/Input";
import SuccessMessage from "../components/SuccessMessage";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { atualizarMeuPerfil } from "../services/authService";
import { getApiErrorMessage } from "../utils/errors";
import { isEmailValido } from "../utils/validators";

/*
 * PERFIL DO USUÁRIO
 *
 * Permite editar nome, e-mail e senha do próprio usuário.
 * Não existe campo de perfil (role) aqui: um usuário comum nunca pode
 * se promover a administrador. O backend também ignora esse campo.
 */
export default function PerfilPage() {
  const { usuario, ehAdmin, atualizarUsuarioLocal, sair } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: usuario?.name || "",
    email: usuario?.email || "",
    senha: "",
    confirmacao: "",
  });

  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  function handleChange(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  function validar() {
    const novosErros = {};

    if (!form.nome.trim()) novosErros.nome = "Nome é obrigatório.";

    if (!form.email.trim()) novosErros.email = "E-mail é obrigatório.";
    else if (!isEmailValido(form.email)) novosErros.email = "E-mail inválido.";

    // A senha é opcional: só validamos se o usuário quiser trocá-la.
    if (form.senha) {
      if (form.senha.length < 6) novosErros.senha = "A senha deve ter ao menos 6 caracteres.";
      if (form.confirmacao !== form.senha) novosErros.confirmacao = "As senhas não conferem.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErroApi("");
    setMensagem("");

    if (!validar()) return;

    setSalvando(true);

    try {
      // Montamos o payload sem a senha quando ela não foi informada.
      const payload = { name: form.nome.trim(), email: form.email.trim() };
      if (form.senha) payload.password = form.senha;

      const atualizado = await atualizarMeuPerfil(payload);

      // Atualizamos o contexto para o cabeçalho refletir o novo nome.
      atualizarUsuarioLocal(atualizado.user ?? atualizado);
      setForm((anterior) => ({ ...anterior, senha: "", confirmacao: "" }));
      setMensagem("Perfil atualizado com sucesso.");
    } catch (error) {
      setErroApi(getApiErrorMessage(error, "Não foi possível atualizar o perfil."));
    } finally {
      setSalvando(false);
    }
  }

  function handleLogout() {
    sair();
    navigate({ to: "/login", replace: true });
  }

  return (
    <AppLayout titulo="Meu perfil">
      <p className="state-message">
        Perfil de acesso: <strong>{ehAdmin ? "Administrador" : "Usuário comum"}</strong>
      </p>

      <SuccessMessage mensagem={mensagem} />
      <ErrorMessage mensagem={erroApi} />

      <form className="form-box" onSubmit={handleSubmit} noValidate>
        <Input
          id="perfil-nome"
          name="nome"
          label="Nome"
          value={form.nome}
          onChange={handleChange}
          error={erros.nome}
        />
        <Input
          id="perfil-email"
          name="email"
          label="E-mail"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={erros.email}
        />
        <Input
          id="perfil-senha"
          name="senha"
          label="Nova senha (opcional)"
          type="password"
          value={form.senha}
          onChange={handleChange}
          error={erros.senha}
          autoComplete="new-password"
        />
        <Input
          id="perfil-confirmacao"
          name="confirmacao"
          label="Confirmar nova senha"
          type="password"
          value={form.confirmacao}
          onChange={handleChange}
          error={erros.confirmacao}
          autoComplete="new-password"
        />

        <div className="form-actions">
          <Button type="submit" loading={salvando} loadingText="Salvando...">
            Salvar alterações
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            Sair da conta
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}