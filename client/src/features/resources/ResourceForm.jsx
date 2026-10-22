import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Card } from '../../components/Card';
import { FormField } from '../../components/FormField';
import { SubmitButton } from '../../components/SubmitButton';
import { fieldProps } from '../../components/fieldProps';
import { RESOURCE_TYPE } from '../../constants/domain';
import { useSubmit } from '../../hooks/useSubmit';
import { hasErrors, serverFieldErrors } from '../../lib/validation';
import { RESOURCE_ERROR_FIELDS, validateResource } from './validation';

// Literal ids (not useId) so tests and DevTools can reference them; FE-05
// passes its own idPrefix to render an edit form next to this one.
export function ResourceForm({ idPrefix = 'resource-form', onCreate, onSuccess, onError }) {
  const ID = {
    name: `${idPrefix}-name`,
    type: `${idPrefix}-type`,
    capacity: `${idPrefix}-capacity`,
  };

  const [name, setName] = useState('');
  const [type, setType] = useState(RESOURCE_TYPE.WORKSTATION);
  const [capacity, setCapacity] = useState(1);
  const [errors, setErrors] = useState({});

  const { isSubmitting, submit } = useSubmit(async () => {
    const values = { name, type, capacity };
    const clientErrors = validateResource(values);
    setErrors(clientErrors);
    if (hasErrors(clientErrors)) return; // no request goes out

    try {
      await onCreate(values);
      setName('');
      setCapacity(1);
      onSuccess('Espaço cadastrado com sucesso!');
    } catch (err) {
      setErrors(serverFieldErrors(err, RESOURCE_ERROR_FIELDS));
      onError(err.message);
    }
  });

  return (
    <Card title="Novo Espaço">
      {/* noValidate: our messages replace the browser's native bubbles. */}
      <form onSubmit={submit} noValidate>
        <FormField id={ID.name} label="Nome do Espaço / Estação" error={errors.name}>
          <input
            {...fieldProps(ID.name, errors.name)}
            type="text"
            placeholder="Ex: Sala de Reunião Alpha"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FormField>
        <FormField id={ID.type} label="Tipo" error={errors.type}>
          <select
            {...fieldProps(ID.type, errors.type)}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value={RESOURCE_TYPE.WORKSTATION}>Estação de Trabalho</option>
            <option value={RESOURCE_TYPE.MEETING_ROOM}>Sala de Reunião</option>
          </select>
        </FormField>
        <FormField id={ID.capacity} label="Capacidade (pessoas)" error={errors.capacity}>
          <input
            {...fieldProps(ID.capacity, errors.capacity)}
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </FormField>
        <SubmitButton
          isSubmitting={isSubmitting}
          idleLabel="Cadastrar Espaço"
          busyLabel="Cadastrando..."
          icon={<PlusCircle size={18} />}
        />
      </form>
    </Card>
  );
}
