import { api } from '../../services/api';
import { ResourceForm } from './ResourceForm';
import { ResourceList } from './ResourceList';

export function ResourcesPanel({
  resources,
  loading,
  reloadResources,
  reloadReservations,
  notify,
}) {
  const handleCreate = async (data) => {
    try {
      await api.createResource(data);
      notify('Espaço cadastrado com sucesso!');
      reloadResources();
      return true;
    } catch (err) {
      notify(err.message, 'error');
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente remover este espaço?')) return;
    try {
      await api.deleteResource(id);
      notify('Espaço removido com sucesso!');
      // ON DELETE CASCADE remove as reservas do espaço junto.
      reloadResources();
      reloadReservations();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3 className="card-title">Novo Espaço</h3>
        <ResourceForm onSubmit={handleCreate} />
      </div>
      <div className="card">
        <h3 className="card-title">Espaços Cadastrados</h3>
        <ResourceList resources={resources} loading={loading} onDelete={handleDelete} />
      </div>
    </div>
  );
}
