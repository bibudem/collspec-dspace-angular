import React, { useEffect, useState } from 'react';

/*
 * Indicateur de chargement des pages dans Mirador.
 * S'appuie sur les événements d'OpenSeadragon : affiché quand une page est ajoutée,
 * masqué quand toutes ses tuiles visibles sont chargées.
 */

const SHOW_DELAY = 300; // évite un clignotement quand l'image est déjà en cache
const MAX_WAIT = 30000; // sécurité si une tuile ne répond jamais

const lang = new URLSearchParams(window.location.search).get('lang');
const LABEL = lang === 'en' ? 'Loading page…' : 'Chargement de la page…';

function TileLoader({ viewer }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!viewer) return undefined;

    // Pages ajoutées dont le premier chargement n'est pas terminé (2 en vue livre)
    const pending = new Set();
    let showTimer;
    let maxTimer;

    const update = () => {
      clearTimeout(showTimer);
      if (pending.size === 0) {
        clearTimeout(maxTimer);
        setVisible(false);
        return;
      }
      showTimer = setTimeout(() => setVisible(true), SHOW_DELAY);
      clearTimeout(maxTimer);
      maxTimer = setTimeout(() => {
        pending.clear();
        update();
      }, MAX_WAIT);
    };

    // Seul le premier chargement compte : le zoom ne réaffiche pas l'indicateur
    const onFullyLoaded = (event) => {
      if (!event.fullyLoaded) return;
      event.eventSource.removeHandler('fully-loaded-change', onFullyLoaded);
      pending.delete(event.eventSource);
      update();
    };

    const onAddItem = ({ item }) => {
      if (item.getFullyLoaded()) return;
      pending.add(item);
      item.addHandler('fully-loaded-change', onFullyLoaded);
      update();
    };

    const onRemoveItem = ({ item }) => {
      item.removeHandler('fully-loaded-change', onFullyLoaded);
      pending.delete(item);
      update();
    };

    const onFailed = () => {
      pending.clear();
      update();
    };

    viewer.world.addHandler('add-item', onAddItem);
    viewer.world.addHandler('remove-item', onRemoveItem);
    viewer.addHandler('add-item-failed', onFailed);

    // Pages déjà présentes au moment où le plugin reçoit le viewer
    for (let i = 0; i < viewer.world.getItemCount(); i++) {
      onAddItem({ item: viewer.world.getItemAt(i) });
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(maxTimer);
      pending.forEach((item) => item.removeHandler('fully-loaded-change', onFullyLoaded));
      viewer.world.removeHandler('add-item', onAddItem);
      viewer.world.removeHandler('remove-item', onRemoveItem);
      viewer.removeHandler('add-item-failed', onFailed);
    };
  }, [viewer]);

  // La région reste dans le DOM pour que l'annonce aux lecteurs d'écran fonctionne
  return React.createElement(
    'div',
    {
      className: `mirador-tile-loader${visible ? ' is-visible' : ''}`,
      role: 'status',
      'aria-live': 'polite',
    },
    visible && React.createElement(
      'div',
      { className: 'mirador-tile-loader__pastille' },
      React.createElement('span', { className: 'mirador-tile-loader__spinner', 'aria-hidden': 'true' }),
      React.createElement('span', null, LABEL),
    ),
  );
}

export default {
  target: 'OpenSeadragonViewer',
  mode: 'add',
  component: TileLoader,
};
