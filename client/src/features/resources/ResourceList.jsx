import { Trash2, Users } from 'lucide-react';
import { resourceTypeLabel } from './resourceTypes';

export function ResourceList({ resources, loading, onDelete }) {
  return (
    <>
      {loading && <p>Carregando...</p>}
      {!loading && resources.length === 0 && <p>Nenhum espaço cadastrado ainda.</p>}
      <div className="item-list">
        {resources.map((res) => (
          <div key={res.id} className="item-card">
            <div className="item-details">
              <h4>{res.name}</h4>
              <p>
                Tipo: {resourceTypeLabel(res.type)} |{' '}
                <Users size={14} style={{ display: 'inline' }} /> Capacidade: {res.capacity}
              </p>
            </div>
            <button
              className="btn-outline-danger"
              onClick={() => onDelete(res.id)}
              title="Excluir Espaço"
              aria-label={`Excluir espaço ${res.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
