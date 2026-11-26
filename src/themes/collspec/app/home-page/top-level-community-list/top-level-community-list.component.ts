import { AsyncPipe, CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
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
  /** Clé de la référence de l'image (voir IMAGES), null si inconnue */
  cleImage: string | null;
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

  /** Tuile dont la source de l'image est ouverte (au clic) */
  sourceOuverte: string | null = null;
  /** Tuile dont l'aperçu au survol a été fermé par Échap (jusqu'à la sortie de la souris) */
  sourceMasquee: string | null = null;

  private unsubscribe$ = new Subject<void>();
  /** Évite les doublons si communitiesRD$ réémet après le premier succès */
  private loadedIds = new Set<string>();

  constructor(
    cdsCollspec: CommunityDataService,
    private collService: CollectionDataService,
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    paginationServiceCollspec: PaginationService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
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
        if (this.loadedIds.has(id) || TopLevelCommunityListComponent.HIDDEN_UUIDS.has(id)) return;

        const title: string = payload.metadata['dc.title']?.[0]?.value ?? '';

        const description: string | null = payload.metadata['dc.description']?.[0]?.value ?? null;
        const subcommunity: Subcommunity = { title, description, id, logoUrl: null, cleImage: TopLevelCommunityListComponent.cleImage(title, id) };

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

  /** UUID des communautés masquées de la page d'accueil */
  private static readonly HIDDEN_UUIDS = new Set<string>([
    'aeb901ef-166c-409d-9422-c94adb2e0f4f', // Art, aménagement et musique
    'b26a0d38-5307-4ebd-a9e0-b6f1f95d5f5f', // Fac-similés
	'040c86d8-87c0-42fc-823e-48eb321dfaf6', // Soutien à la recherche
  ]);

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

  /**
   * Images des tuiles dont la source est connue.
   * Référence dans les traductions du thème : collspec.accueil.image.<cle>.reference
   * (HTML : <em> pour les titres). Pour ajouter une image : une entrée ici + la clé en fr et en.
   * titres : titre de la communauté DSpace en minuscules, sans « * » final ;
   * uuid : si le titre ne suffit pas.
   */
  private static readonly IMAGES: { cle: string; titres: string[]; uuid?: string }[] = [
    { cle: 'incunables', titres: ['incunables'] },
    { cle: 'droit', titres: ['droit'] },
    { cle: 'manuscrits', titres: ['manuscrits'] },
    { cle: 'sciences-medecine', titres: ['sciences et médecine'] },
    { cle: 'sciences-humaines-lettres', titres: ['sciences humaines et lettres'] },
    { cle: 'theologie-philosophie', titres: ['théologie et philosophie'] },
    { cle: 'canadiana-americana', titres: ['canadiana et americana'] },
    { cle: 'iconographie', titres: ['iconographie (gravures, estampes, cartes, plans, affiches)', 'iconographie'] },
    { cle: 'claude-gingras', titres: ['collection claude gingras'], uuid: 'bb619460-d68f-45d0-aad9-e8faaf0ed73f' },
    { cle: 'education', titres: ['éducation'] },
  ];

  /** Clé de l'image d'une tuile, ou null si sa référence n'est pas connue */
  private static cleImage(titre: string, uuid: string): string | null {
    const t = (titre ?? '').replace(/\*+$/, '').trim().toLowerCase();
    const image = TopLevelCommunityListComponent.IMAGES.find(i => i.uuid === uuid || i.titres.includes(t));
    return image?.cle ?? null;
  }

  getButtonLabel(title: string): string {
    const key = title?.replace(/\*+$/, '').trim().toLowerCase();
    return TopLevelCommunityListComponent.BUTTON_LABELS[key] ?? `Explorer ${title?.trim()}`;
  }

  // ── Source de l'image (même fonctionnement que l'avis de la page d'accueil) ──

  basculerSource(id: string): void {
    this.sourceOuverte = this.sourceOuverte === id ? null : id;
  }

  /** Ferme la source et rend le focus au bouton qui l'a ouverte */
  fermerSource(id: string): void {
    this.sourceOuverte = null;
    this.document.getElementById('source-bouton-' + id)?.focus();
  }

  /** Échap : ferme la source ouverte, ou masque l'aperçu au survol (WCAG 1.4.13) */
  @HostListener('document:keydown.escape')
  fermerSourceParEchap(): void {
    if (this.sourceOuverte) {
      const id = this.sourceOuverte;
      const figure = this.document.getElementById('tuile-image-' + id);
      const focusDedans = figure?.contains(this.document.activeElement);
      this.sourceOuverte = null;
      if (focusDedans) {
        this.document.getElementById('source-bouton-' + id)?.focus();
      }
    }
    const survolee = this.document.querySelector<HTMLElement>('.tuile-image:hover');
    if (survolee) {
      this.sourceMasquee = survolee.dataset.tuile ?? null;
    }
  }

  /** Clic ou toucher en dehors de l'image dont la source est ouverte : on la ferme */
  @HostListener('document:click', ['$event'])
  fermerSourceSiClicExterieur(event: Event): void {
    if (!this.sourceOuverte) {
      return;
    }
    const figure = this.document.getElementById('tuile-image-' + this.sourceOuverte);
    if (!figure?.contains(event.target as Node)) {
      this.sourceOuverte = null;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
