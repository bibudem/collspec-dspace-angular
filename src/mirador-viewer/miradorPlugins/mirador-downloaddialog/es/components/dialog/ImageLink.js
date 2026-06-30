import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import { useTheme } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
var ImageLink = function ImageLink(_ref) {
  var _theme$typography$fon;
  var height = _ref.height,
    linkTarget = _ref.linkTarget,
    t = _ref.t,
    width = _ref.width;
  var theme = useTheme();
  return /*#__PURE__*/React.createElement(Box, {
    fontFamily: (_theme$typography$fon = theme.typography.fontFamily) !== null && _theme$typography$fon !== void 0 ? _theme$typography$fon : "sans-serif",
    fontSize: "0.75rem"
  }, "JPEG:", " ", /*#__PURE__*/React.createElement(Link, {
    href: linkTarget,
    target: "_blank"
  }, width + " x " + height + " " + t("pixels")));
};
ImageLink.propTypes = process.env.NODE_ENV !== "production" ? {
  height: PropTypes.number.isRequired,
  linkTarget: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired
} : {};
export default ImageLink;