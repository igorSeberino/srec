// A regiao viva fica sempre montada: leitores de tela so anunciam mudancas
// em regioes que ja existiam no DOM antes do texto aparecer.
export function Feedback({ message }) {
  return (
    <div role="alert" aria-live="assertive" aria-atomic="true">
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
    </div>
  );
}
