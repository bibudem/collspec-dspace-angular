import Link from "@material-ui/core/Link";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Alert from "@material-ui/lab/Alert";
import PropTypes from "prop-types";
import React from "react";
var useStyles = makeStyles(function (theme) {
  return {
    root: {
      marginTop: theme.spacing(2)
    }
  };
});

/** Renders the rights information defined in the used manifest */
var RightsInformation = function RightsInformation(_ref) {
  var rights = _ref.rights,
    t = _ref.t;
  var _useStyles = useStyles(),
    root = _useStyles.root;
  if (!rights.length) {
    return null;
  }
  return /*#__PURE__*/React.createElement(Alert, {
    className: root,
    severity: "warning"
  }, /*#__PURE__*/React.createElement("span", null, t("canvasLink.noteRights", {
    count: rights.length
  }), ": "), rights.length === 1 ? /*#__PURE__*/React.createElement(Link, {
    href: rights[0],
    rel: "noopener",
    target: "_blank"
  }, rights[0]) : /*#__PURE__*/React.createElement("ul", null, rights.map(function (link) {
    return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Link, {
      href: link,
      rel: "noopener",
      target: "_blank"
    }, link));
  })));
};
RightsInformation.propTypes = process.env.NODE_ENV !== "production" ? {
  rights: PropTypes.arrayOf(PropTypes.string).isRequired,
  t: PropTypes.func.isRequired
} : {};
export default RightsInformation;