import MailIcon from "@material-ui/icons/Mail";
import { MiradorMenuButton } from "mirador/dist/es/src/components/MiradorMenuButton";
import PropTypes from "prop-types";
import React from "react";
import XIcon from "../icons/XIcon";
import { getShareLink } from "../utils";
var iconMapping = {
  envelope: MailIcon,
};

/** Renders a button for sharing the given content on one of the supported providers */
var ShareButton = function ShareButton(_ref) {
  var attribution = _ref.attribution,
    canvasLink = _ref.canvasLink,
    label = _ref.label,
    provider = _ref.provider,
    thumbnailUrl = _ref.thumbnailUrl,
    title = _ref.title;
  var link = getShareLink(attribution, canvasLink, label, provider, thumbnailUrl);
  var ProviderIcon = iconMapping[provider];
  return /*#__PURE__*/React.createElement(MiradorMenuButton, {
    "aria-label": title,
    href: encodeURI(link),
    rel: "noopener",
    target: "_blank"
  }, /*#__PURE__*/React.createElement(ProviderIcon, null));
};
ShareButton.defaultProps = {
  attribution: undefined
};
ShareButton.propTypes = process.env.NODE_ENV !== "production" ? {
  attribution: PropTypes.string,
  canvasLink: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
  thumbnailUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
} : {};
export default ShareButton;