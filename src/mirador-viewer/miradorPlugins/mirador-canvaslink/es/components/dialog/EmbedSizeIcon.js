import React from 'react';
import PropTypes from 'prop-types';

/**
 * EmbedSizeIcon ~
*/
export default function EmbedSizeIcon(props) {
  var fillColor = props.fillColor,
      height = props.height,
      width = props.width;


  return React.createElement(
    'svg',
    { width: width, height: height },
    React.createElement('rect', {
      width: width,
      height: height,
      style: { fill: fillColor, strokeWidth: 1, stroke: '#000000' }
    })
  );
}

EmbedSizeIcon.propTypes = process.env.NODE_ENV !== "production" ? {
  fillColor: PropTypes.string,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired
} : {};

EmbedSizeIcon.defaultProps = {
  fillColor: '#e0e0e0'
};