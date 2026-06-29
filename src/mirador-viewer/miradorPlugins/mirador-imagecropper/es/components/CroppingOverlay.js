function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import makeStyles from "@material-ui/core/styles/makeStyles";
import ShareIcon from "@material-ui/icons/Share";
import { MiradorMenuButton } from "mirador/dist/es/src/components/MiradorMenuButton";
import { Point } from "openseadragon";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Rnd } from "react-rnd";

/** Converts the corner points of the image to coordinates in the browser */
var getImageBounds = function getImageBounds(image, width, height) {
  var topLeft = image.imageToViewerElementCoordinates(new Point(0, 0));
  var topRight = image.imageToViewerElementCoordinates(new Point(width, 0));
  var bottomLeft = image.imageToViewerElementCoordinates(new Point(0, height));
  return {
    x: Math.ceil(topLeft.x),
    y: Math.ceil(topLeft.y),
    w: Math.floor(topRight.x - topLeft.x),
    h: Math.floor(bottomLeft.y - topLeft.y)
  };
};

/** Calculates the initial region of the current image */
var getInitialRegion = function getInitialRegion(image, width, height) {
  var _getImageBounds = getImageBounds(image, width, height),
    x = _getImageBounds.x,
    y = _getImageBounds.y,
    w = _getImageBounds.w,
    h = _getImageBounds.h;
  return {
    // a fourth of the image width
    x: Math.ceil(x + w / 4),
    // a fourth of the image height
    y: Math.ceil(y + h / 4),
    // the half of the image width
    w: Math.floor(w / 2),
    // the half of the image height
    h: Math.floor(h / 2)
  };
};

/** Checks if the given region is inside the bounds of the image */
var isInsideImage = function isInsideImage(bounds, _ref) {
  var x = _ref.x,
    y = _ref.y,
    w = _ref.w,
    h = _ref.h;
  return x >= bounds.x && y >= bounds.y && x + w <= bounds.x + bounds.w && y + h <= bounds.y + bounds.h;
};

/** Converts the given region in browser coordinates to image coordinates */
var toImageCoordinates = function toImageCoordinates(image, _ref2) {
  var x = _ref2.x,
    y = _ref2.y,
    w = _ref2.w,
    h = _ref2.h;
  var topLeft = image.viewerElementToImageCoordinates(new Point(x, y));
  var topRight = image.viewerElementToImageCoordinates(new Point(x + w, y));
  var bottomLeft = image.viewerElementToImageCoordinates(new Point(x, y + h));
  return {
    x: Math.ceil(topLeft.x),
    y: Math.ceil(topLeft.y),
    w: Math.floor(topRight.x - topLeft.x),
    h: Math.floor(bottomLeft.y - topLeft.y)
  };
};
var useStyles = makeStyles(function () {
  return {
    dialogButton: {
      backgroundColor: "rgba(255,255,255,0.8) !important",
      borderRadius: "25%",
      color: "rgba(0, 0, 0, 0.54) !important",
      left: "0",
      position: function position(_ref3) {
        var buttonOutside = _ref3.buttonOutside;
        return buttonOutside && "absolute";
      },
      top: "5px",
      transform: function transform(_ref4) {
        var buttonOutside = _ref4.buttonOutside;
        return buttonOutside ? "translateX(calc(-100% - 5px))" : "translateX(5px)";
      }
    },
    resizeHandle: {
      background: "white",
      border: "2px solid gray",
      boxSizing: "border-box",
      height: "50%",
      left: "25%",
      position: "absolute",
      top: "25%",
      width: "50%"
    },
    root: {
      border: "1px dashed black",
      boxShadow: "0 0 0 9999em rgba(0, 0, 0, 0.65)",
      position: "absolute",
      zIndex: "1"
    }
  };
});

/** Renders the overlay used for defining the cropping region by dragging and resizing */
var CroppingOverlay = function CroppingOverlay(_ref5) {
  var config = _ref5.config,
    containerId = _ref5.containerId,
    croppingRegion = _ref5.croppingRegion,
    currentCanvas = _ref5.currentCanvas,
    resetRotation = _ref5.resetRotation,
    setCroppingRegion = _ref5.setCroppingRegion,
    t = _ref5.t,
    updateConfig = _ref5.updateConfig,
    viewer = _ref5.viewer,
    viewerConfig = _ref5.viewerConfig,
    viewType = _ref5.viewType;
  var active = config.active,
    dialogOpen = config.dialogOpen,
    enabled = config.enabled;
  var isInitialRenderOfCanvas = Object.entries(croppingRegion).filter(function (_ref6) {
    var k = _ref6[0];
    return k !== "imageCoordinates";
  }).every(function (_ref7) {
    var v = _ref7[1];
    return v === 0;
  });
  var _useState = useState(true),
    buttonOutside = _useState[0],
    setButtonOutside = _useState[1];
  var _useStyles = useStyles({
      buttonOutside: buttonOutside
    }),
    dialogButton = _useStyles.dialogButton,
    resizeHandle = _useStyles.resizeHandle,
    root = _useStyles.root;
  useEffect(function () {
    if (isInitialRenderOfCanvas) {
      setButtonOutside(true);
    }
  }, [isInitialRenderOfCanvas]);
  if (!enabled || !active || !viewer || !currentCanvas || viewType !== "single") {
    return null;
  }
  /*
   * FIXME: there seems to be a bug in Mirador, that viewerConfig is null in certain situations:
   * when changing the view type, viewerConfig will be null, see https://github.com/ProjectMirador/mirador/blob/master/src/state/reducers/viewers.js#L20-L21
   * only on the first page it doesn't get reset to a valid object, on all other pages there is no problem
   */
  var _ref8 = viewerConfig !== null && viewerConfig !== void 0 ? viewerConfig : {},
    _ref8$rotation = _ref8.rotation,
    rotation = _ref8$rotation === void 0 ? 0 : _ref8$rotation;
  /*
   * FIXME: at the moment the calculation of coordinates does not work with a rotated image, so we just reset the rotation
   * This is only a problem if the user can change the rotation by e.g. the mirador-image-tools plugin
   */
  if (rotation !== 0) {
    resetRotation();
  }
  var canvasWidth = currentCanvas.getWidth();
  var canvasHeight = currentCanvas.getHeight();
  var currentImage = viewer.world.getItemAt(0);
  /* Set initial region dependant on the current image if this is the initial render for the canvas */
  if (currentImage && isInitialRenderOfCanvas) {
    setCroppingRegion(getInitialRegion(currentImage, canvasWidth, canvasHeight));
  }
  var ResizeHandle = /*#__PURE__*/React.createElement("div", {
    className: resizeHandle
  });
  return /*#__PURE__*/React.createElement(Rnd, {
    bounds: "parent",
    cancel: "." + dialogButton.split(" ")[0],
    className: root,
    minHeight: 50,
    minWidth: 50,
    onDrag: function onDrag(_evt, _ref9) {
      var x = _ref9.x,
        y = _ref9.y;
      var imageBounds = getImageBounds(currentImage, canvasWidth, canvasHeight);
      if (isInsideImage(imageBounds, _extends({}, croppingRegion, {
        x: x,
        y: y
      }))) {
        setCroppingRegion({
          x: x,
          y: y
        });
        /*
         * Put the button inside the overlay if it would be cut off by the window borders
         * (35 is the width of the button)
         */
        if (x <= 35) {
          setButtonOutside(false);
        } else {
          setButtonOutside(true);
        }
      }
    },
    onResize: function onResize(_evt, _dir, _ref10, _delta, _ref11) {
      var h = _ref10.offsetHeight,
        w = _ref10.offsetWidth;
      var x = _ref11.x,
        y = _ref11.y;
      var imageBounds = getImageBounds(currentImage, canvasWidth, canvasHeight);
      if (isInsideImage(imageBounds, {
        x: x,
        y: y,
        w: w,
        h: h
      })) {
        setCroppingRegion({
          x: x,
          y: y,
          w: w,
          h: h
        });
        /*
         * Put the button inside the overlay if it would be cut off by the window borders
         * (35 is the width of the button)
         */
        if (x <= 35) {
          setButtonOutside(false);
        } else {
          setButtonOutside(true);
        }
      }
    },
    position: {
      x: croppingRegion.x,
      y: croppingRegion.y
    },
    resizeHandleComponent: {
      bottomLeft: ResizeHandle,
      bottomRight: ResizeHandle,
      topLeft: ResizeHandle,
      topRight: ResizeHandle
    },
    size: {
      height: croppingRegion.h,
      width: croppingRegion.w
    }
  }, /*#__PURE__*/React.createElement(MiradorMenuButton, {
    "aria-expanded": dialogOpen,
    "aria-label": t("imageCropper.openDialog"),
    className: dialogButton,
    containerId: containerId,
    onClick: function onClick() {
      setCroppingRegion({
        imageCoordinates: toImageCoordinates(currentImage, croppingRegion)
      });
      updateConfig(_extends({}, config, {
        dialogOpen: true
      }));
    },
    size: "small"
  }, /*#__PURE__*/React.createElement(ShareIcon, null)));
};
CroppingOverlay.defaultProps = {
  currentCanvas: undefined,
  viewer: undefined,
  viewerConfig: undefined
};
CroppingOverlay.propTypes = process.env.NODE_ENV !== "production" ? {
  config: PropTypes.shape({
    active: PropTypes.bool.isRequired,
    dialogOpen: PropTypes.bool.isRequired,
    enabled: PropTypes.bool.isRequired
  }).isRequired,
  containerId: PropTypes.string.isRequired,
  croppingRegion: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    w: PropTypes.number,
    h: PropTypes.number
  }).isRequired,
  currentCanvas: PropTypes.shape({
    getHeight: PropTypes.func.isRequired,
    getWidth: PropTypes.func.isRequired
  }),
  resetRotation: PropTypes.func.isRequired,
  setCroppingRegion: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  updateConfig: PropTypes.func.isRequired,
  viewer: PropTypes.shape({
    world: PropTypes.shape({
      getItemAt: PropTypes.func.isRequired
    }).isRequired
  }),
  viewerConfig: PropTypes.shape({
    rotation: PropTypes.number.isRequired
  }),
  viewType: PropTypes.string.isRequired
} : {};
export default CroppingOverlay;