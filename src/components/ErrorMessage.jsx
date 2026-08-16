/*
 * Mensagem de erro amigável.
 * Opcionalmente exibe um botão "Tentar novamente" para refazer a requisição.
 */
export default function ErrorMessage({ mensagem, onRetry }) {
  if (!mensagem) return null;

  return (
    <div className="alert alert-error" role="alert">
      <span>{mensagem}</span>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}