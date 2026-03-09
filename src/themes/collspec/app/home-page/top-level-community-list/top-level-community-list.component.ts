import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopLevelCommunityListComponent as BaseComponent } from '../../../../../app/home-page/top-level-community-list/top-level-community-list.component';
import { ErrorComponent } from '../../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { ObjectCollectionComponent } from '../../../../../app/shared/object-collection/object-collection.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
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
export class TopLevelCommunityListComponent extends BaseComponent implements OnInit, OnDestroy {
  collections: any[] = [];
  allSouscommunities: any[] = [];

  private unsubscribe$ = new Subject<void>();

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
            subcommunity.vedette = images?.length ? images[0].imageUrl : null;
            this.allSouscommunities.push(subcommunity);
            this.cdr.detectChanges();
          });
        });
      });
    });
  }

  isClaudeGingras(souscommunitie: any): boolean {
    if (!souscommunitie) return false;

    const targetId = 'bb619460-d68f-45d0-aad9-e8faaf0ed73f';
    const targetTitle = 'collection claude gingras';

    const title = souscommunitie.title?.toLowerCase()?.trim();

    return souscommunitie.id === targetId || title === targetTitle;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}