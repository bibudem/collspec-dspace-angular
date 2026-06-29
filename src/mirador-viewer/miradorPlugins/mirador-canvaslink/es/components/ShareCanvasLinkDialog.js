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

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import makeStyles from "@material-ui/core/styles/makeStyles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import ns from "mirador/dist/es/src/config/css-ns";
import ScrollIndicatedDialogContent from "mirador/dist/es/src/containers/ScrollIndicatedDialogContent";
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import RightsInformation from "./dialog/RightsInformation";
import MiradorShareEmbed from "./dialog/MiradorShareEmbed";
import IiifIcon from "./dialog/IiifIcon";

var useStyles = makeStyles(function (theme) {
  return {
    alert: {
      marginBottom: theme.spacing(1)
    },
    copyButton: {
      marginLeft: theme.spacing(1)
    },
    h3: {
      marginTop: theme.spacing(2)
    },
    iiifLink: {
      marginRight: "10px"
    },
    iiifIcon: {
      verticalAlign: "text-bottom",
      cursor: "grab",
      paddingTop: "12px"
    },
    inputContainer: {
      alignItems: "flex-end",
      display: "flex",
      flexDirection: "row",
      marginBottom: theme.spacing(2)
    },
    shareLinkInput: {
      paddingTop: "12px"
    },
    grid: {
      textAlign: "center",
      paddingTop: "12px"
    },
    actions: {
      justifyContent: "flex-end"
    }
  };
});

var supportsClipboard =
  typeof navigator !== "undefined" && "clipboard" in navigator;

var ShareCanvasLinkDialog = function ShareCanvasLinkDialog(_ref) {
  var canvases = _ref.canvases,
    config = _ref.config,
    containerId = _ref.containerId,
    manifestId = _ref.manifestId,
    visibleCanvases = _ref.visibleCanvases,
    rights = _ref.rights,
    t = _ref.t,
    updateConfig = _ref.updateConfig,
    windowViewType = _ref.windowViewType;

  var dialogOpen = config.dialogOpen,
    enabled = config.enabled,
    showRightsInformation = config.showRightsInformation,
    getCanvasLink = config.getCanvasLink,
    iiifInfoLink = config.iiifInfoLink,
    shareLink = config.shareLink || {},
    embedOption = config.embedOption || {},
    syncIframeDimensions = config.syncIframeDimensions || {};

  var _useState = useState(false),
    copiedToClipboard = _useState[0],
    setCopiedToClipboard = _useState[1];

  var _useState2 = useState(""),
    shareLinkText = _useState2[0],
    setShareLinkText = _useState2[1];

  var _useStyles = useStyles(),
    alert = _useStyles.alert,
    copyButton = _useStyles.copyButton,
    h3 = _useStyles.h3,
    iiifLink = _useStyles.iiifLink,
    iiifIcon = _useStyles.iiifIcon,
    inputContainer = _useStyles.inputContainer,
    shareLinkInput = _useStyles.shareLinkInput,
    grid = _useStyles.grid,
    actions = _useStyles.actions;

  var derivedShareLink = useMemo(function () {
    if (!manifestId || !shareLink.enabled) return "";
    var pattern = shareLink.manifestIdReplacePattern || [];
    if (!pattern.length || pattern.length < 2) return manifestId;
    return manifestId.replace(pattern[0], pattern[1]);
  }, [manifestId, shareLink]);

  useEffect(function () {
    setShareLinkText(derivedShareLink);
  }, [derivedShareLink]);

  if (!enabled || !dialogOpen || !visibleCanvases || visibleCanvases.length === 0) {
    return null;
  }

  var closeDialog = function closeDialog() {
    return updateConfig(_extends({}, config, {
      dialogOpen: false
    }));
  };

  var canvasLink = getCanvasLink({
    canvases: canvases,
    manifestId: manifestId,
    visibleCanvases: visibleCanvases,
    windowViewType: windowViewType
  });

  var dragAndDropUrl = function dragAndDropUrl() {
    if (!manifestId) return "";

    try {
      var url = new URL(manifestId);
      url.searchParams.set("manifest", manifestId);
      return url.toString();
    } catch (e) {
      return manifestId + "?manifest=" + encodeURIComponent(manifestId);
    }
  };

  var handleCopy = function handleCopy(text) {
    if (!supportsClipboard || !text) return;
    navigator.clipboard.writeText(text);
    setCopiedToClipboard(true);
    setTimeout(function () {
      return setCopiedToClipboard(false);
    }, 3000);
  };

  var whatIsThisLink = function whatIsThisLink() {
    if (!iiifInfoLink) return null;
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Link,
        {
          href: iiifInfoLink,
          target: "_blank",
          rel: "noopener noreferrer"
        },
        t("canvasLink.whatIsIIIF")
      )
    );
  };

  return /*#__PURE__*/React.createElement(
    Dialog,
    {
      container: document.querySelector("#" + containerId + " ." + ns("viewer")),
      fullWidth: true,
      maxWidth: "sm",
      scroll: "paper",
      open: dialogOpen,
      onClose: closeDialog
    },
    /*#__PURE__*/React.createElement(
      DialogTitle,
      {
        disableTypography: true
      },
      /*#__PURE__*/React.createElement(
        Typography,
        {
          variant: "h4"
        },
        /*#__PURE__*/React.createElement(
          Box,
          {
            fontWeight: "fontWeightBold"
          },
          t("canvasLink.dialogTitle")
        )
      )
    ),
    /*#__PURE__*/React.createElement(
      ScrollIndicatedDialogContent,
      {
        dividers: true
      },
      copiedToClipboard && /*#__PURE__*/React.createElement(
        Alert,
        {
          className: alert,
          closeText: t("canvasLink.close"),
          onClose: function onClose() {
            return setCopiedToClipboard(false);
          },
          severity: "success"
        },
        t("canvasLink.copiedToClipboard")
      ),
      /*#__PURE__*/React.createElement(
        Typography,
        {
          className: h3,
          variant: "h6"
        },
        t("canvasLink.shareLink")
      ),
      /*#__PURE__*/React.createElement(
        "div",
        {
          className: inputContainer
        },
        /*#__PURE__*/React.createElement(TextField, {
          fullWidth: true,
          InputProps: {
            readOnly: true
          },
          size: "small",
          value: canvasLink,
          variant: "outlined",
          inputProps: {
            "aria-label": t("canvasLink.shareLink"),
            className: shareLinkInput
          }
        }),
        /*#__PURE__*/React.createElement(
          Button,
          {
            className: copyButton,
            variant: "outlined",
            color: "primary",
            onClick: function onClick() {
              return handleCopy(canvasLink);
            }
          },
          t("canvasLink.copy")
        )
      ),
      showRightsInformation && /*#__PURE__*/React.createElement(RightsInformation, {
        t: t,
        rights: rights
      }),
      shareLink.enabled && /*#__PURE__*/React.createElement(
        React.Fragment,
        null,
        /*#__PURE__*/React.createElement(Divider, null),
        /*#__PURE__*/React.createElement(
          Typography,
          {
            className: h3,
            variant: "h6"
          },
          t("canvasLink.shareLinkLabel")
        ),
        /*#__PURE__*/React.createElement(
          "div",
          {
            className: inputContainer
          },
          /*#__PURE__*/React.createElement(TextField, {
            fullWidth: true,
            variant: "outlined",
            size: "small",
            value: shareLinkText,
            onChange: function onChange(e) {
              return setShareLinkText(e.target.value);
            },
            inputProps: {
              "aria-label": t("canvasLink.shareLinkAriaLabel"),
              className: shareLinkInput
            }
          }),
          /*#__PURE__*/React.createElement(
            Button,
            {
              className: copyButton,
              variant: "outlined",
              color: "primary",
              onClick: function onClick() {
                return handleCopy(shareLinkText);
              }
            },
            t("canvasLink.copy")
          )
        )
      ),
      embedOption.enabled && /*#__PURE__*/React.createElement(
        React.Fragment,
        null,
        /*#__PURE__*/React.createElement(Divider, null),
        /*#__PURE__*/React.createElement(
          Typography,
          {
            className: h3,
            variant: "h6"
          },
          t("canvasLink.embed")
        ),
        /*#__PURE__*/React.createElement(MiradorShareEmbed, {
          t: t,
          embedIframeAttributes: embedOption.embedIframeAttributes,
          embedIframeTitle: embedOption.embedIframeTitle,
          embedUrlReplacePattern: embedOption.embedUrlReplacePattern || [],
          syncIframeDimensions: syncIframeDimensions,
          manifestId: manifestId
        })
      ),
      /*#__PURE__*/React.createElement(Divider, null),
      /*#__PURE__*/React.createElement(
        Typography,
        {
          className: h3,
          variant: "h6"
        },
        t("canvasLink.addToAnotherViewer")
      ),
      /*#__PURE__*/React.createElement(
        Grid,
        {
          container: true,
          spacing: 1,
          className: grid
        },
        /*#__PURE__*/React.createElement(
          Grid,
          {
            item: true,
            xs: true
          },
          /*#__PURE__*/React.createElement(
            Typography,
            {
              variant: "body1"
            },
            t("canvasLink.dragAndDrop")
          ),
          /*#__PURE__*/React.createElement(
            Link,
            {
              href: dragAndDropUrl(),
              className: iiifLink,
              target: "_blank",
              rel: "noopener noreferrer"
            },
            /*#__PURE__*/React.createElement(IiifIcon, {
              className: iiifIcon
            })
          )
        ),
        /*#__PURE__*/React.createElement(
          Grid,
          {
            item: true,
            xs: 1
          },
          /*#__PURE__*/React.createElement(
            Typography,
            {
              variant: "body1"
            },
            t("canvasLink.or")
          )
        ),
        /*#__PURE__*/React.createElement(
          Grid,
          {
            item: true,
            xs: true
          },
          /*#__PURE__*/React.createElement(
            Typography,
            {
              variant: "body1"
            },
            t("canvasLink.copyManifest")
          ),
          /*#__PURE__*/React.createElement(
            Button,
            {
              className: copyButton,
              variant: "outlined",
              color: "primary",
              onClick: function onClick() {
                return handleCopy(dragAndDropUrl());
              }
            },
            t("canvasLink.copy")
          )
        )
      ),
      /*#__PURE__*/React.createElement(
        Typography,
        {
          variant: "body1"
        },
        whatIsThisLink()
      )
    ),
    /*#__PURE__*/React.createElement(
      DialogActions,
      {
        className: actions
      },
      /*#__PURE__*/React.createElement(
        Button,
        {
          color: "primary",
          onClick: closeDialog
        },
        t("canvasLink.close")
      )
    )
  );
};

ShareCanvasLinkDialog.defaultProps = {
  canvases: [],
  rights: [],
  visibleCanvases: []
};

ShareCanvasLinkDialog.propTypes = process.env.NODE_ENV !== "production" ? {
  canvases: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired
  })),
  config: PropTypes.shape({
    dialogOpen: PropTypes.bool.isRequired,
    enabled: PropTypes.bool.isRequired,
    showRightsInformation: PropTypes.bool.isRequired,
    singleCanvasOnly: PropTypes.bool,
    getCanvasLink: PropTypes.func.isRequired,
    iiifInfoLink: PropTypes.string,
    shareLink: PropTypes.shape({
      enabled: PropTypes.bool,
      manifestIdReplacePattern: PropTypes.array
    }),
    embedOption: PropTypes.shape({
      enabled: PropTypes.bool,
      embedUrlReplacePattern: PropTypes.array,
      embedIframeAttributes: PropTypes.string,
      embedIframeTitle: PropTypes.string
    }),
    syncIframeDimensions: PropTypes.object
  }).isRequired,
  containerId: PropTypes.string.isRequired,
  manifestId: PropTypes.string.isRequired,
  rights: PropTypes.arrayOf(PropTypes.string),
  t: PropTypes.func.isRequired,
  updateConfig: PropTypes.func.isRequired,
  visibleCanvases: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    imageServiceIds: PropTypes.arrayOf(PropTypes.string)
  })),
  windowViewType: PropTypes.string.isRequired
} : {};

export default ShareCanvasLinkDialog;