import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { Ai } from "../models/Ai";
import { config } from '../config/config';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  urlApiAi: string = config.urlApiAi;
  size: number = config.sizeElementsClip;
  private cache$: Observable<Ai[]>;
  private lastQuery: string;
  private lastUrl: string;
  private lastScope: string;
  private lastSize: number;


  constructor(private http: HttpClient) {}

  getImages(query: string, url: string, scope: string): Observable<Ai[]> {
    // Si le cache est vide ou expiré ou si le mot de recherche a changé, fetch les images depuis l'API
    if (!this.cache$ || this.isNewSearch(query, url, scope, this.size)) {
      this.cache$ = this.fetchImagesFromApi(query, url, scope, this.size).pipe(
        // Cache la réponse et la re-joue pour les abonnés ultérieurs
        shareReplay(1),
        // Rafraîchit le cache toutes les heures
        tap(() => setTimeout(() => this.cache$ = null, 60 * 60 * 1000))
      );
    }

    // Retourne les données du cache
    return this.cache$;
  }

  private isNewSearch(query: string, url: string, scope: string, size: number): boolean {
    // Renvoie true si la recherche a changé, false sinon
    return query !== this.lastQuery || url !== this.lastUrl || scope !== this.lastScope || size !== this.lastSize;
  }

  private fetchImagesFromApi(query: string, url: string, scope: string, size: number): Observable<Ai[]> {
    // Mettez à jour les variables de suivi avec les paramètres actuels
    this.lastQuery = query;
    this.lastUrl = url;
    this.lastScope = scope;
    this.lastSize = size;

    const apiUrl = `${this.urlApiAi}/search`;

    let params = new HttpParams();

    if (query) {
      params = params.set('query', query);
    }
    if (url) {
      params = params.set('url', url);
    }
    if (scope) {
      params = params.set('scope', scope);
    }
    if (size) {
      params = params.set('size', size.toString());
    }

    // Effectue la requête HTTP vers l'API
    return this.http.get<any>(apiUrl, { params }).pipe(
      map(response => response),
      catchError((error) => {
        this.handleHttpError(error);
        return throwError(error);
      })
    );
  }

  private handleHttpError(error: HttpErrorResponse): void {
    // Gère l'erreur HTTP au besoin
    if (
      error.status === 0 &&
      error.message.includes('Http failure response') &&
      error.url.includes(`${this.urlApiAi}/search`)
    ) {
      // Supprime l'erreur spécifique
      return;
    }

    console.error('Error fetching images', error);
  }
}
