import {
  Component,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ThemedLoadingComponent } from '../../../../app/shared/loading/themed-loading.component';
import { SafeUrlPipe } from '../../../../app/shared/utils/safe-url-pipe';
import { ThumbnailComponent as BaseComponent } from '../../../../app/thumbnail/thumbnail.component';

/**
 * Vignette du thème collspec : identique à celle de DSpace, avec en plus un fond flou
 * (la même image, agrandie et floutée) derrière la vignette.
 * Ce fond n'est affiché que dans la vue « Mosaïque » (voir _global-styles.scss) : les vignettes
 * générées par DSpace sont petites, elles restent nettes à leur taille réelle et le fond flou
 * remplit le cadre sans montrer la basse résolution.
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
  /** Image par défaut du thème, aussi utilisée pour le fond flou quand l'objet n'a pas de vignette */
  readonly collspecDefaultImage = '/assets/collspec/images/imageDefaultcollspec.jpg';

  /**
   * Image paysage assez grande (≥ 400 px de large) : dans la Mosaïque elle peut remplir tout le
   * cadre sans être agrandie au-delà de sa résolution, donc sans flou.
   */
  isLargeLandscape = signal(false);

  /** Petite vignette générée par DSpace (≤ 200 px) : légèrement agrandie dans la Mosaïque */
  isSmall = signal(false);

  /** Image chargée : traitement DSpace habituel, puis mesure de sa taille réelle */
  onImageLoad(img: HTMLImageElement): void {
    this.successHandler();
    const { naturalWidth: w, naturalHeight: h } = img;
    this.isLargeLandscape.set(w >= 400 && h > 0 && w / h >= 1.2);
    this.isSmall.set(w > 0 && w <= 200 && h <= 200);
  }
}
