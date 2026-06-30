import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import React from "react";
import ImageLink from "./ImageLink";
var CanvasDownloadLinks = function CanvasDownloadLinks(_ref) {
  var canvas = _ref.canvas,
    label = _ref.label,
    sizes = _ref.sizes,
    t = _ref.t;
  return /*#__PURE__*/React.createElement(Card, {
    className: "mb-3",
    raised: true
  }, /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(Typography, {
    component: "h5",
    style: {
      textTransform: "none"
    },
    variant: "h6"
  }, /*#__PURE__*/React.createElement(Box, {
    fontWeight: "fontWeightBold"
  }, t("image") + ": " + label)), /*#__PURE__*/React.createElement(List, null, sizes.sort(function (a, b) {
    return b.width - a.width;
  }).slice(1).reduce(function (acc, _ref2) {
    var height = _ref2.height,
      width = _ref2.width;
    // only take sizes, where the difference between the last taken width
    // and the current one is bigger than 500 pixels
    if (acc[acc.length - 1].width - width >= 500) {
      acc.push({
        height: height,
        width: width
      });
    }
    return acc;
  },
  // this represents the full size
  [{
    height: canvas.getHeight(),
    width: canvas.getWidth()
  }]).map(function (_ref3) {
    var height = _ref3.height,
      width = _ref3.width;
    return /*#__PURE__*/React.createElement(ListItem, {
      dense: true,
      key: height + "x" + width
    }, /*#__PURE__*/React.createElement(ImageLink, {
      height: height,
      linkTarget: canvas.getCanonicalImageUri(width),
      t: t,
      width: width
    }));
  }))));
};
CanvasDownloadLinks.defaultProps = {
  sizes: []
};
CanvasDownloadLinks.propTypes = process.env.NODE_ENV !== "production" ? {
  canvas: PropTypes.shape({
    getCanonicalImageUri: PropTypes.func.isRequired,
    getHeight: PropTypes.func.isRequired,
    getWidth: PropTypes.func.isRequired
  }).isRequired,
  label: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  sizes: PropTypes.arrayOf(PropTypes.shape({
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired
  })),
  t: PropTypes.func.isRequired
} : {};
export default CanvasDownloadLinks;