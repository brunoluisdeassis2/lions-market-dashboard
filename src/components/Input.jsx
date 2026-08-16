/*
 * Campo de formulário com label e mensagem de erro logo abaixo do input.
 * O uso de htmlFor/id garante acessibilidade básica (clicar no label foca o campo).
 */
export default function Input({ id, label, error, type = "text", ...rest }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} aria-invalid={error ? "true" : "false"} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}