/** Constructs a share link for the given content and provider */
var getShareLink = function getShareLink(attribution, canvasLink, label, provider, thumbnailUrl) {
  var text = label;
  if (attribution) {
    text += " (" + attribution + ")";
  }
  switch (provider) {
    case "envelope":
      return "mailto:?subject=" + text + "&body=" + text + ": " + canvasLink;
    default:
      return null;
  }
};
export { getShareLink };