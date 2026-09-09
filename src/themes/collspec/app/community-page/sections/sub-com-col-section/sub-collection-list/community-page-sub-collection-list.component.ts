import { AsyncPipe } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest as observableCombineLatest,
  Subscription,
} from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
  SortDirection,
  SortOptions,
} from 'src/app/core/cache/models/sort-options.model';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { PaginationService } from 'src/app/core/pagination/pagination.service';
import { Collection } from 'src/app/core/shared/collection.model';
import { Community } from 'src/app/core/shared/community.model';
import { fadeIn } from 'src/app/shared/animations/fade';
import { hasValue } from 'src/app/shared/empty.util';
import { ErrorComponent } from 'src/app/shared/error/error.component';
import { ThemedLoadingComponent } from 'src/app/shared/loading/themed-loading.component';
import { ObjectCollectionComponent } from 'src/app/shared/object-collection/object-collection.component';
import { PaginationComponentOptions } from 'src/app/shared/pagination/pagination-component-options.model';
import { VarDirective } from 'src/app/shared/utils/var.directive';

@Component({
  selector: 'ds-base-community-page-sub-collection-list',
  styleUrls: ['./community-page-sub-collection-list.component.scss'],
  templateUrl: './community-page-sub-collection-list.component.html',
  animations: [fadeIn],
  imports: [
    AsyncPipe,
    ErrorComponent,
    ObjectCollectionComponent,
    ThemedLoadingComponent,
    TranslateModule,
    VarDirective,
  ],
})
export class CommunityPageSubCollectionListComponent implements OnInit, OnDestroy {
  @Input() community: Community;

  /**
   * Optional page size. Overrides communityList.pageSize configuration for this component.
   * Value can be added in the themed version of the parent component.
   */
  @Input() pageSize: number;

  /**
   * The pagination configuration
   */
  config: PaginationComponentOptions;

  /**
   * The pagination id
   */
  pageId = 'cmcl';

  /**
   * The sorting configuration
   */
  sortConfig: SortOptions;

  /**
   * UUID of the collections to hide from the parent community page list
   */
  private hiddenCollectionUuids = [
    '463625e1-602d-4844-a94f-5df83c681054',
    'b9047ea9-57cb-4833-af4a-b8ab68dfea52',
    'e4a7d3ab-2a62-46f9-8d71-c66ebf9cdbe3',
  ];

  /**
   * A list of remote data objects of communities' collections
   */
  subCollectionsRDObs: BehaviorSubject<RemoteData<PaginatedList<Collection>>> =
    new BehaviorSubject<RemoteData<PaginatedList<Collection>>>({} as any);

  subscriptions: Subscription[] = [];

  constructor(
    protected cds: CollectionDataService,
    protected paginationService: PaginationService,
    protected route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.config = new PaginationComponentOptions();
    this.config.id = this.pageId;
    if (hasValue(this.pageSize)) {
      this.config.pageSize = this.pageSize;
    } else {
      this.config.pageSize = this.route.snapshot.queryParams[this.pageId + '.rpp'] ?? this.config.pageSize;
    }
    this.config.currentPage = this.route.snapshot.queryParams[this.pageId + '.page'] ?? 1;
    this.sortConfig = new SortOptions(
      'dc.title',
      SortDirection[this.route.snapshot.queryParams[this.pageId + '.sd']] ?? SortDirection.ASC,
    );
    this.initPage();
  }

  /**
   * Initialise the list of collections
   */
  initPage() {
    const pagination$ = this.paginationService.getCurrentPagination(this.config.id, this.config);
    const sort$ = this.paginationService.getCurrentSort(this.config.id, this.sortConfig);

    this.subscriptions.push(
      observableCombineLatest([pagination$, sort$]).pipe(
        switchMap(([currentPagination, currentSort]) => {
          return this.cds.findByParent(this.community.id, {
            currentPage: currentPagination.currentPage,
            elementsPerPage: currentPagination.pageSize,
            sort: { field: currentSort.field, direction: currentSort.direction },
          });
        }),
        map((results: RemoteData<PaginatedList<Collection>>) => {
          if (results?.hasSucceeded && results.payload?.page) {
            // Filter out the hidden collection from the page
            results.payload.page = results.payload.page.filter(
              (collection: Collection) => !this.hiddenCollectionUuids.includes(collection.id),
            );

            // Adjust totalElements to match the filtered page length
            const newSize = results.payload.page.length;
            results.payload.totalElements = newSize;

            if (results.payload.pageInfo) {
              results.payload.pageInfo.totalElements = newSize;
              results.payload.pageInfo.totalPages = 1;
              if (results.payload.pageInfo.currentPage > 1) {
                results.payload.pageInfo.currentPage = 1;
              }
            }
          }
          return results;
        }),
      ).subscribe((results) => {
        this.subCollectionsRDObs.next(results);
      }),
    );
  }

  ngOnDestroy(): void {
    this.paginationService.clearPagination(this.config?.id);
    this.subscriptions.map((subscription: Subscription) => subscription.unsubscribe());
  }
}