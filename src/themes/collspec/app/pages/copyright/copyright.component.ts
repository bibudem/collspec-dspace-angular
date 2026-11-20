import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

/**
 * Page « Droit d'auteur et utilisation » : charge le contenu HTML statique selon la langue courante
 * (assets/collspec/bib-pages/copyright/{lang}-copyright.html). Les styles sont dans _global-styles.scss.
 */
@Component({
  selector: 'ds-copyright',
  templateUrl: './copyright.component.html',
  styleUrls: ['./copyright.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CopyrightComponent implements OnInit, OnDestroy {
  contenuHtml = '';

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load(this.translate.currentLang || this.translate.getDefaultLang());

    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => this.load(event.lang));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(lang: string): void {
    const filePath = `/assets/collspec/bib-pages/copyright/${lang}-copyright.html`;
    this.http.get(filePath, { responseType: 'text' })
      .pipe(
        catchError(err => {
          console.error(`Erreur lors du chargement de ${filePath}`, err);
          return of('<p>Contenu non disponible.</p>');
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(html => {
        this.contenuHtml = html;
        this.cdRef.detectChanges();
      });
  }
}
