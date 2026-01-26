import React from 'react';
import { MiradorDownloadDialog } from 'mirador-dl-plugin/es/MiradorDownloadDialog';
import CustomCanvasDownloadLinks from './CustomCanvasDownloadLinks';
import { withStyles } from '@material-ui/core/styles';
import {connect} from "http2";

/**
 * CustomMiradorDownloadDialog ~
 * Extends MiradorDownloadDialog to replace CanvasDownloadLinks with CustomCanvasDownloadLinks
 */
class CustomMiradorDownloadDialog extends MiradorDownloadDialog {
  render() {
    const {
      canvases,
      canvasLabel,
      classes,
      closeDialog,
      containerId,
      infoResponse,
      open,
      restrictDownloadOnSizeDefinition,
      viewType,
      windowId,
    } = this.props;

    if (!open) return '';

    return (
      <React.Fragment>
        <Dialog
          container={document.querySelector('#' + containerId + ' .mirador-viewer')}
          disableEnforceFocus={true}
          onClose={closeDialog}
          open={open}
          scroll="paper"
          fullWidth={true}
          maxWidth="xs"
        >
          <DialogTitle disableTypography={true} className={classes.h2}>
            <Typography variant="h2">Download</Typography>
          </DialogTitle>
          <ScrollIndicatedDialogContent>
            {canvases.map((canvas) => (
              <CustomCanvasDownloadLinks // Utilisation du composant personnalisé
                key={canvas.id}
                canvas={canvas}
                canvasLabel={canvasLabel(canvas.id)}
                classes={classes}
                infoResponse={infoResponse(canvas.id)}
                restrictDownloadOnSizeDefinition={restrictDownloadOnSizeDefinition}
                viewType={viewType}
                windowId={windowId}
              />
            ))}
            {this.renderings().length > 0 && (
              <ManifestDownloadLinks
                classes={classes}
                renderings={this.renderings()}
              />
            )}
          </ScrollIndicatedDialogContent>
          <DialogActions>
            <Button onClick={closeDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

const styles = {
  h2: {
    paddingBottom: 0,
  },
  h3: {
    marginTop: '20px',
  },
};

const mapStateToProps = (state, { windowId }) => ({
  canvases: getVisibleCanvases(state, { windowId }),
  canvasLabel: (canvasId) =>
    getCanvasLabel(state, { canvasId, windowId }),
  containerId: getContainerId(state),
  infoResponse: (canvasId) =>
    selectInfoResponse(state, { windowId, canvasId }) || {},
  manifest: getManifestoInstance(state, { windowId }),
  restrictDownloadOnSizeDefinition:
    state.config.miradorDownloadPlugin &&
    state.config.miradorDownloadPlugin.restrictDownloadOnSizeDefinition,
  open:
    state.windowDialogs[windowId] &&
    state.windowDialogs[windowId].openDialog === 'download',
  viewType: getWindowViewType(state, { windowId }),
});

const mapDispatchToProps = (dispatch, { windowId }) => ({
  closeDialog: () =>
    dispatch({ type: 'CLOSE_WINDOW_DIALOG', windowId }),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(CustomMiradorDownloadDialog));
