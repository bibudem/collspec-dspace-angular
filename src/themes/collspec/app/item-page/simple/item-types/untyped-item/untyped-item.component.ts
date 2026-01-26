import {AsyncPipe, CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component, OnInit, ViewChild,
} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Context } from '../../../../../../../app/core/shared/context.model';
import { Item } from '../../../../../../../app/core/shared/item.model';
import { ViewMode } from '../../../../../../../app/core/shared/view-mode.model';
import { CollectionsComponent } from '../../../../../../../app/item-page/field-components/collections/collections.component';
import { ThemedMediaViewerComponent } from '../../../../../../../app/item-page/media-viewer/themed-media-viewer.component';
import { MiradorViewerComponent } from '../../../../../../../app/item-page/mirador-viewer/mirador-viewer.component';
import { ThemedFileSectionComponent } from '../../../../../../../app/item-page/simple/field-components/file-section/themed-file-section.component';
import { ItemPageAbstractFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/abstract/item-page-abstract-field.component';
import { ItemPageCcLicenseFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/cc-license/item-page-cc-license-field.component';
import { ItemPageDateFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/date/item-page-date-field.component';
import { GenericItemPageFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { ThemedItemPageTitleFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { ItemPageUriFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/uri/item-page-uri-field.component';
import { UntypedItemComponent as BaseComponent } from '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { ThemedMetadataRepresentationListComponent } from '../../../../../../../app/item-page/simple/metadata-representation-list/themed-metadata-representation-list.component';
import { DsoEditMenuComponent } from '../../../../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { MetadataFieldWrapperComponent } from '../../../../../../../app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { listableObjectComponent } from '../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { ThemedResultsBackButtonComponent } from '../../../../../../../app/shared/results-back-button/themed-results-back-button.component';
import { ThemedThumbnailComponent } from '../../../../../../../app/thumbnail/themed-thumbnail.component';
import {config} from "../../../../../config/config";
import {RouteService} from "../../../../../../../app/core/services/route.service";
import {ItemDataService} from "../../../../../../../app/core/data/item-data.service";
import {NgbModal, NgbModule, NgbNav} from "@ng-bootstrap/ng-bootstrap";
import {FullFileSectionComponent} from "../../../../../../../app/item-page/full/field-components/file-section/full-file-section.component";

/**
 * Component that represents an untyped Item page
 */
@listableObjectComponent(Item, ViewMode.StandalonePage, Context.Any, 'collspec')
@Component({
  selector: 'ds-untyped-item',
  styleUrls: ['./untyped-item.component.scss'],
  //styleUrls: ['../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component.scss'],
  templateUrl: './untyped-item.component.html',
  //templateUrl: '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ThemedResultsBackButtonComponent,
    MiradorViewerComponent,
    ThemedItemPageTitleFieldComponent,
    DsoEditMenuComponent,
    MetadataFieldWrapperComponent,
    ThemedThumbnailComponent,
    ThemedMediaViewerComponent,
    ThemedFileSectionComponent,
    ItemPageDateFieldComponent,
    ThemedMetadataRepresentationListComponent,
    GenericItemPageFieldComponent,
    ItemPageAbstractFieldComponent,
    ItemPageUriFieldComponent,
    CollectionsComponent,
    RouterLink,
    AsyncPipe,
    TranslateModule,
    ItemPageCcLicenseFieldComponent,
    //add bibUdem modules
    CommonModule,
    NgbModule,
    FullFileSectionComponent
  ],
})
export class UntypedItemComponent extends BaseComponent implements OnInit {
  activeTab: number = 1;
  metadata: any[] = [];  // Tableau pour stocker les métadonnées de l'élément
  itemRD : any;
  backendApi: string = config.backendApi;
  idItem: string;
  activeTabParam: string;

  @ViewChild('nav') nav: NgbNav;

  constructor(
    protected routeService: RouteService,
    protected router: Router,
    protected route: ActivatedRoute,
    private itemDataService: ItemDataService,
    private modalService: NgbModal
  ) {
    super(routeService, router);
  }

  ngOnInit() {
    super.ngOnInit();

    // Récupérer l'ID de l'élément à partir de l'URL
    this.idItem = this.route.snapshot.paramMap.get('id');

    // Récupérer le paramètre d'URL 'tab' (ou un autre nom que vous préférez)
    this.activeTabParam = this.route.snapshot.queryParamMap.get('tab');

    // Définir l'onglet actif en fonction du paramètre d'URL
    this.activeTab = this.activeTabParam ? +this.activeTabParam : 1;

    // Appeler le service pour récupérer l'élément avec les métadonnées
    this.itemDataService.findById(this.idItem).subscribe(
      (item) => {
        this.itemRD = item;
        // Accéder aux métadonnées de l'élément
        this.metadata = Object.entries(item.payload.metadata).map(([key, value]) => ({
          label: key,
          value: this.extractMetadataValues(value),
        }));
      },
      (error) => {
        console.error('Erreur lors de la récupération de l\'élément :', error);
      }
    );
  }

  /**
   * Extraire les valeurs des métadonnées
   */
  extractMetadataValues(metadataValue: any): any {
    if (Array.isArray(metadataValue) && metadataValue.length > 0) {
      return metadataValue.map((mv) => mv.value);
    } else {
      return null;
    }
  }

  /**
   * Masquer une section de l'interface utilisateur
   */
  hideSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = 'none';
    }
  }

  /**
   * Afficher une section de l'interface utilisateur
   */
  displaySection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = 'block';
    }
  }

  openDialog(content): void {
    this.modalService.open(content, { centered: true });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  async redirectToClipSearch(): Promise<void> {
    this.closeModal();

    try {
      // Récupérer les informations sur les bundles de l'élément
      const response = await fetch(`${this.backendApi}items/${this.idItem}/bundles`);
      if (!response.ok) {
        throw new Error('Failed to fetch bundles');
      }
      const infoUrlBundles = await response.json();

      // Rechercher le bundle "ORIGINAL"
      const originalBundle = infoUrlBundles._embedded.bundles.find((bundle) => bundle.name === 'ORIGINAL');

      if (originalBundle) {
        // Récupérer le lien vers le premier bitstream du bundle "ORIGINAL"
        const bitstreamsResponse = await fetch(originalBundle._links.bitstreams.href);
        if (!bitstreamsResponse.ok) {
          throw new Error('Failed to fetch bitstreams');
        }
        const bitstreamsInfo = await bitstreamsResponse.json();

        // Extraire le lien du premier bitstream
        const firstBitstreamUrl = bitstreamsInfo._embedded.bitstreams[0]._links.content.href;

        // Définir les paramètres de requête
        const queryParams = {
          query: null,
          url: firstBitstreamUrl,
        };

        // Naviguer vers la page de recherche de clips avec les paramètres de requête
        this.router.navigate(['/ai-search'], { queryParams });
      } else {
        console.error('Bundle "ORIGINAL" introuvable.');
      }
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la récupération des bundles :', error);
    }
  }
}
