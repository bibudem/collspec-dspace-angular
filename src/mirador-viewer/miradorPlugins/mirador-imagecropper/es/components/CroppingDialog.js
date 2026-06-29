function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Link from "@material-ui/core/Link";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Slider from "@material-ui/core/Slider";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import Image from "material-ui-image";
import ns from "mirador/dist/es/src/config/css-ns";
import ScrollIndicatedDialogContent from "mirador/dist/es/src/containers/ScrollIndicatedDialogContent";
import PropTypes from "prop-types";
import React, { useState } from "react";
import CopyToClipboard from "./dialog/CopyToClipboard";
import RightsInformation from "./dialog/RightsInformation";
import ShareButton from "./dialog/ShareButton";
import { getAttributionString } from "./utils";

/** Converts the given absolute coordinates to relative ones with the given precision */
var toRelativeCoordinates = function toRelativeCoordinates(_ref, width, height, precision) {
  var x = _ref.x,
    y = _ref.y,
    w = _ref.w,
    h = _ref.h;
  return {
    x: parseFloat((x / width * 100).toFixed(precision)),
    y: parseFloat((y / height * 100).toFixed(precision)),
    w: parseFloat((w / width * 100).toFixed(precision)),
    h: parseFloat((h / height * 100).toFixed(precision))
  };
};
var useStyles = makeStyles(function (theme) {
  var _theme$typography$fon;
  return {
    actions: {
      justifyContent: "space-between",
      flexWrap: "wrap"
    },
    actionButtons: {
      flexWrap: "wrap"
    },
    alert: {
      marginBottom: theme.spacing(1)
    },
    legend: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between"
    },
    optionsHeading: {
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1)
    },
    previewHeading: {
      marginBottom: theme.spacing(1)
    },
    previewImage: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    previewLink: {
      fontFamily: (_theme$typography$fon = theme.typography.fontFamily) !== null && _theme$typography$fon !== void 0 ? _theme$typography$fon : "sans-serif"
    }
  };
});
var supportsClipboard = ("clipboard" in navigator);

/** Renders the dialog where some IIIF parameters can be defined */
var CroppingDialog = function CroppingDialog(_ref2) {
  var config = _ref2.config,
    containerId = _ref2.containerId,
    imageCoordinates = _ref2.croppingRegion.imageCoordinates,
    currentCanvas = _ref2.currentCanvas,
    imageServiceIds = _ref2.imageServiceIds,
    label = _ref2.label,
    requiredStatement = _ref2.requiredStatement,
    rights = _ref2.rights,
    t = _ref2.t,
    updateConfig = _ref2.updateConfig,
    viewType = _ref2.viewType;
  var active = config.active,
    dialogOpen = config.dialogOpen,
    enabled = config.enabled,
    roundingPrecision = config.roundingPrecision,
    showRightsInformation = config.showRightsInformation;
  var _useState = useState(false),
    copiedToClipboard = _useState[0],
    setCopiedToClipboard = _useState[1];
  var _useState2 = useState(false),
    mirrored = _useState2[0],
    setMirrored = _useState2[1];
  var _useState3 = useState("default"),
    quality = _useState3[0],
    setQuality = _useState3[1];
  var _useState4 = useState(0),
    rotation = _useState4[0],
    setRotation = _useState4[1];
  var _useState5 = useState(100),
    size = _useState5[0],
    setSize = _useState5[1];
  var _useStyles = useStyles(),
    actions = _useStyles.actions,
    actionButtons = _useStyles.actionButtons,
    alert = _useStyles.alert,
    legend = _useStyles.legend,
    optionsHeading = _useStyles.optionsHeading,
    previewHeading = _useStyles.previewHeading,
    previewImage = _useStyles.previewImage,
    previewLink = _useStyles.previewLink;
  if (!enabled || !active || !dialogOpen || !currentCanvas || viewType !== "single" || !imageCoordinates) {
    return null;
  }
  var closeDialog = function closeDialog() {
    return updateConfig(_extends({}, config, {
      dialogOpen: false
    }));
  };
  var attribution = getAttributionString(requiredStatement);
  var canvasWidth = currentCanvas.getWidth();
  var canvasHeight = currentCanvas.getHeight();
  var _toRelativeCoordinate = toRelativeCoordinates(imageCoordinates, canvasWidth, canvasHeight, roundingPrecision),
    x = _toRelativeCoordinate.x,
    y = _toRelativeCoordinate.y,
    w = _toRelativeCoordinate.w,
    h = _toRelativeCoordinate.h;
  var region = "pct:" + x + "," + y + "," + w + "," + h;
  var mirror = mirrored ? "!" : "";
  var imageUrl = imageServiceIds[0] + "/" + region + "/pct:" + size + "/" + mirror + rotation + "/" + quality + ".jpg";
  var getPreviewUrl = function getPreviewUrl(width) {
    return imageServiceIds[0] + "/" + region + "/" + width + ",/" + mirror + rotation + "/" + quality + ".jpg";
  };
  /* The aspect ratio, which depends on the rotation, is only relevant for the preview image */
  var aspectRatio = 1;
  if (imageCoordinates.h > 0 && [0, 180].includes(rotation)) {
    aspectRatio = imageCoordinates.w / imageCoordinates.h;
  } else if (imageCoordinates.w > 0 && [90, 270].includes(rotation)) {
    aspectRatio = imageCoordinates.h / imageCoordinates.w;
  }
  return /*#__PURE__*/React.createElement(Dialog, {
    container: document.querySelector("#" + containerId + " ." + ns("viewer")),
    fullWidth: true,
    maxWidth: "sm",
    onClose: closeDialog,
    open: dialogOpen,
    scroll: "paper"
  }, /*#__PURE__*/React.createElement(DialogTitle, {
    disableTypography: true
  }, /*#__PURE__*/React.createElement(Typography, {
    variant: "h4"
  }, /*#__PURE__*/React.createElement(Box, {
    fontWeight: "fontWeightBold"
  }, t("imageCropper.linkToSelectedRegion")))), /*#__PURE__*/React.createElement(ScrollIndicatedDialogContent, {
    dividers: true
  }, copiedToClipboard && /*#__PURE__*/React.createElement(Alert, {
    className: alert,
    closeText: t("imageCropper.close"),
    onClose: function onClose() {
      return setCopiedToClipboard(false);
    },
    severity: "success"
  }, t("imageCropper.copiedToClipboard")), /*#__PURE__*/React.createElement(TextField, {
    fullWidth: true,
    InputProps: {
      endAdornment: /*#__PURE__*/React.createElement(CopyToClipboard, {
        onCopy: function onCopy() {
          navigator.clipboard.writeText(imageUrl);
          setCopiedToClipboard(true);
          setTimeout(function () {
            return setCopiedToClipboard(false);
          }, 3000);
        },
        supported: supportsClipboard,
        t: t
      }),
      readOnly: true
    },
    size: "small",
    value: imageUrl,
    variant: "outlined"
  }), /*#__PURE__*/React.createElement(Typography, {
    className: optionsHeading,
    variant: "h5"
  }, t("imageCropper.options")), /*#__PURE__*/React.createElement(FormControl, {
    component: "fieldset",
    fullWidth: true
  }, /*#__PURE__*/React.createElement(FormLabel, {
    component: "legend",
    className: legend
  }, t("imageCropper.size"), " ", /*#__PURE__*/React.createElement("span", null, size, "%")), /*#__PURE__*/React.createElement(Slider, {
    min: 1,
    onChange: function onChange(_evt, s) {
      return setSize(s);
    },
    value: size
  })), /*#__PURE__*/React.createElement(FormControl, {
    component: "fieldset"
  }, /*#__PURE__*/React.createElement(FormLabel, {
    component: "legend"
  }, t("imageCropper.rotation")), /*#__PURE__*/React.createElement(RadioGroup, {
    "aria-label": t("imageCropper.rotation"),
    name: "rotation",
    onChange: function onChange(evt) {
      return setRotation(parseInt(evt.target.value, 10));
    },
    row: true,
    value: rotation
  }, [0, 90, 180, 270].map(function (r) {
    return /*#__PURE__*/React.createElement(FormControlLabel, {
      control: /*#__PURE__*/React.createElement(Radio, null),
      key: r + "\xB0",
      label: r + "\xB0",
      value: r
    });
  }))), /*#__PURE__*/React.createElement(FormControl, {
    component: "fieldset",
    fullWidth: true
  }, /*#__PURE__*/React.createElement(FormLabel, {
    component: "legend"
  }, t("imageCropper.reflection")), /*#__PURE__*/React.createElement(FormGroup, {
    row: true
  }, /*#__PURE__*/React.createElement(FormControlLabel, {
    control: /*#__PURE__*/React.createElement(Switch, {
      checked: mirrored,
      color: "primary",
      onChange: function onChange(evt) {
        return setMirrored(evt.target.checked);
      }
    }),
    label: t("imageCropper.mirror")
  }))), /*#__PURE__*/React.createElement(FormControl, {
    component: "fieldset"
  }, /*#__PURE__*/React.createElement(FormLabel, {
    component: "legend"
  }, t("imageCropper.quality.label")), /*#__PURE__*/React.createElement(RadioGroup, {
    "aria-label": t("imageCropper.quality.label"),
    name: "quality",
    onChange: function onChange(evt) {
      return setQuality(evt.target.value);
    },
    row: true,
    value: quality
  }, ["default", "color", "gray", "bitonal"].map(function (q) {
    return /*#__PURE__*/React.createElement(FormControlLabel, {
      control: /*#__PURE__*/React.createElement(Radio, null),
      key: q,
      label: t("imageCropper.quality." + q),
      value: q
    });
  }))), /*#__PURE__*/React.createElement(Typography, {
    className: previewHeading,
    variant: "h5"
  }, t("imageCropper.preview.label")), /*#__PURE__*/React.createElement(Link, {
    className: previewLink,
    href: imageUrl,
    rel: "noopener",
    target: "_blank"
  }, t("imageCropper.preview.link")), /*#__PURE__*/React.createElement(Image, {
    aspectRatio: aspectRatio,
    className: previewImage,
    color: "transparent",
    src: getPreviewUrl(500)
  }), showRightsInformation && /*#__PURE__*/React.createElement(RightsInformation, {
    t: t,
    rights: rights
  })), /*#__PURE__*/React.createElement(DialogActions, {
    className: actions
  }, /*#__PURE__*/React.createElement(ButtonGroup, {
    className: actionButtons
  }, ["envelope"].map(function (p) {
    return /*#__PURE__*/React.createElement(ShareButton, {
      attribution: attribution,
      imageUrl: imageUrl,
      key: p,
      label: label,
      provider: p,
      thumbnailUrl: getPreviewUrl(250),
      title: t("imageCropper.share." + p)
    });
  })), /*#__PURE__*/React.createElement(Button, {
    color: "primary",
    onClick: closeDialog
  }, t("imageCropper.close"))));
};
CroppingDialog.defaultProps = {
  currentCanvas: undefined,
  label: "",
  requiredStatement: [],
  rights: []
};
CroppingDialog.propTypes = process.env.NODE_ENV !== "production" ? {
  config: PropTypes.shape({
    active: PropTypes.bool.isRequired,
    dialogOpen: PropTypes.bool.isRequired,
    enabled: PropTypes.bool.isRequired,
    roundingPrecision: PropTypes.number.isRequired,
    showRightsInformation: PropTypes.bool.isRequired
  }).isRequired,
  containerId: PropTypes.string.isRequired,
  croppingRegion: PropTypes.shape({
    imageCoordinates: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      w: PropTypes.number,
      h: PropTypes.number
    })
  }).isRequired,
  currentCanvas: PropTypes.shape({
    getHeight: PropTypes.func.isRequired,
    getWidth: PropTypes.func.isRequired,
    imageServiceIds: PropTypes.arrayOf(PropTypes.string).isRequired
  }),
  imageServiceIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  label: PropTypes.string,
  requiredStatement: PropTypes.arrayOf(PropTypes.shape({
    values: PropTypes.arrayOf(PropTypes.string)
  })),
  rights: PropTypes.arrayOf(PropTypes.string),
  t: PropTypes.func.isRequired,
  updateConfig: PropTypes.func.isRequired,
  viewType: PropTypes.string.isRequired
} : {};
export default CroppingDialog;