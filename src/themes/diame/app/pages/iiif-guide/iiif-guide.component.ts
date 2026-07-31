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


  manifestExample = `
{
  "id": "https://example.org/manifest.json",
  "type": "Manifest",
  "label": {
    "en": [
      "Example document"
    ]
  },
  "items": [
    {
      "id": "https://example.org/canvas/page1",
      "type": "Canvas",
      "height": 4000,
      "width": 3000
    }
  ]
}
`;


  imageApiExample = `
{
  "id": "https://example.org/image/1234",
  "type": "ImageService3",
  "profile": "level2"
}
`;


  annotationExample = `
{
  "id": "https://example.org/annotation/page1",
  "type": "AnnotationPage",
  "items": [
    {
      "type": "Annotation"
    }
  ]
}
`;


  miradorManifestExample = `
https://collections-speciales.bib.umontreal.ca/server/api/core/
iiif/manifest/{uuid}
`;

}