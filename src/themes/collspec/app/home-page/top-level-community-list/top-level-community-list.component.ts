import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopLevelCommunityListComponent as BaseComponent } from '../../../../../app/home-page/top-level-community-list/top-level-community-list.component';
import { ErrorComponent } from '../../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { ObjectCollectionComponent } from '../../../../../app/shared/object-collection/object-collection.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';
import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subject, forkJoin} from 'rxjs';
import { CommunityDataService } from '../../../../../app/core/data/community-data.service';
import { CollectionDataService } from '../../../../../app/core/data/collection-data.service';
import { APP_CONFIG, AppConfig } from '../../../../../config/app-config.interface';
import { PaginatedList } from '../../../../../app/core/data/paginated-list.model';
import { RemoteData } from '../../../../../app/core/data/remote-data';
import { PaginationService } from '../../../../../app/core/pagination/pagination.service';
import { VedetteService } from '../../../service/vedette.service';
import {map, takeUntil} from 'rxjs/operators';
import { Vedette } from '../../../models/Vedette';
import {hasValue} from "../../../../../app/shared/empty.util";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-themed-top-level-community-list',
  styleUrls: ['./top-level-community-list.component.scss'],
  //styleUrls: ['../../../../../app/home-page/top-level-community-list/top-level-community-list.component.scss'],
  templateUrl: './top-level-community-list.component.html',
  //templateUrl: '../../../../../app/home-page/top-level-community-list/top-level-community-list.component.html',
  standalone: true,
  imports: [VarDirective, ObjectCollectionComponent, ErrorComponent, ThemedLoadingComponent, AsyncPipe, TranslateModule, RouterModule, CommonModule],
})

export class TopLevelCommunityListComponent extends BaseComponent implements OnInit, OnDestroy {
  collections: any[] = [];
  allSouscommunities: any[] = [];
  displayedSouscommunities: any[] = [];
  souscommunitiesPerPage = 3;
  currentPage = 1;
  hasMore = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private cdsCalypso: CommunityDataService,
    private collService: CollectionDataService,
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    private paginationServiceCalypso: PaginationService,
    private vedetteService: VedetteService,
    private cdr: ChangeDetectorRef
  ) {
    super(appConfig, cdsCalypso, paginationServiceCalypso);
  }

  ngOnInit() {
    super.ngOnInit();

    this.communitiesRD$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data.hasSucceeded) {
        data.payload?.page?.forEach((community) => this.loadSubcommunities(community));
      }
    });
  }

  loadSubcommunities(community: any) {
    const link = community?._links?.subcommunities?.href;
    if (!link) return;

    this.collService.findByHref(link).pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      const links = (res.payload?._links as any)?.page || [];
      links.forEach((subLink) => {
        this.collService.findByHref(subLink.href).pipe(takeUntil(this.unsubscribe$)).subscribe((subData) => {
          const payload = subData.payload;
          if (!payload || !payload.metadata) return;

          const title = payload.metadata['dc.title']?.[0]?.value;
          const description = payload.metadata['dc.description']?.[0]?.value || null;
          const id = payload.id;

          const subcommunity = { title, description, id, vedette: null };

          this.vedetteService.getImagesColl(id).pipe(takeUntil(this.unsubscribe$)).subscribe((images: Vedette[]) => {
            if (images?.length) {
              subcommunity.vedette = images[0].imageUrl;
              this.allSouscommunities.push(subcommunity);
              this.updateDisplayedSouscommunities();
            }
          });
        });
      });
    });
  }

  updateDisplayedSouscommunities() {
    const totalItems = this.allSouscommunities.length;
    const totalDisplayed = this.currentPage * this.souscommunitiesPerPage;

    this.displayedSouscommunities = this.allSouscommunities.slice(0, totalDisplayed);
    this.hasMore = totalDisplayed < totalItems;
    this.cdr.detectChanges();
  }

  loadMore() {
    this.currentPage++;
    this.updateDisplayedSouscommunities();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}


