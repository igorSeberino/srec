export function Feedback({ message }) {
  if (!message.text) return null;
  return <div className={`alert alert-${message.type}`}>{message.text}</div>;
}
