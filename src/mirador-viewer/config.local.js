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
import miradorShareDialogPlugin from 'mirador-share-plugin/es/MiradorShareDialog';
import miradorSharePlugin from 'mirador-share-plugin/es/miradorSharePlugin';
import miradorDownloadPlugin from 'mirador-dl-plugin/es/miradorDownloadPlugin';
import miradorDownloadDialog from 'mirador-dl-plugin/es/MiradorDownloadDialog';
import { miradorImageToolsPlugin } from 'mirador-image-tools';
import textOverlayPlugin from 'mirador-textoverlay/es';
//import ocrHelperPlugin from '@4eyes/mirador-ocr-helper';
import annotationPlugins from 'mirador-annotations';
import LocalStorageAdapter from 'mirador-annotations/es/LocalStorageAdapter';
import imageCropperPlugin from 'mirador-imagecropper/es';

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
//windowSettings.view = 'book';

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
  miradorShareDialogPlugin,
  miradorSharePlugin,
  miradorDownloadDialog,
  miradorDownloadPlugin,
];

if (notMobile) {
  plugins.push(
    miradorImageToolsPlugin,
    //ocrHelperPlugin,
    annotationPlugins,
    textOverlayPlugin,
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
    (Mirador.viewer(
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
          miradorSharePlugin: {
            dragAndDropInfoLink: 'https://iiif.io',
            embedOption: {
              enabled: true,
              embedUrlReplacePattern: [
                /.*\.edu\/(\w+)\/iiif\/manifest/,
                manifest
              ],
              syncIframeDimensions: {
                height: {param: 'maxheight'},
              },
            },
            shareLink: {
              enabled: true,
              manifestIdReplacePattern: [
                /\/iiif\/manifest/,
                '',
              ],
            },
          },
          miradorDownloadPlugin: {
            restrictDownloadOnSizeDefinition: false
          },
          window: {
            allowClose: true,
            imageToolsEnabled: notMobile ? true: false,
            imageToolsOpen: false,
          textOverlay: {
            enabled: true,
            visible: false,
			useAutoColors: true,
			textColor: '#000000',
			bgColor: '#ffffff',
			selectionTextColor: '#218a59',
			selectionBackgroundColor: '#21428a',
            skipEmptyLines: true,
            opacity: 0.5,
            color: '#6BA5D1',
            overlayFont: "'EB Garamond', Garamond, Tahoma, Calibri, 'Courier New', monospace, Arial, Helvetica, sans-serif",
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
              { key: 'single', behaviors: ['individuals', 'paged'] },
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
      )
    )(manifestData);
 });