import { useState } from 'react';
import { Pencil, Trash2, Users } from 'lucide-react';
import { ResourceForm } from './ResourceForm';
import { resourceTypeLabel } from './resourceTypes';

export function ResourceList({ resources, loading, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  const handleUpdate = async (id, data) => {
    const ok = await onUpdate(id, data);
    if (ok) setEditingId(null);
    return ok;
  };

  return (
    <>
      {loading && <p>Carregando...</p>}
      {!loading && resources.length === 0 && <p>Nenhum espaço cadastrado ainda.</p>}
      <div className="item-list">
        {resources.map((res) =>
          editingId === res.id ? (
            <div key={res.id} className="item-card item-card-editing">
              <ResourceForm
                initialValues={res}
                onSubmit={(data) => handleUpdate(res.id, data)}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div key={res.id} className="item-card">
              <div className="item-details">
                <h4>{res.name}</h4>
                <p>
                  Tipo: {resourceTypeLabel(res.type)} |{' '}
                  <Users size={14} style={{ display: 'inline' }} /> Capacidade: {res.capacity}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-outline-primary"
                  onClick={() => setEditingId(res.id)}
                  title="Editar Espaço"
                  aria-label={`Editar espaço ${res.name}`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="btn-outline-danger"
                  onClick={() => onDelete(res)}
                  title="Excluir Espaço"
                  aria-label={`Excluir espaço ${res.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}
