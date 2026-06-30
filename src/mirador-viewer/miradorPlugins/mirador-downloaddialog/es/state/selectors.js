function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { getWindowConfig } from "mirador/dist/es/src/state/selectors";
import { createSelector } from "reselect";
var defaultConfig = {
  // Open the download dialog
  dialogOpen: false,
  // Enable the plugin
  enabled: true
};

/** Selector to get the plugin config for a given window */
var getPluginConfig = createSelector([getWindowConfig], function (_ref) {
  var _ref$downloadDialog = _ref.downloadDialog,
    downloadDialog = _ref$downloadDialog === void 0 ? {} : _ref$downloadDialog;
  return _extends({}, defaultConfig, downloadDialog);
});
export { getPluginConfig };