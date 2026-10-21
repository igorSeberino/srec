import { useState } from 'react';
import { Feedback } from './components/Feedback';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { ReservationsPanel } from './features/reservations/ReservationsPanel';
import { ResourcesPanel } from './features/resources/ResourcesPanel';
import { useFeedback } from './hooks/useFeedback';
import { useReservations } from './hooks/useReservations';
import { useResources } from './hooks/useResources';

const TABS = [
  { id: 'resources', label: 'Espaços e Salas' },
  { id: 'reservations', label: 'Agendamentos' },
];

function App() {
  const [activeTab, setActiveTab] = useState('resources');
  const { message, showFeedback } = useFeedback();
  const resources = useResources(showFeedback);
  const reservations = useReservations(showFeedback);

  return (
    <div>
      <Header />
      <div className="container">
        <Feedback message={message} />
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'resources' && (
          <ResourcesPanel
            resources={resources.resources}
            loading={resources.loading}
            reloadResources={resources.reload}
            reloadReservations={reservations.reload}
            notify={showFeedback}
          />
        )}

        {activeTab === 'reservations' && (
          <ReservationsPanel
            resources={resources.resources}
            reservations={reservations.reservations}
            loading={reservations.loading}
            reloadReservations={reservations.reload}
            notify={showFeedback}
          />
        )}
      </div>
    </div>
  );
}

export default App;
