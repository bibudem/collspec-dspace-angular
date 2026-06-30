function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import DownloadIcon from "@material-ui/icons/VerticalAlignBottomSharp";
import { MiradorMenuButton } from "mirador/dist/es/src/components/MiradorMenuButton";
import PropTypes from "prop-types";
import React from "react";
var DownloadButton = function DownloadButton(_ref) {
  var config = _ref.config,
    containerId = _ref.containerId,
    t = _ref.t,
    updateConfig = _ref.updateConfig;
  var dialogOpen = config.dialogOpen,
    enabled = config.enabled;
  if (!enabled) {
    return null;
  }
  return /*#__PURE__*/React.createElement(MiradorMenuButton, {
    "aria-expanded": dialogOpen,
    "aria-haspopup": true,
    "aria-label": t("showDownloadOptions"),
    containerId: containerId,
    onClick: function onClick() {
      return updateConfig(_extends({}, config, {
        dialogOpen: !dialogOpen
      }));
    }
  }, /*#__PURE__*/React.createElement(DownloadIcon, null));
};
DownloadButton.propTypes = process.env.NODE_ENV !== "production" ? {
  config: PropTypes.shape({
    dialogOpen: PropTypes.bool.isRequired,
    enabled: PropTypes.bool.isRequired
  }).isRequired,
  containerId: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  updateConfig: PropTypes.func.isRequired
} : {};
export default DownloadButton;