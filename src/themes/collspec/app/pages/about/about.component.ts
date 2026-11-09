import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

/**
 * Page « À propos » : charge le contenu HTML statique selon la langue courante
 * (assets/collspec/bib-pages/about/{lang}-about.html). Les styles sont dans _global-styles.scss.
 */
@Component({
  selector: 'ds-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AboutComponent implements OnInit, OnDestroy {
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
    const filePath = `/assets/collspec/bib-pages/about/${lang}-about.html`;
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
