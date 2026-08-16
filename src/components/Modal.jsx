/*
 * Modal simples usado nos formulários de produto e nos detalhes do pedido.
 * Não usamos biblioteca externa: apenas uma sobreposição com o conteúdo.
 */
export default function Modal({ aberto, titulo, onFechar, children }) {
  if (!aberto) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="modal">
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onFechar}>
            Fechar
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}