import { Component, Inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { map, switchMap, takeUntil, catchError } from 'rxjs/operators';

import { ThemedCommunityListComponent } from '../../../../app/community-list-page/community-list/themed-community-list.component';
import { CommunityListPageComponent as BaseComponent } from '../../../../app/community-list-page/community-list-page.component';
import { CommunityDataService } from '../../../../app/core/data/community-data.service';
import { CollectionDataService } from '../../../../app/core/data/collection-data.service';
import { PaginationService } from '../../../../app/core/pagination/pagination.service';
import { VedetteService } from '../../service/vedette.service';
import { APP_CONFIG, AppConfig } from '../../../../config/app-config.interface';
import { RemoteData } from '../../../../app/core/data/remote-data';
import { Community } from '../../../../app/core/shared/community.model';
import { PaginatedList } from '../../../../app/core/data/paginated-list.model';
import { getFirstSucceededRemoteData } from '../../../../app/core/shared/operators';
import { Vedette } from '../../models/Vedette';
import { hasValue } from "../../../../app/shared/empty.util";
import { ThemedLoadingComponent } from '../../../../app/shared/loading/themed-loading.component';

@Component({
  selector: 'ds-themed-community-list-page',
  styleUrls: ['./community-list-page.component.scss'],
  templateUrl: './community-list-page.component.html',
  standalone: true,
  imports: [
    ThemedCommunityListComponent,
    TranslateModule,
    CommonModule,
    RouterModule,
    ThemedLoadingComponent,
  ],
})
export class CommunityListPageComponent extends BaseComponent implements OnInit, OnDestroy {
  // Propriétés pour les sous-communautés
  allSouscommunities: any[] = [];
  displayedSouscommunities: any[] = [];
  filteredSouscommunities: any[] = [];
  souscommunitiesPerPage = 6;
  currentPage = 1;
  hasMore = false;
  isLoadingSubcommunities = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private communityDataService: CommunityDataService,
    private collectionDataService: CollectionDataService,
    private paginationService: PaginationService,
    private vedetteService: VedetteService,
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    
    // Charger les sous-communautés au démarrage
    this.loadTopLevelCommunitiesAndSubcommunities();
  }

  /**
   * Charge les communautés de premier niveau et leurs sous-communautés
   */
  private loadTopLevelCommunitiesAndSubcommunities() {
    this.isLoadingSubcommunities = true;

    this.communityDataService.findTop({
      currentPage: 1,
      elementsPerPage: 9999
    }).pipe(
      getFirstSucceededRemoteData(),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (rd: RemoteData<PaginatedList<Community>>) => {
        if (rd.hasSucceeded && rd.payload?.page) {
          this.loadAllSubcommunities(rd.payload.page);
        } else {
          this.isLoadingSubcommunities = false;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des communautés:', error);
        this.isLoadingSubcommunities = false;
      }
    });
  }

  /**
   * Charge toutes les sous-communautés pour chaque communauté principale
   */
  loadAllSubcommunities(communities: Community[]) {
    this.allSouscommunities = [];
    this.filteredSouscommunities = [];
    this.currentPage = 1;
    this.displayedSouscommunities = [];

    if (!communities || communities.length === 0) {
      this.isLoadingSubcommunities = false;
      return;
    }

    // Crée un tableau d'observables pour charger les sous-communautés de chaque communauté
    const subcommunityObservables = communities.map(community => 
      this.loadSubcommunitiesForCommunity(community).pipe(
        catchError(error => {
          console.error(`Erreur lors du chargement des sous-communautés pour ${community.uuid}:`, error);
          return of([]);
        })
      )
    );

    // Charge toutes les sous-communautés en parallèle
    forkJoin(subcommunityObservables).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (results) => {
        // Combine tous les résultats en un seul tableau et filtre les valeurs null
        const allSubcommunities = results.reduce((acc, curr) => acc.concat(curr), []).filter(sub => sub !== null);
        
        // Trie par titre
        allSubcommunities.sort((a, b) => 
          (a.title || '').localeCompare(b.title || '')
        );
        
        this.allSouscommunities = allSubcommunities;
        this.filteredSouscommunities = [...allSubcommunities];
        this.isLoadingSubcommunities = false;
        this.updateDisplayedSouscommunities();
      },
      error: (error) => {
        console.error('Erreur globale lors du chargement des sous-communautés:', error);
        this.isLoadingSubcommunities = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Charge les sous-communautés pour une communauté spécifique
   */
  private loadSubcommunitiesForCommunity(community: Community) {
    const link = community?._links?.subcommunities?.href;
    if (!link) {
      return of([]);
    }

    // Utiliser findListByHref pour obtenir une liste paginée
    return this.communityDataService.findListByHref(link).pipe(
      getFirstSucceededRemoteData(),
      switchMap((rd: any) => {
        // Vérifier si c'est une PaginatedList ou un tableau direct
        let subcommunities: Community[] = [];
        
        if (rd.payload?.page && Array.isArray(rd.payload.page)) {
          subcommunities = rd.payload.page;
        } else if (Array.isArray(rd.payload)) {
          subcommunities = rd.payload;
        } else if (rd.hasSucceeded && rd.payload) {
          // Tentative de récupération directe
          subcommunities = [rd.payload];
        }

        if (subcommunities.length === 0) {
          return of([]);
        }

        // Pour chaque sous-communauté, charge les images vedette
        const subcommunityObservables = subcommunities.map(subcommunity => 
          this.loadSubcommunityWithVedette(subcommunity, community)
        );

        return forkJoin(subcommunityObservables);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des sous-communautés:', error);
        return of([]);
      })
    );
  }

  /**
   * Charge une sous-communauté avec son image vedette
   */
  private loadSubcommunityWithVedette(subcommunity: Community, parentCommunity: Community) {
    if (!subcommunity || !subcommunity.metadata) {
      return of(null);
    }

    const title = subcommunity.metadata['dc.title']?.[0]?.value || 'Sans titre';
    const description = subcommunity.metadata['dc.description']?.[0]?.value || null;
    const id = subcommunity.uuid || subcommunity.id;

    // Crée l'objet sous-communauté de base
    const subcommunityObj = { 
      title, 
      description, 
      id, 
      vedette: null,
      parentCommunityId: parentCommunity.uuid || parentCommunity.id,
      parentCommunityName: parentCommunity.metadata['dc.title']?.[0]?.value || '',
      handle: subcommunity.handle,
      type: subcommunity.type
    };

    // Charge l'image vedette si le service existe
    if (!this.vedetteService) {
      return of(subcommunityObj);
    }

    return this.vedetteService.getImagesColl(id).pipe(
      map((images: Vedette[]) => {
        if (images?.length && images[0]?.imageUrl) {
          subcommunityObj.vedette = images[0].imageUrl;
        }
        return subcommunityObj;
      }),
      catchError(error => {
        console.error(`Erreur lors du chargement de l'image vedette pour ${id}:`, error);
        return of(subcommunityObj);
      })
    );
  }

  /**
   * Met à jour la liste des sous-communautés affichées
   */
  updateDisplayedSouscommunities() {
    const totalItems = this.filteredSouscommunities.length;
    const totalDisplayed = this.currentPage * this.souscommunitiesPerPage;

    this.displayedSouscommunities = this.filteredSouscommunities.slice(0, totalDisplayed);
    this.hasMore = totalDisplayed < totalItems;
    
    this.cdr.detectChanges();
  }

  /**
   * Charge plus de sous-communautés
   */
  loadMore() {
    if (this.hasMore) {
      this.currentPage++;
      this.updateDisplayedSouscommunities();
    }
  }

  /**
   * Réinitialise la pagination
   */
  resetPagination() {
    this.currentPage = 1;
    this.filteredSouscommunities = [...this.allSouscommunities];
    this.updateDisplayedSouscommunities();
  }

  /**
   * Filtre les sous-communautés par terme de recherche
   */
  filterSubcommunities(searchTerm: string) {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    
    if (!normalizedTerm) {
      this.resetPagination();
      return;
    }

    this.filteredSouscommunities = this.allSouscommunities.filter(subcommunity =>
      subcommunity.title?.toLowerCase().includes(normalizedTerm) ||
      subcommunity.description?.toLowerCase().includes(normalizedTerm) ||
      subcommunity.parentCommunityName?.toLowerCase().includes(normalizedTerm)
    );

    this.currentPage = 1;
    this.updateDisplayedSouscommunities();
  }

  /**
   * Obtient l'URL de navigation pour une sous-communauté
   */
  getSubcommunityUrl(subcommunity: any): string {
    return `/communities/${subcommunity.id}`;
  }

  /**
   * Vérifie si une sous-communauté a une description
   */
  hasDescription(subcommunity: any): boolean {
    return hasValue(subcommunity.description) && subcommunity.description.trim().length > 0;
  }

  /**
   * Vérifie si une sous-communauté a une image vedette
   */
  hasVedette(subcommunity: any): boolean {
    return hasValue(subcommunity.vedette);
  }

  /**
   * TrackBy function pour optimiser le rendu
   */
  trackBySubcommunityId(index: number, item: any): string {
    return item.id;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}