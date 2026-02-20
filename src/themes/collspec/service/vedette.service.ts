import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
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
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly CACHE_KEY_HOME = 'vedette_home';
  private readonly CACHE_KEY_COLL_PREFIX = 'vedette_coll_';
  private readonly COLLECTION_LIMIT = 10;

  // Cache mémoire pour éviter les requêtes HTTP dupliquées dans la même session
  private imagesHomeCache$?: Observable<Vedette[]>;
  private imageCollCache$: Record<string, Observable<Vedette[]>> = {};

  constructor(private readonly http: HttpClient) {}

  getImagesHome(): Observable<Vedette[]> {
    const cached = this.getFromLocalStorage<Vedette[]>(this.CACHE_KEY_HOME);
    if (cached) return of(cached);

    if (!this.imagesHomeCache$) {
      this.imagesHomeCache$ = this.fetchImages(this.urlApiVedette).pipe(
        tap((data) => this.saveToLocalStorage(this.CACHE_KEY_HOME, data)),
        shareReplay(1)
      );
    }
    return this.imagesHomeCache$;
  }

  getImagesColl(id: string): Observable<Vedette[]> {
    const cacheKey = `${this.CACHE_KEY_COLL_PREFIX}${id}`;
    const cached = this.getFromLocalStorage<Vedette[]>(cacheKey);
    if (cached) return of(cached);

    if (!this.imageCollCache$[id]) {
      const url = `${this.urlApiVedette}/${this.COLLECTION_LIMIT}/${id}`;
      this.imageCollCache$[id] = this.fetchImages(url).pipe(
        tap((data) => this.saveToLocalStorage(cacheKey, data)),
        shareReplay(1)
      );
    }
    return this.imageCollCache$[id];
  }

  shuffleArray(array: Vedette[]): Vedette[] {
    const shuffled = [...array]; // Évite la mutation du tableau original
    let currentIndex = shuffled.length;
    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }
    return shuffled;
  }

  // ───── Cache localStorage ─────

  private saveToLocalStorage<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn(`[VedetteService] Impossible d'écrire dans le localStorage`, error);
    }
  }

  private getFromLocalStorage<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() > entry.expiresAt) {
        localStorage.removeItem(key); // Nettoyage automatique
        return null;
      }
      return entry.data;
    } catch (error) {
      console.warn(`[VedetteService] Erreur de lecture du localStorage`, error);
      return null;
    }
  }

  // ───── HTTP ─────

  private fetchImages(apiUrl: string): Observable<Vedette[]> {
    return this.http.get<{ items: any[] }>(apiUrl).pipe(
      map(({ items }) =>
        items.map(
          (item): Vedette => ({
            id: item.id,
            title: item.title,
            description: item.description,
            imageUrl: item.group.image[0].url,
          })
        )
      ),
      catchError((error) => {
        console.error('[VedetteService] Erreur lors du fetch', error);
        return of([]);
      })
    );
  }
}