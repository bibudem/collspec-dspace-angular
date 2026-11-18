import {
  Component,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ThemedLoadingComponent } from '../../../../app/shared/loading/themed-loading.component';
import { SafeUrlPipe } from '../../../../app/shared/utils/safe-url-pipe';
import { ThumbnailComponent as BaseComponent } from '../../../../app/thumbnail/thumbnail.component';

/**
 * Vignette DSpace avec un fond flou de la même image (utilisé dans la vue Mosaïque).
 */
@Component({
  selector: 'ds-themed-thumbnail',
  styleUrls: [
    '../../../../app/thumbnail/thumbnail.component.scss',
    './thumbnail.component.scss',
  ],
  templateUrl: './thumbnail.component.html',
  imports: [
    SafeUrlPipe,
    ThemedLoadingComponent,
    TranslatePipe,
  ],
})
export class ThumbnailComponent extends BaseComponent {
  /** Image par défaut du thème */
  readonly collspecDefaultImage = '/assets/collspec/images/imageDefaultcollspec.jpg';

  /** Grande image paysage : peut remplir le cadre sans perte de netteté */
  isLargeLandscape = signal(false);

  /** Petite vignette générée par DSpace (≤ 200 px) */
  isSmall = signal(false);

  /** Mesure la taille réelle de l'image une fois chargée */
  onImageLoad(img: HTMLImageElement): void {
    this.successHandler();
    const { naturalWidth: w, naturalHeight: h } = img;
    this.isLargeLandscape.set(w >= 400 && h > 0 && w / h >= 1.2);
    this.isSmall.set(w > 0 && w <= 200 && h <= 200);
  }
}
