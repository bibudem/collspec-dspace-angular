function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

import { getWindowConfig } from "mirador/dist/es/src/state/selectors";
import { createSelector } from "reselect";

var defaultConfig = {
  dialogOpen: false,
  enabled: true,
  showRightsInformation: true,
  singleCanvasOnly: false,

  iiifInfoLink: "https://iiif.io",

  shareLink: {
    enabled: false,
    manifestIdReplacePattern: ["", ""]
  },

  embedOption: {
    enabled: false,
    embedUrlReplacePattern: ["", ""],
    embedIframeAttributes: 'allowfullscreen frameborder="0"',
    embedIframeTitle: "Image viewer"
  },

  syncIframeDimensions: {}
};

var getPluginConfig = createSelector([getWindowConfig], function (_ref) {
  var _ref$canvasLink = _ref.canvasLink,
    canvasLink = _ref$canvasLink === void 0 ? {} : _ref$canvasLink;

  return _extends({}, defaultConfig, canvasLink, {
    shareLink: _extends({}, defaultConfig.shareLink, canvasLink.shareLink || {}),
    embedOption: _extends({}, defaultConfig.embedOption, canvasLink.embedOption || {})
  });
});

export { getPluginConfig };