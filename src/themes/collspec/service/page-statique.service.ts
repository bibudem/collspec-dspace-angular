import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Inject,
  Injectable,
  makeStateKey,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';

/**
 * Contenu HTML statique des pages du thème (À propos, Droit d'auteur…), selon la langue.
 *
 * Pourquoi : la page est rendue une première fois par le serveur (SSR), puis le navigateur
 * la reconstruit entièrement. Sans ce service, le navigateur redemandait le fichier HTML :
 * la page apparaissait, disparaissait, puis réapparaissait (« chargée deux fois »).
 * - Serveur : le contenu chargé est transmis au navigateur dans la page (TransferState).
 * - Navigateur : il le reprend tout de suite, sans nouvelle requête ; ensuite, chaque
 *   fichier est gardé en mémoire (retour sur la page = affichage immédiat).
 * - Changement de langue : une seule requête, la précédente est annulée ; la même langue
 *   annoncée deux fois ne recharge pas la page.
 */
@Injectable({ providedIn: 'root' })
export class PageStatiqueService {
  private readonly memoire = new Map<string, string>();
  private readonly surServeur: boolean;

  constructor(
    private readonly http: HttpClient,
    private readonly translate: TranslateService,
    private readonly transferState: TransferState,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.surServeur = isPlatformServer(platformId);
  }

  /**
   * Contenu de assets/collspec/bib-pages/{dossier}/{langue}-{dossier}.html,
   * mis à jour à chaque changement de langue.
   */
  contenu(dossier: string): Observable<string> {
    return this.translate.onLangChange.pipe(
      map(event => event.lang),
      startWith(this.translate.currentLang || this.translate.getDefaultLang()),
      filter(Boolean),
      distinctUntilChanged(),
      switchMap(lang => this.charger(`/assets/collspec/bib-pages/${dossier}/${lang}-${dossier}.html`)),
    );
  }

  private charger(chemin: string): Observable<string> {
    const enMemoire = this.memoire.get(chemin);
    if (enMemoire !== undefined) return of(enMemoire);

    const cle = makeStateKey<string>(`collspec-page:${chemin}`);
    if (!this.surServeur && this.transferState.hasKey(cle)) {
      const html = this.transferState.get(cle, '');
      this.transferState.remove(cle);
      this.memoire.set(chemin, html);
      return of(html);
    }

    return this.http.get(chemin, { responseType: 'text' }).pipe(
      tap(html => {
        this.memoire.set(chemin, html);
        if (this.surServeur) this.transferState.set(cle, html);
      }),
      catchError(err => {
        console.error(`Erreur lors du chargement de ${chemin}`, err);
        return of('<p>Contenu non disponible.</p>'); // non mis en mémoire : nouvel essai la prochaine fois
      }),
    );
  }
}
