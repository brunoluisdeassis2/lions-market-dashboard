/*
 * Botão padrão da aplicação.
 *
 * Suporta uma variante visual discreta ("primary", "secondary", "danger")
 * e um estado de carregamento que desabilita o botão e troca o texto.
 */
export default function Button({
  children,
  variant = "primary",
  loading = false,
  loadingText,
  type = "button",
  disabled,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? loadingText || "Aguarde..." : children}
    </button>
  );
}