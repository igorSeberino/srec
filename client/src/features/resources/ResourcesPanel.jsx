import { api } from '../../services/api';
import { cascadeWarning } from './cascadeWarning';
import { ResourceForm } from './ResourceForm';
import { ResourceList } from './ResourceList';

export function ResourcesPanel({
  resources,
  loading,
  reloadResources,
  reloadReservations,
  notify,
}) {
  const save = async (action, successText) => {
    try {
      await action();
      notify(successText);
      reloadResources();
      return true;
    } catch (err) {
      notify(err.message, 'error');
      return false;
    }
  };

  const handleCreate = (data) =>
    save(() => api.createResource(data), 'Espaço cadastrado com sucesso!');

  // Corpo completo: o PUT atual exige todos os campos (ver BE-05).
  const handleUpdate = (id, data) =>
    save(() => api.updateResource(id, data), 'Espaço atualizado com sucesso!');

  const handleDelete = async (resource) => {
    // Conta na hora, com dados frescos: sem saber o impacto, nao exclui.
    let current;
    try {
      current = await api.getReservations();
    } catch (err) {
      notify(`Não foi possível verificar as reservas do espaço: ${err.message}`, 'error');
      return;
    }
    if (!window.confirm(cascadeWarning(resource, current))) return;
    try {
      await api.deleteResource(resource.id);
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
        <ResourceList
          resources={resources}
          loading={loading}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
