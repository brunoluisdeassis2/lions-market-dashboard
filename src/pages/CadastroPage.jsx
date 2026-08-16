import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";
import Input from "../components/Input";
import { useAuth } from "../contexts/AuthContext";
import { getApiErrorMessage } from "../utils/errors";
import { isEmailValido } from "../utils/validators";

/*
 * TELA DE CADASTRO
 *
 * Observação importante: não existe campo de perfil neste formulário.
 * O cadastro público sempre cria um usuário comum — quem define perfis
 * administrativos é o backend.
 */
export default function CadastroPage() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmacao: "" });
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState("");
  const [enviando, setEnviando] = useState(false);

  function handleChange(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  function validar() {
    const novosErros = {};

    if (!form.nome.trim()) novosErros.nome = "Nome é obrigatório.";

    if (!form.email.trim()) novosErros.email = "E-mail é obrigatório.";
    else if (!isEmailValido(form.email)) novosErros.email = "E-mail inválido.";

    if (!form.senha) novosErros.senha = "Senha é obrigatória.";
    else if (form.senha.length < 6) novosErros.senha = "A senha deve ter ao menos 6 caracteres.";

    if (form.confirmacao !== form.senha) novosErros.confirmacao = "As senhas não conferem.";

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErroApi("");

    if (!validar()) return;

    setEnviando(true);

    try {
      await cadastrar({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
      });

      // Após cadastrar não fazemos login automático: o usuário vai para /login.
      navigate({ to: "/login", replace: true });
    } catch (error) {
      setErroApi(getApiErrorMessage(error, "Não foi possível criar a conta. Verifique os dados."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Criar conta</h1>
        <p className="auth-subtitle">Preencha os dados para criar seu acesso.</p>

        <ErrorMessage mensagem={erroApi} />

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="nome"
            name="nome"
            label="Nome"
            value={form.nome}
            onChange={handleChange}
            error={erros.nome}
          />
          <Input
            id="email"
            name="email"
            label="E-mail"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={erros.email}
          />
          <Input
            id="senha"
            name="senha"
            label="Senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            error={erros.senha}
          />
          <Input
            id="confirmacao"
            name="confirmacao"
            label="Confirmação de senha"
            type="password"
            value={form.confirmacao}
            onChange={handleChange}
            error={erros.confirmacao}
          />

          <div className="form-actions">
            <Button type="submit" loading={enviando} loadingText="Cadastrando...">
              Cadastrar
            </Button>
            <Link to="/login" className="btn btn-secondary">
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}