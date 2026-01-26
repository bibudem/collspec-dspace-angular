import CanvasDownloadLinks from 'mirador-dl-plugin/es/CanvasDownloadLinks';

class CustomCanvasDownloadLinks extends CanvasDownloadLinks {
  fullImageUrl() {
    const { canvas } = this.props;
    return canvas.getCanonicalImageUri().replace(/\/full\/.*\/0\//, '/full/max/0/') + '?download=true';
  }
}

export default CustomCanvasDownloadLinks;
