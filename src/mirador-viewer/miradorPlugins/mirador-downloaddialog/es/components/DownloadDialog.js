function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import Link from "@material-ui/core/Link";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ns from "mirador/dist/es/src/config/css-ns";
import ScrollIndicatedDialogContent from "mirador/dist/es/src/containers/ScrollIndicatedDialogContent";
import PropTypes from "prop-types";
import React from "react";
import DownloadDialogPluginArea from "../containers/dialog/DownloadDialogPluginArea";
import CanvasDownloadLinks from "./dialog/CanvasDownloadLinks";
var DownloadDialog = function DownloadDialog(_ref) {
  var _theme$typography$fon;
  var canvasLabel = _ref.canvasLabel,
    children = _ref.children,
    config = _ref.config,
    containerId = _ref.containerId,
    infoResponse = _ref.infoResponse,
    manifestUrl = _ref.manifestUrl,
    seeAlso = _ref.seeAlso,
    t = _ref.t,
    updateConfig = _ref.updateConfig,
    visibleCanvases = _ref.visibleCanvases,
    windowId = _ref.windowId;
  var theme = useTheme();
  var dialogOpen = config.dialogOpen,
    enabled = config.enabled;
  if (!enabled || !dialogOpen) {
    return null;
  }
  var closeDialog = function closeDialog() {
    return updateConfig(_extends({}, config, {
      dialogOpen: false
    }));
  };
  return /*#__PURE__*/React.createElement(Dialog, {
    container: document.querySelector("#" + containerId + " ." + ns("viewer")),
    fullWidth: true,
    maxWidth: "xs",
    onClose: closeDialog,
    open: dialogOpen,
    scroll: "paper"
  }, /*#__PURE__*/React.createElement(DialogTitle, {
    disableTypography: true
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "h4"
  }, /*#__PURE__*/React.createElement(Box, {
    fontWeight: "fontWeightBold"
  }, t("downloadOptions")))), /*#__PURE__*/React.createElement(ScrollIndicatedDialogContent, {
    dividers: true
  }, visibleCanvases.map(function (canvas) {
    var _infoResponse$json;
    return /*#__PURE__*/React.createElement(CanvasDownloadLinks, {
      canvas: canvas,
      key: canvas.id,
      label: canvasLabel(canvas.id),
      sizes: (_infoResponse$json = infoResponse(canvas.id).json) === null || _infoResponse$json === void 0 ? void 0 : _infoResponse$json.sizes,
      t: t
    });
  }), /*#__PURE__*/React.createElement(DownloadDialogPluginArea, {
    windowId: windowId
  }), children, /*#__PURE__*/React.createElement(Box, {
    sx: {
      marginTop: "1rem"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    raised: true
  }, /*#__PURE__*/React.createElement(CardContent, null, /*#__PURE__*/React.createElement(Typography, {
    component: "h5",
    style: {
      textTransform: "none"
    },
    variant: "h6"
  }, /*#__PURE__*/React.createElement(Box, {
    fontWeight: "fontWeightBold"
  }, t("otherDownloadOptions"))), /*#__PURE__*/React.createElement(List, null, /*#__PURE__*/React.createElement(ListItem, {
    dense: true
  }, /*#__PURE__*/React.createElement(Box, {
    fontFamily: (_theme$typography$fon = theme.typography.fontFamily) !== null && _theme$typography$fon !== void 0 ? _theme$typography$fon : "sans-serif",
    fontSize: "0.75rem"
  }, /*#__PURE__*/React.createElement(Link, {
    href: manifestUrl,
    rel: "noopener",
    target: "_blank"
  }, t("iiifManifest")))), seeAlso.filter(function (_ref2) {
    var format = _ref2.format;
    return format !== "text/html";
  }).map(function (_ref3) {
    var _theme$typography$fon2;
    var label = _ref3.label,
      value = _ref3.value;
    return /*#__PURE__*/React.createElement(ListItem, {
      dense: true,
      key: value
    }, /*#__PURE__*/React.createElement(Box, {
      fontFamily: (_theme$typography$fon2 = theme.typography.fontFamily) !== null && _theme$typography$fon2 !== void 0 ? _theme$typography$fon2 : "sans-serif",
      fontSize: "0.75rem"
    }, /*#__PURE__*/React.createElement(Link, {
      href: value,
      rel: "noopener",
      target: "_blank"
    }, label)));
  })))))), /*#__PURE__*/React.createElement(DialogActions, null, /*#__PURE__*/React.createElement(Button, {
    color: "primary",
    onClick: closeDialog
  }, t("close"))));
};
DownloadDialog.defaultProps = {
  children: undefined,
  manifestUrl: undefined,
  seeAlso: []
};
DownloadDialog.propTypes = process.env.NODE_ENV !== "production" ? {
  canvasLabel: PropTypes.func.isRequired,
  children: PropTypes.element,
  config: PropTypes.shape({
    dialogOpen: PropTypes.bool.isRequired,
    enabled: PropTypes.bool.isRequired
  }).isRequired,
  containerId: PropTypes.string.isRequired,
  infoResponse: PropTypes.func.isRequired,
  manifestUrl: PropTypes.string,
  seeAlso: PropTypes.arrayOf(PropTypes.shape({
    format: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.string
  })),
  t: PropTypes.func.isRequired,
  updateConfig: PropTypes.func.isRequired,
  visibleCanvases: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    index: PropTypes.number
  })).isRequired,
  windowId: PropTypes.string.isRequired
} : {};
export default DownloadDialog;