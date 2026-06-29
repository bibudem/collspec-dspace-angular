import InputAdornment from "@material-ui/core/InputAdornment";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { MiradorMenuButton } from "mirador/dist/es/src/components/MiradorMenuButton";
import PropTypes from "prop-types";
import React from "react";

/** Renders the button for copying the image url to the clipboard */
var CopyToClipboard = function CopyToClipboard(_ref) {
  var onCopy = _ref.onCopy,
    supported = _ref.supported,
    t = _ref.t;
  if (!supported) {
    return null;
  }
  return /*#__PURE__*/React.createElement(InputAdornment, null, /*#__PURE__*/React.createElement(MiradorMenuButton, {
    "aria-label": t("imageCropper.copyToClipboard"),
    edge: "end",
    onClick: onCopy
  }, /*#__PURE__*/React.createElement(FileCopyIcon, {
    fontSize: "small"
  })));
};
CopyToClipboard.propTypes = process.env.NODE_ENV !== "production" ? {
  onCopy: PropTypes.func.isRequired,
  supported: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired
} : {};
export default CopyToClipboard;