import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, of, throwError, timer } from 'rxjs';
import { catchError, map, retry, shareReplay, tap, timeout } from 'rxjs/operators';
import { Vedette } from '../models/Vedette';
import { config } from '../config/config';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class VedetteService {
  private readonly urlApiVedette: string = config.urlApiVedette;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000;
  private readonly CACHE_KEY_HOME = 'vedette_home';
  private readonly CACHE_KEY_COLL_PREFIX = 'vedette_coll_';
  private readonly COLLECTION_LIMIT = 10;
  /** Délai max d'une réponse de l'API, puis nouvelles tentatives (1 s, puis 2 s) */
  private readonly HTTP_TIMEOUT_MS = 10000;
  private readonly RETRY_COUNT = 2;
  private readonly isBrowser: boolean;

  /** Requêtes en cours / résolues, partagées entre les abonnés (clé = clé localStorage) */
  private readonly memoryCache = new Map<string, Observable<Vedette[]>>();

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getImagesHome(): Observable<Vedette[]> {
    return this.getCached(this.CACHE_KEY_HOME, this.urlApiVedette);
  }

  getImagesColl(id: string): Observable<Vedette[]> {
    return this.getCached(
      `${this.CACHE_KEY_COLL_PREFIX}${id}`,
      `${this.urlApiVedette}/${this.COLLECTION_LIMIT}/${id}`,
    );
  }

  shuffleArray(array: Vedette[]): Vedette[] {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }
    return shuffled;
  }

  /**
   * localStorage (5 min) puis cache mémoire, sinon appel HTTP.
   * - Côté serveur (SSR) : aucun appel, le carrousel est chargé dans le navigateur
   *   (évite de ralentir le rendu et un ordre aléatoire différent serveur/navigateur).
   * - Appel lent ou en échec : nouvelles tentatives automatiques ; si tout échoue,
   *   on reprend les dernières images connues (même expirées) plutôt qu'un carrousel vide.
   * - Réponse vide ou en erreur : rien n'est mis en cache, l'appel suivant réessaie.
   */
  private getCached(cacheKey: string, url: string): Observable<Vedette[]> {
    if (!this.isBrowser) return EMPTY;

    const stored = this.getFromLocalStorage<Vedette[]>(cacheKey);
    if (stored && !stored.expired) return of(stored.data);

    if (!this.memoryCache.has(cacheKey)) {
      this.memoryCache.set(cacheKey, this.fetchImages(url).pipe(
        timeout(this.HTTP_TIMEOUT_MS),
        retry({ count: this.RETRY_COUNT, delay: (_error, attempt) => timer(attempt * 1000) }),
        tap(data => {
          if (data.length > 0) {
            this.saveToLocalStorage(cacheKey, data);
          } else {
            this.memoryCache.delete(cacheKey); // réponse vide : on réessaiera au prochain affichage
          }
        }),
        catchError(error => {
          this.memoryCache.delete(cacheKey);
          console.error('[VedetteService] Erreur lors du fetch', error);
          return stored?.data.length ? of(stored.data) : throwError(() => error);
        }),
        shareReplay(1),
      ));
    }
    return this.memoryCache.get(cacheKey);
  }

  // ───── Cache localStorage ─────

  private saveToLocalStorage<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = { data, expiresAt: Date.now() + this.CACHE_TTL_MS };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn(`[VedetteService] Impossible d'écrire dans le localStorage`, error);
    }
  }

  /** Données enregistrées, avec leur état : les données expirées servent de secours si l'API échoue */
  private getFromLocalStorage<T>(key: string): { data: T; expired: boolean } | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      const expired = Date.now() > entry.expiresAt;
      if (expired) {
        // Invalide le cache mémoire de cette même clé pour forcer un nouveau fetch
        this.memoryCache.delete(key);
      }
      return { data: entry.data, expired };
    } catch (error) {
      console.warn(`[VedetteService] Erreur de lecture du localStorage`, error);
      return null;
    }
  }

  // ───── HTTP ─────

  private fetchImages(apiUrl: string): Observable<Vedette[]> {
    return this.http.get<{ items: any[] }>(apiUrl).pipe(
      map(({ items }) =>
        (items ?? [])
          .filter((item) => item?.group?.image?.length > 0)
          .map(
            (item): Vedette => ({
              id: item.id,
              title: item.title,
              description: item.description,
              imageUrl: item.group.image[0].url,
            })
          )
      ),
    );
  }
}
