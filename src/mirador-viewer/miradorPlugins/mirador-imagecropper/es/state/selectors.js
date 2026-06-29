function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { getWindowConfig } from "mirador/dist/es/src/state/selectors";
import { miradorSlice } from "mirador/dist/es/src/state/selectors/utils";
import { createSelector } from "reselect";
var defaultConfig = {
  // Activate the image cropping overlay
  active: false,
  // Open the settings dialog
  dialogOpen: false,
  // Enable the image cropping feature
  enabled: true,
  // Define the rounding percision for the relative coordinates
  roundingPrecision: 5,
  // Show the rights information defined in the manifest
  showRightsInformation: true
};
var defaultRegion = {
  x: 0,
  y: 0,
  w: 0,
  h: 0
};

/** Selector to get the current cropping region for a given window */
var getCroppingRegionForWindow = function getCroppingRegionForWindow(state, _ref) {
  var _miradorSlice$croppin, _regions$windowId;
  var windowId = _ref.windowId;
  var regions = (_miradorSlice$croppin = miradorSlice(state).croppingRegions) !== null && _miradorSlice$croppin !== void 0 ? _miradorSlice$croppin : {};
  return (_regions$windowId = regions[windowId]) !== null && _regions$windowId !== void 0 ? _regions$windowId : defaultRegion;
};

/** Selector to get the plugin config for a given window */
var getPluginConfig = createSelector([getWindowConfig], function (_ref2) {
  var _ref2$imageCropper = _ref2.imageCropper,
    imageCropper = _ref2$imageCropper === void 0 ? {} : _ref2$imageCropper;
  var roundingPrecision = imageCropper.roundingPrecision;
  if (typeof roundingPrecision !== "number" || roundingPrecision < 0 || roundingPrecision > 20) {
    roundingPrecision = 5;
  }
  return _extends({}, defaultConfig, imageCropper, {
    roundingPrecision: roundingPrecision
  });
});
export { defaultRegion, getCroppingRegionForWindow, getPluginConfig };