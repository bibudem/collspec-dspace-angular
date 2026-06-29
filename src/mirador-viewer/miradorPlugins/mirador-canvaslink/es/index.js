import { updateWindow } from "mirador/dist/es/src/state/actions";
import {
  getCanvases,
  getContainerId,
  getRights,
  getVisibleCanvases,
  getWindow,
  getWindowViewType
} from "mirador/dist/es/src/state/selectors";
import ShareCanvasLinkDialog from "./components/ShareCanvasLinkDialog";
import ShareControl from "./components/ShareControl";
import translations from "./locales";
import { getPluginConfig } from "./state/selectors";

export default [{
  component: ShareControl,
  config: {
    translations: translations
  },
  mapDispatchToProps: function mapDispatchToProps(dispatch, _ref) {
    var windowId = _ref.windowId;
    return {
      updateConfig: function updateConfig(canvasLink) {
        return dispatch(updateWindow(windowId, {
          canvasLink: canvasLink
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
      }),
      windowViewType: getWindowViewType(state, {
        windowId: windowId
      })
    };
  },
  mode: "add",
  target: "WindowTopBarPluginArea"
}, {
  component: ShareCanvasLinkDialog,
  config: {
    translations: translations
  },
  mapDispatchToProps: function mapDispatchToProps(dispatch, _ref3) {
    var windowId = _ref3.windowId;
    return {
      updateConfig: function updateConfig(canvasLink) {
        return dispatch(updateWindow(windowId, {
          canvasLink: canvasLink
        }));
      }
    };
  },
  mapStateToProps: function mapStateToProps(state, _ref4) {
    var windowId = _ref4.windowId;
    var _getWindow = getWindow(state, {
        windowId: windowId
      }),
      windowManifestId = _getWindow.manifestId,
      windowViewType = _getWindow.view;

    var manifest = state.manifests && windowManifestId
      ? state.manifests[windowManifestId]
      : null;

    var manifestJson = manifest && manifest.json ? manifest.json : null;

    var canonicalManifestId =
      manifestJson && (manifestJson["@id"] || manifestJson.id)
        ? manifestJson["@id"] || manifestJson.id
        : windowManifestId;

    return {
      canvases: getCanvases(state, {
        windowId: windowId
      }),
      containerId: getContainerId(state),
      manifestId: canonicalManifestId,
      visibleCanvases: getVisibleCanvases(state, {
        windowId: windowId
      }),
      config: getPluginConfig(state, {
        windowId: windowId
      }),
      rights: getRights(state, {
        windowId: windowId
      }),
      windowViewType: windowViewType
    };
  },
  mode: "add",
  target: "Window"
}];