import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { AiService } from '../../service/ai.service';
import { Ai } from '../../models/Ai';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import { BehaviorSubject, Observable} from 'rxjs';
import { config } from "../../config/config";
import {AsyncPipe, CommonModule, Location} from '@angular/common';
import { DSONameService } from "../../../../app/core/breadcrumbs/dso-name.service";
import { getFirstSucceededRemoteDataPayload } from "../../../../app/core/shared/operators";
import { DSpaceObject } from "../../../../app/core/shared/dspace-object.model";
import { ScopeSelectorModalComponent } from "../../../../app/shared/search-form/scope-selector-modal/scope-selector-modal.component";
import { take, tap } from "rxjs/operators";
import {NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import { DSpaceObjectDataService } from "../../../../app/core/data/dspace-object-data.service";
import { SearchService } from "../../../../app/shared/search/search.service";
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ThemedLoadingComponent} from "../../../../app/shared/loading/themed-loading.component";
import {FormsModule} from "@angular/forms";
import {SearchFormComponent} from "../../../../app/shared/search-form/search-form.component";
import {BrowserOnlyPipe} from "../../../../app/shared/utils/browser-only.pipe";
import { hasValue, isNotEmpty } from '@dspace/shared/utils/empty.util';
import { currentPath } from '@dspace/core/router/utils/route.utils';

@Component({
  selector: 'ds-ai-search',
  templateUrl: './ai-search.component.html',
  styleUrls: ['./ai-search.component.scss'],
  standalone: true,
  imports: [TranslateModule, RouterModule, CommonModule, NgbModule, FormsModule, AsyncPipe],
})
export class AiSearchComponent implements OnInit {
  images$: Observable<Ai[]>;
  query: string = null;
  scope: any = null;
  url: string = null;
  size: number = config.sizeElementsClip;
  defaultItemCount: number = 6;
  listeAi: Ai[] = [];
  backendApiFile: string = config.backendApiFile;
  searchQuery: string = '';
  titleNotif: string = '';
  contentNotif: string = '';

  @Input() inPlaceSearch: boolean;
  @Input() hideScopeInUrl = false;
  @Input() currentUrl: string;
  @Output() submitSearch = new EventEmitter<any>();
  selectedScope: BehaviorSubject<DSpaceObject> = new BehaviorSubject<DSpaceObject>(undefined);

  constructor(
    private aiService: AiService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    protected dsoService: DSpaceObjectDataService,
    public dsoNameService: DSONameService,
    protected searchService: SearchService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Extraire les paramètres de recherche de l'URL
      this.query = params['query'] || 'all';
      this.searchQuery = this.query === 'all' ? '' : this.query;

      // Supprimer le paramètre 'spc.page' s'il existe
      if (params['spc.page']) {
        delete params['spc.page'];
      }

      // Obtenir la portée depuis les paramètres de l'URL
      if (params['scope']) {
        this.scope = params['scope'];
        if (isNotEmpty(this.scope)) {
          // Récupérer les données de la portée depuis le service
          this.dsoService.findById(this.scope).pipe(getFirstSucceededRemoteDataPayload())
            .subscribe((scope: DSpaceObject) => this.selectedScope.next(scope));
        }
      }

      // Extraire l'URL spécifiée dans les paramètres
      if (params['url']) {
        this.query = null;
        this.url = params['url'];
      }

      // Charger les images en fonction des paramètres de recherche
      this.fetchImages();
    });

    // Recouperer les variable de langue pour la boite de notification
    this.translate.get(['collspec.ai-title-notification', 'collspec.ai-content-notification']).subscribe((messages: { [key: string]: string }) => {
      this.titleNotif = messages['collspec.ai-title-notification'];
      this.contentNotif = messages['collspec.ai-content-notification'];
      //this.showInfoNotification(this.titleNotif,this.contentNotif);
    });

  }

  // Méthode privée pour récupérer les images
  private fetchImages(): void {
    // Appel au service pour obtenir les images avec les paramètres actuels
    this.images$ = this.aiService.getImages(this.query, this.url, this.scope).pipe(
      // Effectuer des actions supplémentaires sur les données
      tap((data: any) => {
        // Mapper les données de l'API aux objets Ai
        this.listeAi = data?._embedded?.searchResult?._embedded?._embedded?.indexableObject?.map((indexableObject: any) => {
          const image = indexableObject?._embedded?.image;
          const scope = indexableObject?._embedded?.scope;
          const pathFile = indexableObject?.url ? indexableObject.url : `${this.backendApiFile}${indexableObject.id}/content`;

          return {
            id: indexableObject.id,
            url: indexableObject.url,
            pathFile: pathFile,
            itemId: indexableObject.itemId,
            uuid: indexableObject.uuid,
            itemName: indexableObject.itemName,
            itemHandle: indexableObject.itemHandle,
            collectionId: indexableObject.collectionId,
            score: image?.score,
            name: image?.name,
            scope: scope
          } as Ai;
        }) || [];
      })
    );
  }

  // Méthode pour mettre à jour les paramètres de recherche
  updateSearch(data: any) {
    // Créer une copie des paramètres de recherche
    const queryParams = Object.assign({}, data);

    // Si la portée est spécifiée et doit être cachée dans l'URL
    if (hasValue(data.scope) && this.hideScopeInUrl) {
      // Supprimer la portée des paramètres
      delete queryParams.scope;
      // Réinitialiser la requête à 'all'
      this.query = 'all';
    }

    // Naviguer vers la nouvelle URL avec les paramètres de recherche
    this.router.navigate(this.getSearchLinkParts(), {
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });

    // Extraire les paramètres de recherche actuels de l'URL
    const params = this.route.snapshot.queryParams;
    this.query = params['query'] || 'all';
    this.scope = params['scope'] || null;
    this.url = params['url'] || null;

    // Recharger les images en fonction des nouveaux paramètres de recherche
    this.fetchImages();
  }

  // Méthode pour vérifier si une image est sélectionnée
  selectedImageId(aiId: string): boolean {
    // Extrait l'ID de bitstream de l'URL
    const url = decodeURIComponent(window.location.href);
    const startIndex = url.indexOf("bitstreams/") + "bitstreams/".length;
    if (startIndex === -1) {
      return false;
    }
    let idFromUrl = url.substring(startIndex);
    const contentIndex = idFromUrl.indexOf("/content");
    if (contentIndex !== -1) {
      idFromUrl = idFromUrl.substring(0, contentIndex);
    }
    return aiId === idFromUrl;
  }

  // Méthode appelée lorsqu'une portée est modifiée
  onScopeChange(scope: DSpaceObject) {
    // Mettre à jour les paramètres de recherche avec la nouvelle portée
    this.updateSearch({ scope: scope ? scope.uuid : undefined });
  }

  // Méthode pour obtenir le lien de recherche
  getSearchLink(): string {
    // Retourne le chemin de recherche actuel ou le chemin par défaut '/ai-search'
    return this.inPlaceSearch ? currentPath(this.router) : '/ai-search';
  }

  // Méthode pour obtenir les parties du lien de recherche
  getSearchLinkParts(): string[] {
    // Retourne les parties du lien de recherche actuel ou une liste vide
    return this.inPlaceSearch ? [] : this.getSearchLink().split('/');
  }

  // Méthode pour ouvrir la modalité de sélection de portée
 /* openScopeModal() {
    const ref = this.modalService.open(ScopeSelectorModalComponent);
    ref.componentInstance.scopeChange.pipe(take(1)).subscribe((scope: DSpaceObject) => {
      this.selectedScope.next(scope);
      this.onScopeChange(scope);
    });
  }*/

  // Méthode pour effacer la requête de recherche
  clearSearchQuery() {
    this.searchQuery = '';
    this.query = 'all';

    const params = this.route.snapshot.queryParams;
    delete params['query'];
  }

  // Méthode pour retourner en arrière dans l'historique de navigation
  retour(): void {
    this.location.back();
  }

  // Méthode pour charger plus d'éléments
  loadMore() {
    this.defaultItemCount += 6;
  }

  // Méthode pour rediriger vers la recherche avec une requête spécifique
  redirectToAiSearch(query: string) {
    const queryParams = {};
    if (this.query) {
      queryParams['query'] = query;
    }
    this.router.navigate(['/ai-search'], { queryParams });
  }

  // Méthode pour affichage de la notification
  /*showInfoNotification(title: string, content: string): void {
    this.notificationsService.info(title, content, {
      timeOut: 10000, // Durée d'affichage
      animate: 'fromRight' // Animation d'entrée de la notification
    });
  }*/
}
