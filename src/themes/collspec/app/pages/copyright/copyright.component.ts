import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageStatiqueService } from '../../../service/page-statique.service';

/**
 * Page « Droit d'auteur et utilisation » : contenu HTML statique selon la langue courante
 * (assets/collspec/bib-pages/copyright/{lang}-copyright.html), chargé par PageStatiqueService
 * (une seule fois, repris du rendu serveur). Les styles sont dans _global-styles.scss.
 */
@Component({
  selector: 'ds-copyright',
  templateUrl: './copyright.component.html',
  styleUrls: ['./copyright.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CopyrightComponent implements OnInit {
  contenuHtml = '';

  constructor(
    private pageStatique: PageStatiqueService,
    private cdRef: ChangeDetectorRef,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.pageStatique.contenu('copyright')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(html => {
        this.contenuHtml = html;
        this.cdRef.markForCheck();
      });
  }
}
