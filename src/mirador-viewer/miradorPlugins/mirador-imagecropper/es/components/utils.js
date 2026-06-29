/** Constructs the attribution string from the data given in the manifest */
var getAttributionString = function getAttributionString(requiredStatement) {
  if (!requiredStatement.length) {
    return null;
  }
  var initial = requiredStatement.shift();
  return requiredStatement.reduce(function (acc, current) {
    return acc + ", " + current.values.join(", ");
  }, initial.values.join(", "));
};

/** Constructs a share link for the given content and provider */
var getShareLink = function getShareLink(attribution, imageUrl, label, provider, thumbnailUrl) {
  var text = label;
  if (attribution) {
    text += " (" + attribution + ")";
  }
  switch (provider) {
    case "envelope":
      return "mailto:?subject=" + text + "&body=" + text + ": " + imageUrl;
    default:
      return null;
  }
};
export { getAttributionString, getShareLink };