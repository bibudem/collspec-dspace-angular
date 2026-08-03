import Mirador from 'mirador/dist/es/src/index';

// You can modify this default Mirador configuration file. However,
// you should consider creating a copy of this file named
// 'config.local.js'. If that file exists it will be used to build
// your local Mirador instance. This allows you to keep local
// Mirador configuration separate from this default distribution
// copy.

// For an example of all Mirador configuration options, see
// https://github.com/ProjectMirador/mirador/blob/master/src/config/settings.js

// You can add or remove plugins. When adding new plugins be sure to also
// import them into the project via your package.json dependencies.
//import miradorShareDialogPlugin from 'mirador-share-plugin/es/MiradorShareDialog';
//import miradorSharePlugin from 'mirador-share-plugin/es/miradorSharePlugin';
//import miradorDownloadPlugin from './miradorPlugins/mirador-dl-plugin/es/miradorDownloadPlugin';
//import miradorDownloadDialog from './miradorPlugins/mirador-dl-plugin/es/MiradorDownloadDialog';
import downloadDialogPlugin from './miradorPlugins/mirador-downloaddialog/es';
import { miradorImageToolsPlugin } from 'mirador-image-tools';
import textOverlayPlugin from 'mirador-textoverlay/es';
//import ocrHelperPlugin from '@4eyes/mirador-ocr-helper';
import annotationPlugins from 'mirador-annotations';
import LocalStorageAdapter from 'mirador-annotations/es/LocalStorageAdapter';
import imageCropperPlugin from './miradorPlugins/mirador-imagecropper/es';
import canvasLinkPlugin from './miradorPlugins/mirador-canvaslink/es';
// NIMA 2026-05-25 : plugin maison pour gérer l'affichage de différents types d'item selon la communauté.
import HideMetadataPlugin from './miradorPlugins/HideMetadataPlugin';
// import AnnototAdapter from 'mirador-annotations/es/AnnototAdapter';
// Import your custom component
//import CustomMiradorDownloadDialog from "./CustomMiradorDownloadDialog";

const params = new URLSearchParams(location.search);
const manifest = params.get('manifest');
const searchOption = params.get('searchable');
const query = params.get('query');
const multi = params.get('multi');
const notMobile = params.get('notMobile');
const langParam = params.get('lang');
// NIMA - 2026-05-19 : ajout pour le lien vers une page par numéro de canvas
const pageParam = params.get('page') || '1';

const pages = pageParam
  .split(',')
  .map(p => parseInt(p, 10))
  .filter(p => !isNaN(p));
//const endpointUrl = 'http://127.0.0.1:3000/annotations';

let windowSettings = {};
let sidbarPanel = 'info';
let defaultView = 'single';
let multipleItems = false;
let thumbNavigation = 'far-bottom';
let lang = 'fr' // Default francais
let manifestData = manifest;
let manifestId = manifest;

windowSettings.manifestId = manifest;
// NIMA 2026-05-19
windowSettings.canvasIndex = pages[0] - 1;
//windowSettings.view = 'book';

window.miradorInstance = null;

(() => {
  if (searchOption) {
    defaultView = 'book';
    sidbarPanel = 'search';
    multipleItems = true;
    if (!notMobile) {
      thumbNavigation = 'far-bottom';// changer la disposition pour mobile
    }
    if (query !== 'null') {
      windowSettings.defaultSearchQuery = query;
    }
  } else {
    if(multi) {
      multipleItems = multi;
      if (notMobile) {
        thumbNavigation = 'far-bottom';
      }
    }
  }
  if (langParam && ['fr', 'en'].includes(langParam)) {
      lang = langParam;
    }
})();

const plugins = [
  //miradorShareDialogPlugin,
  //miradorSharePlugin,
  //miradorDownloadDialog,
  //miradorDownloadPlugin,
  HideMetadataPlugin,
  canvasLinkPlugin,
  downloadDialogPlugin,
  textOverlayPlugin,
  
];

if (notMobile) {
  plugins.push(
    miradorImageToolsPlugin,
    //ocrHelperPlugin,
    annotationPlugins,
	imageCropperPlugin,
  );
}

// Create a custom plugin to override the CanvasDownloadLinks component
/*const customPlugin = {
  target: 'Window',
  mode: 'wrap',
  component: CustomMiradorDownloadDialog,
  mapDispatchToProps: null,
  mapStateToProps: null,
};*/
// =====================================================
// FILTRE BUNDLE VEDETTE
// =====================================================
fetch(manifest)
  .then(res => res.json())
  .then(json => {
    if (json.sequences && json.structures) {
      const vedetteCanvasIds = new Set();
      json.structures.forEach(range => {
        if (range.label && range.label.toUpperCase() === 'VEDETTE') {
          (range.canvases || []).forEach(id => vedetteCanvasIds.add(id));
        }
      });
      json.sequences.forEach(seq => {
        seq.canvases = seq.canvases.filter(c => !vedetteCanvasIds.has(c['@id']));
        // Renuméroter les canvases restants à partir de Page 1
        seq.canvases.forEach((canvas, index) => {
          canvas.label = `Page ${index + 1}`;
        });
       });
      json.structures = json.structures.filter(r => r.label?.toUpperCase() !== 'VEDETTE');

      // Créer un Blob URL pour que Mirador ne re-fetch pas l'original
      const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);
      manifestData = blobUrl;
      windowSettings.manifestId = blobUrl;
    }
  })
  .catch(e => console.warn('Filtre VEDETTE échoué', e))
  .finally(() => {   
    window.miradorInstance = Mirador.viewer(
        {
          id: 'mirador',
          mainMenuSettings: {
            show: true
          },
          language: lang,       // The default language set in the application
          availableLanguages: { // All the languages available in the language switcher
            fr: 'Français',
            en: 'English'
          },
          // Ajoute ceci pour surcharger les traductions manquantes
        translations: {
          fr: {
            // mirador-image-tools
            hide: "Masquer les outils",
            show: "Afficher les outils",
            collapse_open: "Réduire les outils",
            collapse_close: "Développer les outils",
            revert: "Rétablir l'image",
            dialogTitle: "Partager",
            shareLinkText: "Partager le lien",
            download: "Télécharger",
            // --- mirador-textoverlay ---
            collapseTextOverlayOptions: "Réduire les options de superposition de texte",
            disableTextOverlay: "Désactiver la superposition de texte",
            enableTextOverlay: "Activer la superposition de texte",
            expandTextOverlayOptions: "Développer les options de superposition de texte",
            textOpacity: "Opacité du texte",
            textSelect: "Texte sélectionnable",
            textVisible: "Texte visible",
            colorPicker: "Sélecteur de couleur",
            textColor: "Couleur du texte",
            backgroundColor: "Couleur de fond de la ligne",
            resetTextColors: "Réinitialiser les couleurs",

            // --- mirador-imagecropper ---
            imageCropper: {
              activate: "Activer la sélection d'une zone de l'image",
              close: "Fermer",
              copiedToClipboard: "Copié dans le presse-papiers avec succès",
              copyToClipboard: "Copier dans le presse-papiers",
              deactivate: "Désactiver la sélection d'une zone de l'image",
              linkToSelectedRegion: "Lien vers la zone sélectionnée",
              mirror: "Miroir de l'image",
              noteRights: "Veuillez noter la mention de droits",
              noteRights_plural: "Veuillez noter les mentions de droits",
              openDialog: "Ouvrir la fenêtre des paramètres",
              options: "Options",
              preview: {
                label: "Aperçu",
                link: "Afficher avec les options sélectionnées ci-dessus"
              },
              quality: {
                bitonal: "Bitonal",
                color: "Couleur",
                default: "Par défaut",
                gray: "Niveaux de gris",
                label: "Qualité"
              },
              reflection: "Réflexion",
              rotation: "Rotation",
              share: {
                envelope: "Partager par courriel",
                facebook: "Partager sur Facebook",
                pinterest: "Partager sur Pinterest",
                whatsapp: "Partager via WhatsApp",
                x: "Partager sur X"
              },
              size: "Taille"
            }
          }
        },
          showLocalePicker: true,
          thumbnailNavigation: {
            defaultPosition: thumbNavigation, // Which position for the thumbnail navigation to be be displayed. Other possible values are "far-bottom" or "far-right"
            displaySettings: true, // Display the settings for this in WindowTopMenu
            height: 120, // height of entire ThumbnailNavigation area when position is "far-bottom"
            width: 100, // width of one canvas (doubled for book view) in ThumbnailNavigation area when position is "far-right"
          },
          themes: {
            light: {
              palette: {
                type: 'light',
                primary: {
                  main: '#0B113A',
                },
                secondary: {
                  main: '#B72600',
                },
                shades: { // Shades that can be used to offset color areas of the Workspace / Window
                  dark: '#eeeeee',
                  main: '#ffffff',
                  light: '#ffffff',
                },
                highlights: {
                  primary: '#FFCA40',
                  secondary: '#6BA5D1',
                },
                search: {
                  default: { fillStyle: '#6BA5D1', globalAlpha: 0.3 },
                  hovered: { fillStyle: '#2178C4', globalAlpha: 0.3 },
                  selected: { fillStyle: '#B72600', globalAlpha: 0.3 },
                },
              },
            },
            dark: {
              palette: {
                type: 'dark',
                primary: {
                  main: '#2178C4',
                },
                secondary: {
                  main: '#eeeeee',
                },
                highlights: {
                  primary: '#FFCA40',
                  secondary: '#6BA5D1',
                },
              },
            },
          },
          selectedTheme: 'light',
          data: [manifestData],
          windows: [
            windowSettings
          ],
          miradorDownloadPlugin: {
            restrictDownloadOnSizeDefinition: false
          },
          window: {
            allowClose: true,
            imageToolsEnabled: notMobile ? true: false,
            imageToolsOpen: false,
		  osdConfig: {
			  crossOriginPolicy: "Anonymous"
		  },
          textOverlay: {
            enabled: true,
            visible: false,
			useAutoColors: true,
			textColor: '#000000',
			bgColor: '#ffffff',
			selectionTextColor: '#218a59',
			selectionBackgroundColor: '#21428a',
            skipEmptyLines: true,
            opacity: 1,
            color: '#6BA5D1',
            overlayFont: "Helvetica, Arial, monospace, 'EB Garamond', Garamond, Tahoma, Calibri, 'Courier New', sans-serif",
			optionsRenderMode: 'simple',
            correction: {
            enabled: true,
            emailUrlKeepParams: ['manifest'],
            emailRecipient: null,
            },
          },
		  imageCropper: {
	        enabled: true,
	        active: false,
	        dialogOpen: false,
	        roundingPrecision: 5,
	        showRightsInformation: false,
	      },
		  canvasLink: {
		  enabled: true,
		  dialogOpen: false,
		  showRightsInformation: true,
		  singleCanvasOnly: false,

		  iiifInfoLink: 'https://iiif.io',

		  shareLink: {
			enabled: true,
			manifestIdReplacePattern: [
			  /\/iiif\/manifest/,
			  '',
			],
		  },

		  embedOption: {
			enabled: true,
			embedUrlReplacePattern: [
			  /.*\.edu\/(\w+)\/iiif\/manifest/,
			  manifest,
			],
			embedIframeAttributes: 'allowfullscreen frameborder="0"',
			embedIframeTitle: 'Image viewer',
		  },

		  syncIframeDimensions: {
			height: { param: 'maxheight' },
		  },

		  getCanvasLink: ({ visibleCanvases, canvases }) => {
			const viewerUrl = new URL(window.location.href);
			const manifestUrl = viewerUrl.searchParams.get('manifest') || '';

			const uuidMatch = manifestUrl.match(
			  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
			);
			const itemUuid = uuidMatch ? uuidMatch[0] : null;

			const visibleIds = (visibleCanvases || [])
			  .map((canvas) => (typeof canvas === 'string' ? canvas : canvas?.id))
			  .filter(Boolean);

			const pages = visibleIds
			  .map((id) => {
				const index = (canvases || []).findIndex((canvas) => canvas?.id === id);
				return index >= 0 ? String(index + 1) : null;
			  })
			  .filter(Boolean);

			if (!itemUuid) {
			  return viewerUrl.toString();
			}

			const pageParam = pages.length
			  ? `?page=${encodeURIComponent(pages.join(','))}`
			  : '';

			return `${viewerUrl.origin}/items/${itemUuid}${pageParam}`;
		  },
		},
            defaultSideBarPanel: 'info',
            sideBarOpenByDefault: false,
            allowFullscreen: true,
            allowMaximize: false,
            defaultView: defaultView,
            sideBarOpen: notMobile,
            allowTopMenuButton: true,
            defaultSidebarPanelWidth: 300,
            switchCanvasOnSearch: true,
            views: [
              { key: 'single', behaviors: ['individuals'] },
              { key: 'book', behaviors: ['paged', 'individuals'] },
              { key: 'scroll', behaviors: ['continuous'] },
              { key: 'gallery' },
            ],
            panels: {
              info: true,
              attribution: true,
              canvas: true,
              search: searchOption,
              layers: false,
            },
            sideBarPanel: sidbarPanel
          },
          workspace: {
            allowNewWindows: true,
            showZoomControls: true,
            type: 'mosaic'
          },
          workspaceControlPanel: {
            enabled: true, // Active la barre de navigation en haut avec les boutons: Ajouter ressource, navigation fenêtres, paramètres...
          },
          annotation: notMobile
          ? {
              adapter: (canvasId) =>
                new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`),
              exportLocalStorageAnnotations: true,
            } : null // Annotations désactivées sur mobile
        },
        plugins
      );

  
  // Patch store.dispatch pour restaurer l'adapter d'annotations après import workspace.
  // JSON.stringify (utilisé par l'export Mirador) supprime les fonctions : l'adapter
  // disparaît du config importé, ce qui fait crasher miradorAnnotationPlugin.render()
  // à la ligne `config.annotation.adapter('poke')` → écran blanc.
  if (notMobile) {
    const _origDispatch = window.miradorInstance.store.dispatch.bind(window.miradorInstance.store);
    window.miradorInstance.store.dispatch = function(action) {
      if (
        action.type === 'mirador/IMPORT_MIRADOR_STATE' &&
        action.state?.config?.annotation &&
        !action.state.config.annotation.adapter
      ) {
        action = {
          ...action,
          state: {
            ...action.state,
            config: {
              ...action.state.config,
              annotation: {
                ...action.state.config.annotation,
                adapter: (canvasId) =>
                  new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`),
              },
            },
          },
        };
      }
      return _origDispatch(action);
    };
  }

  // NIMA 2026-05-21 ajout de numéro de page dans l'URL pour Single view et Book view
  let lastPageParam = null;

  window.miradorInstance.store.subscribe(() => {

  const state = window.miradorInstance.store.getState();

  const windows = state.windows;

  if (!windows || !Object.keys(windows).length) {
    return;
  }

  const firstWindow = windows[Object.keys(windows)[0]];

  const visible = firstWindow.visibleCanvases;

  if (!visible || !visible.length) {
    return;
  }

  const pages = visible
    .map((canvasUrl) => {

      const match = canvasUrl.match(/\/canvas\/c(\d+)/);

      if (!match) {
        return null;
      }

      return parseInt(match[1], 10) + 1;
    })
    .filter(p => p !== null);

  if (!pages.length) {
    return;
  }

  const pageParam = pages.join(',');

  if (pageParam === lastPageParam) {
    return;
  }
  lastPageParam = pageParam;

  const parentUrl = new URL(window.parent.location.href);

  if (pageParam === parentUrl.searchParams.get('page')) {
    return;
  }

  parentUrl.searchParams.set('page', pageParam);
  window.parent.history.replaceState({}, '', parentUrl);

});

});