import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {catchError, map } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-page-blrcs',
  templateUrl: './page-blrcs.component.html',
  styleUrls: ['./page-blrcs.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    CommonModule,
    NgbModule
  ],
})
export class PageblrcsComponent implements OnInit {
  contenuHtml: string = '';
  currentLang: string;
  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Charge la langue actuelle ou la langue par défaut
    this.currentLang = this.translate.currentLang || this.translate.getDefaultLang();
    this.load(this.currentLang);

    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.load(this.currentLang);
    });
  }

  load(lang: string): void {
    const filePath = `/assets/collspec/bib-pages/blrcs/${lang}-blrcs.html`;
    this.http.get(filePath, { responseType: 'text' })
      .pipe(
        catchError(err => {
          console.error(`Erreur lors du chargement de ${filePath}`, err);
          return of('<p>Contenu non disponible.</p>');
        })
      )
      .subscribe(html => {
        this.contenuHtml = html;
        this.cdRef.detectChanges(); // Force la mise à jour de la vue
      });
  }
}
