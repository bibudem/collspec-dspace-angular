import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageStatiqueService } from '../../../service/page-statique.service';

/**
 * Page « À propos » : contenu HTML statique selon la langue courante
 * (assets/collspec/bib-pages/about/{lang}-about.html), chargé par PageStatiqueService
 * (une seule fois, repris du rendu serveur). Les styles sont dans _global-styles.scss.
 */
@Component({
  selector: 'ds-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AboutComponent implements OnInit {
  contenuHtml = '';

  constructor(
    private pageStatique: PageStatiqueService,
    private cdRef: ChangeDetectorRef,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.pageStatique.contenu('about')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(html => {
        this.contenuHtml = html;
        this.cdRef.markForCheck();
      });
  }
}
