/* Campo de seleção simples, seguindo o mesmo padrão visual do Input. */
export default function Select({ id, label, error, children, ...rest }) {
  return (
    <div className="form-field">
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} {...rest}>
        {children}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}