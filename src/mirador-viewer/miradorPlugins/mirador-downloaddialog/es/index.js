import { updateWindow } from "mirador/dist/es/src/state/actions";
import { getContainerId } from "mirador/dist/es/src/state/selectors";
import { getCanvasLabel, getVisibleCanvases, selectInfoResponse } from "mirador/dist/es/src/state/selectors/canvases";
import { getManifestRelatedContent, getManifestRenderings, getManifestUrl } from "mirador/dist/es/src/state/selectors/manifests";
import DownloadButton from "./components/DownloadButton";
import DownloadDialog from "./components/DownloadDialog";
import translations from "./locales";
import { getPluginConfig } from "./state/selectors";
export default [{
  component: DownloadButton,
  config: {
    translations: translations
  },
  mapDispatchToProps: function mapDispatchToProps(dispatch, _ref) {
    var windowId = _ref.windowId;
    return {
      updateConfig: function updateConfig(downloadDialog) {
        return dispatch(updateWindow(windowId, {
          downloadDialog: downloadDialog
        }));
      }
    };
  },
  mapStateToProps: function mapStateToProps(state, _ref2) {
    var windowId = _ref2.windowId;
    return {
      containerId: getContainerId(state),
      config: getPluginConfig(state, {
        windowId: windowId
      })
    };
  },
  mode: "add",
  name: "DownloadButton",
  target: "WindowTopBarPluginArea"
}, {
  component: DownloadDialog,
  config: {
    translations: translations
  },
  mapDispatchToProps: function mapDispatchToProps(dispatch, _ref3) {
    var windowId = _ref3.windowId;
    return {
      updateConfig: function updateConfig(downloadDialog) {
        return dispatch(updateWindow(windowId, {
          downloadDialog: downloadDialog
        }));
      }
    };
  },
  mapStateToProps: function mapStateToProps(state, _ref4) {
    var windowId = _ref4.windowId;
    return {
      canvasLabel: function canvasLabel(canvasId) {
        return getCanvasLabel(state, {
          canvasId: canvasId,
          windowId: windowId
        });
      },
      config: getPluginConfig(state, {
        windowId: windowId
      }),
      containerId: getContainerId(state),
      infoResponse: function infoResponse(canvasId) {
        var _selectInfoResponse;
        return (_selectInfoResponse = selectInfoResponse(state, {
          canvasId: canvasId,
          windowId: windowId
        })) !== null && _selectInfoResponse !== void 0 ? _selectInfoResponse : {};
      },
      manifestUrl: getManifestUrl(state, {
        windowId: windowId
      }),
      seeAlso: getManifestRelatedContent(state, {
        windowId: windowId
      }),
	  renderings: getManifestRenderings(state, {
	    windowId: windowId
	  }),
      visibleCanvases: getVisibleCanvases(state, {
        windowId: windowId
      })
    };
  },
  mode: "add",
  name: "DownloadDialog",
  target: "Window"
}];
export { DownloadDialog, getPluginConfig, translations };