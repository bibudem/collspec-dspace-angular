import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';

@Component({
  selector: 'ds-iiif-guide',
  templateUrl: './iiif-guide.component.html',
  styleUrls: ['./iiif-guide.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    NgbModule,
    ThemedLoadingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IiifGuideComponent {
  // For now, this page is purely static.
  // If you later want per-language variants, you can
  // adopt the same asset-loading pattern as AboutComponent.
}