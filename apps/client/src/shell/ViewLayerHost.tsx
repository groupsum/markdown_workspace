import React from 'react';
import { useSyncExternalStore } from 'react';
import { useClientRuntimeServices } from '../app/runtime/ClientRuntimeContext';

export const ViewLayerHost: React.FC = () => {
  const services = useClientRuntimeServices();
  const snapshot = useSyncExternalStore(services.views.subscribe, services.views.getSnapshot, services.views.getSnapshot);

  const openViews = React.useMemo(
    () => snapshot.views.filter((view) => snapshot.openViewIds.includes(view.id) && view.location !== 'main'),
    [snapshot.openViewIds, snapshot.views],
  );

  return (
    <>
      {openViews.map((view) => (
        <React.Fragment key={view.id}>
          {view.render({
            viewId: view.id,
            input: snapshot.inputs[view.id],
            isOpen: true,
            close: () => services.views.close(view.id),
            focus: () => services.views.focus(view.id),
          }) as React.ReactNode}
        </React.Fragment>
      ))}
    </>
  );
};
