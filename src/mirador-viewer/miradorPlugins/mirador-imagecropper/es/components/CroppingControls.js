function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import CropIcon from "@material-ui/icons/Crop";
import { MiradorMenuButton } from "mirador/dist/es/src/components/MiradorMenuButton";
import PropTypes from "prop-types";
import React from "react";

/** Renders the button to (de)activate the cropping overlay */
var CroppingControls = function CroppingControls(_ref) {
  var config = _ref.config,
    containerId = _ref.containerId,
    t = _ref.t,
    updateConfig = _ref.updateConfig,
    viewType = _ref.viewType;
  var active = config.active,
    enabled = config.enabled;
  if (!enabled || viewType !== "single") {
    return null;
  }
  return /*#__PURE__*/React.createElement(MiradorMenuButton, {
    "aria-expanded": active,
    "aria-haspopup": true,
    "aria-label": active ? t("imageCropper.deactivate") : t("imageCropper.activate"),
    color: active ? "primary" : "default",
    containerId: containerId,
    onClick: function onClick() {
      return updateConfig(_extends({}, config, {
        active: !active
      }));
    }
  }, /*#__PURE__*/React.createElement(CropIcon, null));
};
CroppingControls.propTypes = process.env.NODE_ENV !== "production" ? {
  config: PropTypes.shape({
    active: PropTypes.bool.isRequired,
    enabled: PropTypes.bool.isRequired
  }).isRequired,
  containerId: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  updateConfig: PropTypes.func.isRequired,
  viewType: PropTypes.string.isRequired
} : {};
export default CroppingControls;