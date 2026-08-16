import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";
import Input from "../components/Input";
import { useAuth } from "../contexts/AuthContext";
import { getApiErrorMessage } from "../utils/errors";
import { isEmailValido } from "../utils/validators";

/*
 * TELA DE LOGIN
 *
 * Fluxo: valida os campos no frontend, chama a API através do AuthContext e,
 * conforme o perfil retornado, redireciona:
 *   administrador  -> /dashboard
 *   usuário comum  -> /produtos
 */
export default function LoginPage() {
  const { entrar } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", senha: "" });
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState("");
  const [enviando, setEnviando] = useState(false);

  function handleChange(evento) {
    const { name, value } = evento.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
  }

  // Validação local: evita requisições desnecessárias ao backend.
  function validar() {
    const novosErros = {};

    if (!form.email.trim()) novosErros.email = "E-mail é obrigatório.";
    else if (!isEmailValido(form.email)) novosErros.email = "E-mail inválido.";

    if (!form.senha) novosErros.senha = "Senha é obrigatória.";

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErroApi("");

    if (!validar()) return;

    setEnviando(true);

    try {
      const usuario = await entrar(form.email.trim(), form.senha);

      // O destino depende do perfil devolvido pelo backend.
      if (usuario?.role === "admin") {
        navigate({ to: "/dashboard", replace: true });
      } else {
        navigate({ to: "/produtos", replace: true });
      }
    } catch (error) {
      setErroApi(getApiErrorMessage(error, "Não foi possível entrar. Verifique suas credenciais."));
    } finally {
      // O loading é encerrado sempre, inclusive em caso de erro.
      setEnviando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Lions Market</h1>
        <p className="auth-subtitle">Acesse o sistema com suas credenciais.</p>

        <ErrorMessage mensagem={erroApi} />

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="email"
            name="email"
            label="E-mail"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={erros.email}
            autoComplete="email"
          />

          <Input
            id="senha"
            name="senha"
            label="Senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            error={erros.senha}
            autoComplete="current-password"
          />

          <div className="form-actions">
            <Button type="submit" loading={enviando} loadingText="Entrando...">
              Entrar
            </Button>
            <Link to="/cadastro" className="btn btn-secondary">
              Criar conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}