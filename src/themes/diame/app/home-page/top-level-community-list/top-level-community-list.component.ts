import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { catchError, filter, take, takeUntil } from 'rxjs/operators';

import { TopLevelCommunityListComponent as BaseComponent } from '../../../../../app/home-page/top-level-community-list/top-level-community-list.component';
import { CommunityDataService } from '../../../../../app/core/data/community-data.service';
import { CollectionDataService } from '../../../../../app/core/data/collection-data.service';
import { APP_CONFIG, AppConfig } from '../../../../../config/app-config.interface';
import { PaginationService } from '../../../../../app/core/pagination/pagination.service';
import { ErrorComponent } from '../../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { ObjectCollectionComponent } from '../../../../../app/shared/object-collection/object-collection.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';

interface Subcommunity {
  title: string;
  description: string | null;
  id: string;
  logoUrl: string | null;
}

@Component({
  selector: 'ds-themed-top-level-community-list',
  styleUrls: ['./top-level-community-list.component.scss'],
  templateUrl: './top-level-community-list.component.html',
  standalone: true,
  imports: [VarDirective, ObjectCollectionComponent, ErrorComponent, ThemedLoadingComponent, AsyncPipe, TranslateModule, RouterModule, CommonModule],
})
export class TopLevelCommunityListComponent extends BaseComponent implements OnInit, OnDestroy {
  allSouscommunities: Subcommunity[] = [];

  private unsubscribe$ = new Subject<void>();
  /** Évite les doublons si communitiesRD$ réémet après le premier succès */
  private loadedIds = new Set<string>();

  constructor(
    cdsCollspec: CommunityDataService,
    private collService: CollectionDataService,
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    paginationServiceCollspec: PaginationService,
    private cdr: ChangeDetectorRef,
  ) {
    super(appConfig, cdsCollspec, paginationServiceCollspec);
  }

  ngOnInit() {
    super.ngOnInit();
    this.communitiesRD$
      .pipe(
        filter(data => data.hasSucceeded),
        take(1),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(data => {
        data.payload?.page?.forEach(community => this.loadSubcommunities(community));
      });
  }

  loadSubcommunities(community: any): void {
    const link = community?._links?.subcommunities?.href;
    if (!link) return;

    this.collService.findByHref(link)
      .pipe(
        filter(rd => !!rd && (rd.hasSucceeded || rd.hasFailed)),
        take(1),
        catchError(() => of(null)),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(res => {
        if (!res?.payload) return;
        const subLinks: any[] = (res.payload._links as any)?.page ?? [];
        subLinks.forEach(subLink => this.loadSingleSubcommunity(subLink.href));
      });
  }

  private loadSingleSubcommunity(href: string): void {
    this.collService.findByHref(href)
      .pipe(
        filter(rd => !!rd && (rd.hasSucceeded || rd.hasFailed)),
        take(1),
        catchError(() => of(null)),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(subData => {
        const payload = subData?.payload;
        if (!payload?.metadata) return;

        const id: string = payload.id;
        if (this.loadedIds.has(id)) return;

        const title: string = payload.metadata['dc.title']?.[0]?.value ?? '';
        const description: string | null = payload.metadata['dc.description']?.[0]?.value ?? null;
        const subcommunity: Subcommunity = { title, description, id, logoUrl: null };

        const logoHref = (payload._links as any)?.logo?.href;
        if (logoHref) {
          this.collService.findByHref(logoHref)
            .pipe(
              filter(rd => !!rd && (rd.hasSucceeded || rd.hasFailed)),
              take(1),
              catchError(() => of(null)),
              takeUntil(this.unsubscribe$),
            )
            .subscribe(logoData => {
              subcommunity.logoUrl = (logoData?.payload?._links as any)?.content?.href ?? null;
              this.pushSubcommunity(id, subcommunity);
            });
        } else {
          this.pushSubcommunity(id, subcommunity);
        }
      });
  }

  private pushSubcommunity(id: string, subcommunity: Subcommunity): void {
    this.loadedIds.add(id);
    this.allSouscommunities.push(subcommunity);
    this.cdr.detectChanges();
  }

  isClaudeGingras(souscommunitie: Subcommunity): boolean {
    if (!souscommunitie) return false;
    const targetId = 'bb619460-d68f-45d0-aad9-e8faaf0ed73f';
    const title = souscommunitie.title?.toLowerCase().trim();
    return souscommunitie.id === targetId || title === 'collection claude gingras';
  }

  private static readonly BUTTON_LABELS: Record<string, string> = {
    'art, aménagement et musique':                      'Explorer Art, aménagement et musique',
    'art, aménagement, musique':                        'Explorer Art, aménagement et musique',
    'canadiana et americana':                           'Explorer Canadiana et Americana',
    'collection claude gingras':                        'Explorer la collection Claude Gingras',
    'droit':                                            'Explorer Droit',
    'éducation':                                        'Explorer Éducation',
    'fac-similés':                                      'Explorer Fac-similés',
    'iconographie (gravures, estampes, cartes, plans, affiches)': 'Explorer Iconographie',
    'incunables':                                       'Explorer Incunables',
    'manuscrits':                                       'Explorer Manuscrits',
    'sciences et médecine':                             'Explorer Sciences et médecine',
    'sciences humaines et lettres':                     'Explorer Sciences humaines et lettres',
    'sciences politiques, économiques et sociales':     'Explorer Sc. politiques, économiques et sociales',
    'théologie et philosophie':                         'Explorer Théologie et philosophie',
  };

  getButtonLabel(title: string): string {
    const key = title?.replace(/\*+$/, '').trim().toLowerCase();
    return TopLevelCommunityListComponent.BUTTON_LABELS[key] ?? `Explorer ${title?.trim()}`;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
