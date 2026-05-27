import React from 'react';

/*
 * NIMA 2026-05-25
 *
 * Plugin Mirador maison pour gérer les libellés dans Collections spéciales.
 *
 * Filtre Mirador uniquement pour l’affichage.
 *
 * Objectif :
 * - Masquer en permanence les champs de contrôle "Community UUID"
 *   et "Collection UUID" dans Mirador.
 * - Appliquer des règles d’affichage selon le UUID de communauté
 *   et/ou le UUID de collection présent dans les métadonnées cachées.
 *
 * Important :
 * - Ce script ne modifie pas le manifeste IIIF.
 * - Il modifie seulement l’affichage dans le panneau ManifestInfo.
 * - Les libellés visibles doivent correspondre exactement aux constantes ci-dessous.
 */

const COMMUNITY_FIELD_LABEL = 'comm_uuid';
const COLLECTION_FIELD_LABEL = 'coll_uuid';

const COMMUNITY_RULES = {
  
  '5143566f-005d-4ef0-ae30-e4ea5c7c7296': {
    hideLabels: ['description'],
  },
  
  'f86ec7f4-1c69-498d-8f69-83f5af2e4d05': {
    hideLabels: ['description'],
  },
  
  '45763db4-8b08-4191-99be-c24ad7f06acf': {
    hideLabels: ['description'],
  },
  
  '38f7268d-96c8-474a-964b-925c7765fbec': {
    hideLabels: ['description'],
  },
  
  '4ef1b8f9-1b03-4251-8f16-848437fd007a': {
    hideLabels: ['description'],
  },
  
  /*
  '9d327a20-d05d-4c63-bfd2-8723b6cf708c': {
    hideLabels: ['description', 'Sujet(s)', 'Autre(s) Titre(s)'],
  },
  */
};

const COLLECTION_RULES = {
  
  'ee737cff-446f-42e0-a4e3-bc86cb50606a': {
    hideLabels: ['description'],
  },
  
  '2585cddd-7a80-4a3e-8140-741691aeadf9': {
    hideLabels: ['description'],
  },
  
  '3dae11e2-ec28-4b64-a447-7ab421b1f274': {
    hideLabels: ['description'],
  },
  
  '9b47874b-a388-4615-9766-b2acf52cca1d': {
    hideLabels: ['description'],
  },
  
  '535a320b-cd79-4ed5-a4e0-e1fb9e501bf6': {
    hideLabels: ['description', 'Sujet(s)', 'Autre(s) Titre(s)'],
  },
  
};

function labelToText(label) {
  if (!label) return '';

  if (typeof label === 'string') return label;

  if (Array.isArray(label)) return label.join(' ');

  if (typeof label === 'object') {
    return Object.values(label).flat().join(' ');
  }

  return String(label);
}

function valuesToText(values) {
  if (!values) return '';

  if (Array.isArray(values)) return values.join(' ');

  if (typeof values === 'object') {
    return Object.values(values).flat().join(' ');
  }

  return String(values);
}

function getControlValue(manifestMetadata, fieldLabel) {
  const controlEntry = manifestMetadata.find((entry) => {
    const label = labelToText(entry.label).trim();
    return label === fieldLabel;
  });

  if (!controlEntry) return null;

  return valuesToText(controlEntry.values).trim();
}

function getLabelsToHide(communityUuid, collectionUuid) {
  const labels = new Set();

  if (communityUuid && COMMUNITY_RULES[communityUuid]) {
    COMMUNITY_RULES[communityUuid].hideLabels.forEach((label) => labels.add(label));
  }

  if (collectionUuid && COLLECTION_RULES[collectionUuid]) {
    COLLECTION_RULES[collectionUuid].hideLabels.forEach((label) => labels.add(label));
  }

  return labels;
}

function shouldHide(entry, labelsToHide) {
  const label = labelToText(entry.label).trim();

  if (label === COMMUNITY_FIELD_LABEL) return true;
  if (label === COLLECTION_FIELD_LABEL) return true;

  return labelsToHide.has(label);
}

function HideManifestInfo(props) {
  const TargetComponent = props.TargetComponent;
  const targetProps = props.targetProps || {};
  const manifestMetadata = Array.isArray(props.manifestMetadata)
    ? props.manifestMetadata
    : [];

  if (!TargetComponent) return null;

  const communityUuid = getControlValue(manifestMetadata, COMMUNITY_FIELD_LABEL);
  const collectionUuid = getControlValue(manifestMetadata, COLLECTION_FIELD_LABEL);

  const labelsToHide = getLabelsToHide(communityUuid, collectionUuid);

  const filteredMetadata = manifestMetadata.filter(
    (entry) => !shouldHide(entry, labelsToHide)
  );

  return React.createElement(TargetComponent, {
    ...targetProps,
    manifestMetadata: filteredMetadata,
  });
}

const HideMetadataPlugin = {
  name: 'HideMetadataPlugin',
  target: 'ManifestInfo',
  mode: 'wrap',
  component: HideManifestInfo,
};

export default [HideMetadataPlugin];