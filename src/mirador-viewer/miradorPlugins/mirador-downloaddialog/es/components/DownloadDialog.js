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
      renderings = _ref.renderings,
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


  /*
   * Download IIIF manifest as formatted JSON file
   * Filename = manifest UUID.json
   */
  var downloadManifest = function downloadManifest() {

    fetch(manifestUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {

        var uuid = manifestUrl
          .split("/iiif/")[1]
          .split("/manifest")[0];

        var blob = new Blob(
          [JSON.stringify(json, null, 2)],
          {
            type: "application/json"
          }
        );

        var url = URL.createObjectURL(blob);

        var link = document.createElement("a");
        link.href = url;
        link.download = uuid + ".json";

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);

      });
  };


  return /*#__PURE__*/React.createElement(
    Dialog,
    {
      container: document.querySelector("#" + containerId + " ." + ns("viewer")),
      fullWidth: true,
      maxWidth: "xs",
      onClose: closeDialog,
      open: dialogOpen,
      scroll: "paper"
    },


    /*#__PURE__*/React.createElement(
      DialogTitle,
      { disableTypography: true },
      /*#__PURE__*/React.createElement(
        Typography,
        { variant: "h4" },
        /*#__PURE__*/React.createElement(
          Box,
          { fontWeight: "fontWeightBold" },
          t("downloadOptions")
        )
      )
    ),


    /*#__PURE__*/React.createElement(
      ScrollIndicatedDialogContent,
      { dividers: true },


      visibleCanvases.map(function (canvas) {

        var _infoResponse$json;

        return /*#__PURE__*/React.createElement(CanvasDownloadLinks, {
          canvas: canvas,
          key: canvas.id,
          label: canvasLabel(canvas.id),
          sizes: (_infoResponse$json = infoResponse(canvas.id).json) === null || _infoResponse$json === void 0 ? void 0 : _infoResponse$json.sizes,
          t: t
        });

      }),


      /*#__PURE__*/React.createElement(
        DownloadDialogPluginArea,
        {
          windowId: windowId
        }
      ),


      children,


      /*#__PURE__*/React.createElement(
        Box,
        {
          sx: {
            marginTop: "1rem"
          }
        },


        /*#__PURE__*/React.createElement(
          Card,
          {
            raised: true
          },


          /*#__PURE__*/React.createElement(
            CardContent,
            null,


            /*#__PURE__*/React.createElement(
              Typography,
              {
                component: "h5",
                style: {
                  textTransform: "none"
                },
                variant: "h6"
              },

              /*#__PURE__*/React.createElement(
                Box,
                {
                  fontWeight: "fontWeightBold"
                },
                t("otherDownloadOptions")
              )

            ),


            /*#__PURE__*/React.createElement(
              List,
              null,


              /* PDF renderings */
              renderings.map(function (_ref2) {

                var value = _ref2.value;


                return /*#__PURE__*/React.createElement(
                  ListItem,
                  {
                    dense: true,
                    key: value
                  },

                  /*#__PURE__*/React.createElement(
                    Box,
                    {
                      fontFamily:
                        theme.typography.fontFamily || "sans-serif",

                      fontSize: "0.75rem"
                    },


                    /*#__PURE__*/React.createElement(
                      Link,
                      {
                        href: value,
                        rel: "noopener",
                        target: "_blank"
                      },
					  t("downloadPdf")

                    )

                  )

                );

              }),
			  
			  /* IIIF Manifest download */
              /*#__PURE__*/React.createElement(
                ListItem,
                {
                  dense: true
                },

                /*#__PURE__*/React.createElement(
                  Box,
                  {
                    fontFamily:
                      (_theme$typography$fon =
                        theme.typography.fontFamily) !== null &&
                        _theme$typography$fon !== void 0
                        ? _theme$typography$fon
                        : "sans-serif",

                    fontSize: "0.75rem"
                  },

                  /*#__PURE__*/React.createElement(
                    Link,
                    {
                      component: "button",
                      onClick: downloadManifest
                    },
                    t("iiifManifest")
                  )

                )

              ),

              /* seeAlso */
              seeAlso.filter(function (_ref3) {

                var format = _ref3.format;

                return format !== "text/html";

              }).map(function (_ref4) {

                var label = _ref4.label,
                    value = _ref4.value;


                return /*#__PURE__*/React.createElement(
                  ListItem,
                  {
                    dense: true,
                    key: value
                  },

                  /*#__PURE__*/React.createElement(
                    Box,
                    {
                      fontFamily:
                        theme.typography.fontFamily || "sans-serif",

                      fontSize: "0.75rem"
                    },


                    /*#__PURE__*/React.createElement(
                      Link,
                      {
                        href: value,
                        rel: "noopener",
                        target: "_blank"
                      },

                      label

                    )

                  )

                );

              })

            )

          )

        )

      )

    ),


    /*#__PURE__*/React.createElement(
      DialogActions,
      null,

      /*#__PURE__*/React.createElement(
        Button,
        {
          color: "primary",
          onClick: closeDialog
        },
        t("close")
      )

    )

  );

};


DownloadDialog.defaultProps = {
  children: undefined,
  manifestUrl: undefined,
  renderings: [],
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

  renderings: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    })
  ),

  seeAlso: PropTypes.arrayOf(
    PropTypes.shape({
      format: PropTypes.string,
      label: PropTypes.string,
      value: PropTypes.string
    })
  ),

  t: PropTypes.func.isRequired,

  updateConfig: PropTypes.func.isRequired,

  visibleCanvases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      index: PropTypes.number
    })
  ).isRequired,

  windowId: PropTypes.string.isRequired

} : {};


export default DownloadDialog;