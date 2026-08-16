/* Mensagem de sucesso usada após salvar formulários. */
export default function SuccessMessage({ mensagem }) {
  if (!mensagem) return null;

  return (
    <div className="alert alert-success" role="status">
      {mensagem}
    </div>
  );
}