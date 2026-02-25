import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopLevelCommunityListComponent as BaseComponent } from '../../../../../app/home-page/top-level-community-list/top-level-community-list.component';
import { ErrorComponent } from '../../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { ObjectCollectionComponent } from '../../../../../app/shared/object-collection/object-collection.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Subject } from 'rxjs';
import { CommunityDataService } from '../../../../../app/core/data/community-data.service';
import { CollectionDataService } from '../../../../../app/core/data/collection-data.service';
import { APP_CONFIG, AppConfig } from '../../../../../config/app-config.interface';
import { PaginationService } from '../../../../../app/core/pagination/pagination.service';
import { VedetteService } from '../../../service/vedette.service';
import { takeUntil } from 'rxjs/operators';
import { Vedette } from '../../../models/Vedette';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-themed-top-level-community-list',
  styleUrls: ['./top-level-community-list.component.scss'],
  templateUrl: './top-level-community-list.component.html',
  standalone: true,
  imports: [VarDirective, ObjectCollectionComponent, ErrorComponent, ThemedLoadingComponent, AsyncPipe, TranslateModule, RouterModule, CommonModule],
})
export class TopLevelCommunityListComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  collections: any[] = [];
  allSouscommunities: any[] = [];
  displayedSouscommunities: any[] = [];
  souscommunitiesPerPage = 3;
  currentPage = 1;
  hasMore = false;
  isLoadingMore = false;

  private isBrowser: boolean;
  private unsubscribe$ = new Subject<void>();
  private scrollListener!: () => void;

  constructor(
    private cdsCollspec: CommunityDataService,
    private collService: CollectionDataService,
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    private paginationServiceCollspec: PaginationService,
    private vedetteService: VedetteService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    super(appConfig, cdsCollspec, paginationServiceCollspec);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    super.ngOnInit();
    this.communitiesRD$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data.hasSucceeded) {
        data.payload?.page?.forEach((community) => this.loadSubcommunities(community));
      }
    });
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.setupScrollListener();
    }
  }

  private setupScrollListener() {
    this.scrollListener = () => {
      if (this.isLoadingMore || !this.hasMore) return;

      const scrollY = window.scrollY;
      const innerHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;

      if (scrollY + innerHeight >= scrollHeight - 300) {
        this.loadMore();
      }
    };
    document.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  loadSubcommunities(community: any) {
    const link = community?._links?.subcommunities?.href;
    if (!link) return;

    // Code original qui fonctionnait — collService comme avant
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
            // Toujours pousser — avec ou sans image
            subcommunity.vedette = images?.length ? images[0].imageUrl : null;
            this.allSouscommunities.push(subcommunity);
            this.updateDisplayedSouscommunities();
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
    this.isLoadingMore = false;
    this.cdr.detectChanges();
  }

  loadMore() {
    if (this.isLoadingMore || !this.hasMore) return;
    this.isLoadingMore = true;
    this.currentPage++;
    this.updateDisplayedSouscommunities();
  }

  ngOnDestroy() {
    if (this.isBrowser && this.scrollListener) {
      document.removeEventListener('scroll', this.scrollListener);
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}