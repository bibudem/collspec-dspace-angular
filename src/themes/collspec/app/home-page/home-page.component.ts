import {
  AsyncPipe,
  DOCUMENT,
  NgClass,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HomeCoarComponent } from '../../../../app/home-page/home-coar/home-coar.component';
import { ThemedHomeNewsComponent } from '../../../../app/home-page/home-news/themed-home-news.component';
import { HomePageComponent as BaseComponent } from '../../../../app/home-page/home-page.component';
import { RecentItemListComponent } from '../../../../app/home-page/recent-item-list/recent-item-list.component';
import { ThemedTopLevelCommunityListComponent } from '../../../../app/home-page/top-level-community-list/themed-top-level-community-list.component';
import { SuggestionsPopupComponent } from '../../../../app/notifications/suggestions/popup/suggestions-popup.component';
import { ThemedConfigurationSearchPageComponent } from '../../../../app/search-page/themed-configuration-search-page.component';
import { ThemedSearchFormComponent } from '../../../../app/shared/search-form/themed-search-form.component';
import { PageWithSidebarComponent } from '../../../../app/shared/sidebar/page-with-sidebar.component';
import {ConfigurationSearchPageComponent} from "../../../../app/search-page/configuration-search-page.component";
import { VedetteListeComponent } from '../vedette/vedette-liste/vedette-liste.component';

@Component({
  selector: 'ds-themed-home-page',
  styleUrls: ['./home-page.component.scss'],
  //styleUrls: ['../../../../app/home-page/home-page.component.scss'],
  templateUrl: './home-page.component.html',
  //templateUrl: '../../../../app/home-page/home-page.component.html',
  standalone: true,
  imports: [
    ThemedHomeNewsComponent,
    NgTemplateOutlet,
    ThemedSearchFormComponent,
    ThemedTopLevelCommunityListComponent,
    RecentItemListComponent,
    AsyncPipe,
    TranslateModule,
    NgClass,
    NgIf,
    ConfigurationSearchPageComponent,
    HomeCoarComponent,
    ThemedConfigurationSearchPageComponent,
    SuggestionsPopupComponent,
    PageWithSidebarComponent,
    VedetteListeComponent]
})

export class HomePageComponent extends BaseComponent implements OnInit, OnDestroy {
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);

  /** Avis sur les contenus sensibles ouvert (au clic) */
  avisOuvert = false;

  /** Aperçu au survol fermé par Échap, jusqu'à ce que la souris quitte le lien (WCAG 1.4.13) */
  avisMasque = false;

  @ViewChild('avisAncre') private avisAncre?: ElementRef<HTMLElement>;
  @ViewChild('avisLien') private avisLien?: ElementRef<HTMLElement>;

  /** Échap, où que soit le focus : ferme l'avis ouvert, ou masque l'aperçu au survol */
  @HostListener('document:keydown.escape')
  fermerAvisParEchap(): void {
    if (this.avisOuvert) {
      const focusDansAvis = this.avisAncre?.nativeElement.contains(this.document.activeElement);
      this.avisOuvert = false;
      if (focusDansAvis) {
        this.avisLien?.nativeElement.focus();
      }
    }
    // Seulement si la souris est dessus : sinon mouseleave ne remettrait jamais l'aperçu
    if (this.avisAncre?.nativeElement.matches(':hover')) {
      this.avisMasque = true;
    }
  }

  /** Ferme l'avis et rend le focus au lien qui l'a ouvert */
  fermerAvis(lien: HTMLElement): void {
    if (this.avisOuvert) {
      this.avisOuvert = false;
      lien.focus();
    }
  }

  /** Clic ou toucher en dehors de l'avis : on le ferme */
  @HostListener('document:click', ['$event'])
  fermerAvisSiClicExterieur(event: Event): void {
    if (this.avisOuvert && !this.avisAncre?.nativeElement.contains(event.target as Node)) {
      this.avisOuvert = false;
    }
  }

  // En-tête aligné sur le titre de la bannière (voir _global-styles.scss)
  ngOnInit(): void {
    super.ngOnInit();
    this.renderer.addClass(this.document.body, 'collspec-accueil');
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'collspec-accueil');
  }
}
