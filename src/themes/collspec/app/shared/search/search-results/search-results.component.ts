import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import {ActivatedRoute, Router, RouterLink, RouterModule} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import {
  fadeIn,
  fadeInOut,
} from '../../../../../../app/shared/animations/fade';
import { ErrorComponent } from '../../../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../../../app/shared/loading/themed-loading.component';
import { ObjectCollectionComponent } from '../../../../../../app/shared/object-collection/object-collection.component';
import { SearchExportCsvComponent } from '../../../../../../app/shared/search/search-export-csv/search-export-csv.component';
import { SearchResultsComponent as BaseComponent } from '../../../../../../app/shared/search/search-results/search-results.component';
import { SearchResultsSkeletonComponent } from '../../../../../../app/shared/search/search-results/search-results-skeleton/search-results-skeleton.component';
import { SearchService } from '../../../../../../app/core/shared/search/search.service';
import { SearchConfigurationService } from '../../../../../../app/core/shared/search/search-configuration.service';

import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'ds-themed-search-results',
  templateUrl: './search-results.component.html',
  //templateUrl: '../../../../../../app/shared/search/search-results/search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  animations: [
    fadeIn,
    fadeInOut,
  ],
  standalone: true,
  imports: [
    AsyncPipe,
    ErrorComponent,
    ThemedLoadingComponent,
    NgxSkeletonLoaderModule,
    ObjectCollectionComponent,
    RouterLink,
    SearchExportCsvComponent,
    SearchResultsSkeletonComponent,
    TranslateModule,
    RouterModule
  ],
})
export class SearchResultsComponent extends BaseComponent {
  collectionId: string | null = null;
  query: string = 'all';
  hidePaginationDetail = false;

  constructor(private modalService: NgbModal,
              private router: Router,
              private route: ActivatedRoute,
              public searchConfigService: SearchConfigurationService,
              public searchService: SearchService) {

    super(searchConfigService, searchService);
  }

  ngOnInit(): void {
    this.initializeSearchParameters();
  }

  private initializeSearchParameters(): void {
    this.collectionId = this.route.snapshot.paramMap.get('id');

    this.route.queryParams.subscribe((params) => {
      this.query = params['query'] || 'all';
    });

    this.hidePaginationDetail = this.collectionId === '463625e1-602d-4844-a94f-5df83c681054';
  }

  redirectToAiSearch(): void {
    const queryParams = {
      scope: this.collectionId || undefined,
      query: this.query || undefined,
    };

    // Utiliser navigate avec un objet pour simplifier la gestion des queryParams
    this.router.navigate(['/ai-search'], { queryParams });
  }
}
