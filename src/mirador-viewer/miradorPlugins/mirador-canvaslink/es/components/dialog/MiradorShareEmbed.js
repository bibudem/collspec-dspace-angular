function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createTheme, withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import EmbedSizeIcon from './EmbedSizeIcon';

/**
 * MiradorShareEmbed ~
*/

var MiradorShareEmbed = function (_Component) {
  _inherits(MiradorShareEmbed, _Component);

  MiradorShareEmbed.sizes = function sizes() {
    return {
      small: {
        iconWidth: 70,
        iconHeight: 52,
        viewerWidth: 560,
        viewerHeight: 420
      },
      medium: {
        iconWidth: 80,
        iconHeight: 60,
        viewerWidth: 640,
        viewerHeight: 480
      },
      large: {
        iconWidth: 90,
        iconHeight: 67,
        viewerWidth: 800,
        viewerHeight: 600
      },
      extraLarge: {
        iconWidth: 100,
        iconHeight: 75,
        viewerWidth: 1024,
        viewerHeight: 768
      }
    };
  };

  function MiradorShareEmbed(props) {
    _classCallCheck(this, MiradorShareEmbed);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.state = {
      selectedSize: 'small'
    };
    return _this;
  }

  MiradorShareEmbed.prototype.handleSizeSelect = function handleSizeSelect(size) {
    this.setState({
      selectedSize: size
    });
  };

  MiradorShareEmbed.prototype.formControlLabelsForSizes = function formControlLabelsForSizes() {
    var classes = this.props.classes;
    var selectedSize = this.state.selectedSize;

    var sizes = MiradorShareEmbed.sizes();
    var iconColor = createTheme().palette.grey[500];
    var icon = function icon(width, height) {
      return React.createElement(EmbedSizeIcon, {
        fillColor: iconColor,
        width: width,
        height: height
      });
    };

    return Object.keys(sizes).map(function (sizeKey) {
      var size = sizes[sizeKey];
      return React.createElement(FormControlLabel, {
        className: [classes.formControlLabel, selectedSize === sizeKey ? classes.selectedFormControlLabel : ''].join(' '),
        control: React.createElement(Radio, {
          checkedIcon: icon(size.iconWidth, size.iconHeight),
          icon: icon(size.iconWidth, size.iconHeight)
        }),
        key: sizeKey,
        label: size.viewerWidth + 'x' + size.viewerHeight,
        labelPlacement: 'top',
        value: sizeKey
      });
    });
  };

  MiradorShareEmbed.prototype.additionalEmbedParams = function additionalEmbedParams() {
    var syncIframeDimensions = this.props.syncIframeDimensions;
    var selectedSize = this.state.selectedSize;

    var size = MiradorShareEmbed.sizes()[selectedSize];

    if (!(syncIframeDimensions.height || syncIframeDimensions.width)) {
      return '';
    }

    var params = [];

    if (syncIframeDimensions.width) {
      params.push(syncIframeDimensions.width.param + '=' + size.viewerWidth);
    }

    if (syncIframeDimensions.height) {
      params.push(syncIframeDimensions.height.param + '=' + size.viewerHeight);
    }

    return '&' + params.join('&');
  };

  MiradorShareEmbed.prototype.embedUrl = function embedUrl() {
    var _props = this.props,
        embedUrlReplacePattern = _props.embedUrlReplacePattern,
        manifestId = _props.manifestId;

    return '' + manifestId.replace(embedUrlReplacePattern[0], embedUrlReplacePattern[1]) + this.additionalEmbedParams();
  };

  MiradorShareEmbed.prototype.embedCode = function embedCode() {
    var _props2 = this.props,
        embedIframeAttributes = _props2.embedIframeAttributes,
        embedIframeTitle = _props2.embedIframeTitle;
    var selectedSize = this.state.selectedSize;

    var size = MiradorShareEmbed.sizes()[selectedSize];

    return '<iframe src="' + this.embedUrl() + '" title="' + embedIframeTitle + '" width="' + size.viewerWidth + '" height="' + size.viewerHeight + '" ' + embedIframeAttributes + '></iframe>';
  };

  /**
   * Returns the rendered component
  */

  MiradorShareEmbed.prototype.render = function render() {
    var _this2 = this;

    var _props3 = this.props,
        classes = _props3.classes,
        t = _props3.t;

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(SnackbarProvider, {
        maxSnack: 1,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      }),
      React.createElement(
        FormControl,
        { component: 'fieldset', className: classes.formControl },
        React.createElement(
          FormLabel,
          { component: 'legend', className: classes.legend },
          t("canvasLink.embedSize")
        ),
        React.createElement(
          RadioGroup,
          {
            'aria-label': t("canvasLink.embedSize"),
            className: classes.radioGroup,
            name: 'viwerSize',
            onChange: function onChange(e) {
              _this2.handleSizeSelect(e.target.value);
            }
          },
          this.formControlLabelsForSizes()
        )
      ),
      React.createElement(
        FormControl,
        { component: 'fieldset', className: classes.formControl },
        React.createElement(
          FormLabel,
          { className: classes.label, htmlFor: 'copyCode' },
          t("canvasLink.embedCode")
        ),
        React.createElement(
          'div',
          { className: classes.inputContainer },
          React.createElement(TextField, {
            id: 'copyCode',
            fullWidth: true,
            multiline: true,
            rows: 4,
            value: this.embedCode(),
            variant: 'filled'
          }),
          React.createElement(
            CopyToClipboard,
            { text: this.embedCode() },
            React.createElement(
              Button,
              {
                className: classes.copyButton,
                variant: 'outlined',
                color: 'primary',
                'aria-label': t("canvasLink.copyToClipboard"),
                onClick: function onClick() {
                  return enqueueSnackbar(React.createElement(
                    Typography,
                    { variant: 'body1' },
                    t("canvasLink.embedCopied")
                  ), { variant: 'success' });
                }
              },
              t("canvasLink.copy")
            )
          )
        )
      )
    );
  };

  return MiradorShareEmbed;
}(Component);

MiradorShareEmbed.propTypes = process.env.NODE_ENV !== "production" ? {
  classes: PropTypes.shape({
    copyButton: PropTypes.string,
    formControl: PropTypes.string,
    formControlLabel: PropTypes.string,
    legend: PropTypes.string,
    label: PropTypes.string,
    inputContainer: PropTypes.string,
    radioGroup: PropTypes.string,
    selectedFormControlLabel: PropTypes.string
  }),
  embedIframeAttributes: PropTypes.string.isRequired,
  embedIframeTitle: PropTypes.string.isRequired,
  embedUrlReplacePattern: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(RegExp)])).isRequired,
  manifestId: PropTypes.string,
  syncIframeDimensions: PropTypes.shape({
    height: PropTypes.shape({ param: PropTypes.string }),
    width: PropTypes.shape({ param: PropTypes.string })
  }),
  t: PropTypes.func.isRequired
} : {};

MiradorShareEmbed.defaultProps = {
  classes: {},
  manifestId: null,
  syncIframeDimensions: {}
};

var styles = function styles(theme) {
  return {
    copyButton: {
      marginLeft: theme.spacing()
    },
    formControl: {
      width: '100%'
    },
    formControlLabel: {
      border: '1px solid ' + theme.palette.grey[500],
      height: '125px',
      flexGrow: 1,
      margin: '0',
      '&:hover': {
        backgroundColor: theme.palette.action.hover
      }
    },
    legend: {
      paddingBottom: theme.spacing(),
      paddingTop: theme.spacing()
    },
    label: {
      paddingBottom: theme.spacing(),
      paddingTop: theme.spacing()
    },
    inputContainer: {
      alignItems: 'flex-end',
      display: 'flex',
      flexDirection: 'row',
      marginBottom: theme.spacing()
    },
    radioGroup: {
      display: 'flex',
      flexDirection: 'row'
    },
    selectedFormControlLabel: {
      backgroundColor: theme.palette.action.selected
    }
  };
};

export default withStyles(styles)(MiradorShareEmbed);