import flatten from "lodash/flatten";
import { updateViewport, updateWindow } from "mirador/dist/es/src/state/actions";
import { getContainerId, getCurrentCanvas, getCurrentCanvasWorld, getRequiredStatement, getRights, getWindowViewType } from "mirador/dist/es/src/state/selectors";
import CroppingControls from "./components/CroppingControls";
import CroppingDialog from "./components/CroppingDialog";
import CroppingOverlay from "./components/CroppingOverlay";
import translations from "./locales";
import { setCroppingRegion as _setCroppingRegion } from "./state/actions";
import { croppingRegionsReducer } from "./state/reducers";
import croppingRegionsSaga from "./state/sagas";
import { getCroppingRegionForWindow, getPluginConfig } from "./state/selectors";
export default [{
  component: CroppingControls,
  config: {
    translations: translations
  },
  mapDispatchToProps: function mapDispatchToProps(dispatch, _ref) {
    var windowId = _ref.windowId;
    return {
      updateConfig: function updateConfig(imageCropper) {
        return dispatch(updateWindow(windowId, {
          imageCropper: imageCropper
        }));
      }
    };
  },
  mapStateToProps: function mapStateToProps(state, _ref2) {
    var windowId = _ref2.windowId;
    return {
      config: getPluginConfig(state, {
        windowId: windowId
      }),
      containerId: getContainerId(state),
      viewType: getWindowViewType(state, {
        windowId: windowId
      })
    };
  },
  mode: "add",
  target: "WindowTopBarPluginArea"
}, {
  component: CroppingDialog,
  config: {
    translations: translations
  },
  mapDispatchToProps: function mapDispatchToProps(dispatch, _ref3) {
    var windowId = _ref3.windowId;
    return {
      updateConfig: function updateConfig(imageCropper) {
        return dispatch(updateWindow(windowId, {
          imageCropper: imageCropper
        }));
      }
    };
  },
  mapStateToProps: function mapStateToProps(state, _ref4) {
    var windowId = _ref4.windowId;
    var canvasWorld = getCurrentCanvasWorld(state, {
      windowId: windowId
    });
    var imageServiceIds = flatten(canvasWorld.canvases.map(function (c) {
      return c.imageServiceIds;
    }));
    return {
      config: getPluginConfig(state, {
        windowId: windowId
      }),
      containerId: getContainerId(state),
      croppingRegion: getCroppingRegionForWindow(state, {
        windowId: windowId
      }),
      currentCanvas: getCurrentCanvas(state, {
        windowId: windowId
      }),
      imageServiceIds: imageServiceIds,
      requiredStatement: getRequiredStatement(state, {
        windowId: windowId
      }),
      rights: getRights(state, {
        windowId: windowId
      }),
      viewType: getWindowViewType(state, {
        windowId: windowId
      })
    };
  },
  mode: "add",
  target: "Window"
}, {
  component: CroppingOverlay,
  config: {
    translations: translations
  },
  mapDispatchToProps: function mapDispatchToProps(dispatch, _ref5) {
    var windowId = _ref5.windowId;
    return {
      resetRotation: function resetRotation() {
        dispatch(updateViewport(windowId, {
          rotation: 0
        }));
      },
      setCroppingRegion: function setCroppingRegion(region) {
        dispatch(_setCroppingRegion(windowId, region));
      },
      updateConfig: function updateConfig(imageCropper) {
        return dispatch(updateWindow(windowId, {
          imageCropper: imageCropper
        }));
      }
    };
  },
  mapStateToProps: function mapStateToProps(state, _ref6) {
    var windowId = _ref6.windowId;
    return {
      config: getPluginConfig(state, {
        windowId: windowId
      }),
      containerId: getContainerId(state),
      croppingRegion: getCroppingRegionForWindow(state, {
        windowId: windowId
      }),
      currentCanvas: getCurrentCanvas(state, {
        windowId: windowId
      }),
      viewType: getWindowViewType(state, {
        windowId: windowId
      })
    };
  },
  mode: "add",
  reducers: {
    croppingRegions: croppingRegionsReducer
  },
  saga: croppingRegionsSaga,
  target: "OpenSeadragonViewer"
}];