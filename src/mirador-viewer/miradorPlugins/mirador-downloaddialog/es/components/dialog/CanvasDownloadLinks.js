import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Link from "@material-ui/core/Link";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import { useTheme } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import ImageLink from "./ImageLink";

var RenderingLink = function RenderingLink(_ref) {
  var href = _ref.href,
    text = _ref.text;
  var theme = useTheme();

  return /*#__PURE__*/React.createElement(
    Box,
    {
      fontFamily:
        theme &&
        theme.typography &&
        theme.typography.fontFamily
          ? theme.typography.fontFamily
          : "sans-serif",
      fontSize: "0.75rem"
    },
    /*#__PURE__*/React.createElement(
      Link,
      {
        href: href,
        target: "_blank",
        rel: "noopener noreferrer"
      },
      text
    )
  );
};

var getRenderingUrl = function getRenderingUrl(rendering) {
  if (!rendering) return null;

  if (typeof rendering.id === "string") return rendering.id;
  if (typeof rendering["@id"] === "string") return rendering["@id"];

  if (rendering.__jsonld) {
    if (typeof rendering.__jsonld.id === "string") return rendering.__jsonld.id;
    if (typeof rendering.__jsonld["@id"] === "string") return rendering.__jsonld["@id"];
  }

  return null;
};

var getRenderingFormat = function getRenderingFormat(rendering) {
  var format;

  if (!rendering) return null;

  if (typeof rendering.getFormat === "function") {
    format = rendering.getFormat();
    if (typeof format === "string") return format;
  }

  if (typeof rendering.format === "string") return rendering.format;

  if (rendering.__jsonld && typeof rendering.__jsonld.format === "string") {
    return rendering.__jsonld.format;
  }

  return null;
};

var normalizeLabelValue = function normalizeLabelValue(value) {
  if (!value) return null;

  if (typeof value === "string") return value;

  if (typeof value._value === "string") return value._value;
  if (typeof value.value === "string") return value.value;
  if (typeof value["@value"] === "string") return value["@value"];

  if (value.none && value.none[0]) return normalizeLabelValue(value.none[0]);
  if (value.en && value.en[0]) return normalizeLabelValue(value.en[0]);

  if (Array.isArray(value) && value.length > 0) {
    return normalizeLabelValue(value[0]);
  }

  if (typeof value.toString === "function" && value.toString !== Object.prototype.toString) {
    return value.toString();
  }

  return null;
};

var getRenderingLabel = function getRenderingLabel(rendering) {
  var label;

  if (!rendering) return null;

  if (typeof rendering.getLabel === "function") {
    label = rendering.getLabel();
    label = normalizeLabelValue(label);
    if (label) return label;
  }

  label = normalizeLabelValue(rendering.label);
  if (label) return label;

  if (rendering.__jsonld) {
    label = normalizeLabelValue(rendering.__jsonld.label);
    if (label) return label;
  }

  return null;
};

var CanvasDownloadLinks = function CanvasDownloadLinks(_ref2) {
  var canvas = _ref2.canvas,
    label = _ref2.label,
    sizes = _ref2.sizes,
    t = _ref2.t;

  var renderings =
    canvas && typeof canvas.getRenderings === "function"
      ? canvas.getRenderings() || []
      : [];

  var jpegLinks = sizes
    .sort(function (a, b) {
      return b.width - a.width;
    })
    .slice(1)
    .reduce(
      function (acc, _ref3) {
        var height = _ref3.height,
          width = _ref3.width;

        if (acc[acc.length - 1].width - width >= 500) {
          acc.push({
            height: height,
            width: width
          });
        }

        return acc;
      },
      [
        {
          height: canvas.getHeight(),
          width: canvas.getWidth()
        }
      ]
    );

  var renderingLinks = renderings
  .map(function (rendering) {
    var href = getRenderingUrl(rendering);
    var format = getRenderingFormat(rendering);
    var renderingLabel = getRenderingLabel(rendering);
    var width = canvas.getWidth();
    var height = canvas.getHeight();
    var prefix;
    var text;

    if (!href) return null;

    if (renderingLabel) {
      prefix = renderingLabel;
    } else if (format === "image/tiff") {
      prefix = "TIFF";
    } else if (format) {
      prefix = String(format);
    } else {
      prefix = "Download";
    }

    text = prefix + ": " + width + " x " + height + " " + t("pixels");

    return {
      href: href,
      text: text
    };
  })
  .filter(function (item) {
    return !!item;
  });

  return /*#__PURE__*/React.createElement(
    Card,
    {
      className: "mb-3",
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
          t("image") + ": " + label
        )
      ),
      /*#__PURE__*/React.createElement(
        List,
        null,
        jpegLinks.map(function (_ref4) {
          var height = _ref4.height,
            width = _ref4.width;

          return /*#__PURE__*/React.createElement(
            ListItem,
            {
              dense: true,
              key: "jpeg-" + height + "x" + width
            },
            /*#__PURE__*/React.createElement(ImageLink, {
              height: height,
              linkTarget: canvas.getCanonicalImageUri(width),
              t: t,
              width: width
            })
          );
        }),
        renderingLinks.map(function (item, index) {
          return /*#__PURE__*/React.createElement(
            ListItem,
            {
              dense: true,
              key: "rendering-" + index
            },
            /*#__PURE__*/React.createElement(RenderingLink, {
              href: item.href,
              text: item.text
            })
          );
        })
      )
    )
  );
};

CanvasDownloadLinks.defaultProps = {
  sizes: []
};

CanvasDownloadLinks.propTypes = process.env.NODE_ENV !== "production" ? {
  canvas: PropTypes.shape({
    getCanonicalImageUri: PropTypes.func.isRequired,
    getHeight: PropTypes.func.isRequired,
    getWidth: PropTypes.func.isRequired,
    getRenderings: PropTypes.func
  }).isRequired,
  label: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  sizes: PropTypes.arrayOf(
    PropTypes.shape({
      height: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired
    })
  ),
  t: PropTypes.func.isRequired
} : {};

export default CanvasDownloadLinks;