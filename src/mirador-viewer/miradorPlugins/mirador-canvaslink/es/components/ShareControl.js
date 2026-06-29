function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import ShareIcon from "@material-ui/icons/Share";
import { MiradorMenuButton } from "mirador/dist/es/src/components/MiradorMenuButton";
import PropTypes from "prop-types";
import React from "react";
var ShareControl = function ShareControl(_ref) {
  var containerId = _ref.containerId,
    config = _ref.config,
    t = _ref.t,
    updateConfig = _ref.updateConfig,
    windowViewType = _ref.windowViewType;
  var dialogOpen = config.dialogOpen,
    enabled = config.enabled,
    singleCanvasOnly = config.singleCanvasOnly;
  if (!enabled ||
  // Only show in single canvas view if configured
  singleCanvasOnly && windowViewType !== "single" ||
  // Never show in gallery view
  windowViewType === "gallery") {
    return null;
  }
  return /*#__PURE__*/React.createElement(MiradorMenuButton, {
    "aria-expanded": dialogOpen,
    "aria-label": t("canvasLink.shareLink"),
    containerId: containerId,
    onClick: function onClick() {
      return updateConfig(_extends({}, config, {
        dialogOpen: !dialogOpen
      }));
    }
  }, /*#__PURE__*/React.createElement(ShareIcon, null));
};
ShareControl.propTypes = process.env.NODE_ENV !== "production" ? {
  config: PropTypes.shape({
    dialogOpen: PropTypes.bool.isRequired,
    enabled: PropTypes.bool.isRequired,
    singleCanvasOnly: PropTypes.bool.isRequired
  }).isRequired,
  containerId: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  updateConfig: PropTypes.func.isRequired,
  windowViewType: PropTypes.string.isRequired
} : {};
export default ShareControl;