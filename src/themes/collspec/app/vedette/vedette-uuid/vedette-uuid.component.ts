import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { VedetteService } from '../../../service/vedette.service';
import { map } from 'rxjs/operators';
import { Vedette } from '../../../models/Vedette';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ds-vedette-uuid',
  templateUrl: './vedette-uuid.component.html',
  styleUrls: ['./vedette-uuid.component.scss'],
  standalone: true,
  imports: [
    ThemedLoadingComponent,
    TranslateModule,
    RouterModule,
    CommonModule,
    NgbModule,
  ],
})
export class VedetteUUIDComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() uuid: string;
  @ViewChild('track') track: ElementRef<HTMLDivElement>;

  slides: Vedette[] = [];
  displaySlides: Vedette[] = []; // Slides avec clones pour boucle infinie
  currentIndex = 0;
  itemWidth = 0;
  loading = true;
  error = false;
  autoSlideInterval: any;
  isBrowser: boolean;
  private originalSlideCount = 0;

  constructor(
    private vedetteService: VedetteService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Initialise le chargement des données lors de la création du composant
  ngOnInit(): void {
    if (!this.uuid) {
      console.error('UUID non fourni');
      return;
    }

    this.loadData();
  }

  ngAfterViewInit(): void {
    // Le DOM est prêt ici, mais on initialise après les données
  }

  // Charge les vedettes depuis le service, applique un shuffle et initialise le carrousel si en environnement navigateur
  private loadData(): void {
    this.vedetteService.getImagesColl(this.uuid).pipe(
      map(images => this.vedetteService.shuffleArray(images).slice(0, 8))
    ).subscribe({
      next: (images) => {
        this.slides = images;
        this.originalSlideCount = images.length;
        // Duplique les slides pour créer une boucle infinie
        this.displaySlides = [...images, ...images];
        this.loading = false;
        this.error = false;

        if (this.isBrowser) {
          setTimeout(() => {
            this.initCarousel();
            this.cdr.detectChanges();
          });
        }
      },
      error: (err) => {
        console.error('Erreur chargement vedettes :', err);
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Initialise la logique du carrousel : calcul des dimensions, positionnement, et démarrage du slide auto
  private initCarousel(): void {
    if (!this.isBrowser) return;

    this.calculateItemWidth();
    this.updatePosition();
    this.startAutoSlide();

    window.addEventListener('resize', this.calculateItemWidth.bind(this));
  }

  // Calcule dynamiquement la largeur d'un item pour positionner correctement les slides
  calculateItemWidth(): void {
    if (!this.isBrowser) return;

    requestAnimationFrame(() => {
      const firstSlide = this.track?.nativeElement?.querySelector('.slider__slide') as HTMLElement;
      if (firstSlide) {
        this.itemWidth = firstSlide.offsetWidth;
        this.updatePosition();
      }
    });
  }

  // Met à jour la translation horizontale du carrousel en fonction de l'index courant
  updatePosition(): void {
    if (!this.track?.nativeElement || this.displaySlides.length === 0) return;
    const offset = -this.currentIndex * (this.itemWidth + 20);
    this.track.nativeElement.style.transform = `translateX(${offset}px)`;
  }

  // Fait avancer le carrousel à la slide suivante avec effet de boucle infinie
  nextSlide(): void {
    if (this.displaySlides.length <= 1) return;
    
    this.currentIndex++;

    // Quand on atteint la fin des clones, on réinitialise sans animation
    if (this.currentIndex >= this.displaySlides.length) {
      // Retire la transition pour le reset instantané
      this.track.nativeElement.style.transition = 'none';
      this.currentIndex = 0;
      this.updatePosition();

      // Redémarre la transition après le reset
      setTimeout(() => {
        this.track.nativeElement.style.transition = 'transform 0.5s ease-in-out';
      }, 50);
    } else {
      // Applique la transition normale pour le défilement
      if (!this.track.nativeElement.style.transition) {
        this.track.nativeElement.style.transition = 'transform 0.5s ease-in-out';
      }
      this.updatePosition();
    }
  }

  // Reculer le carrousel à la slide précédente avec effet de boucle infinie
  prevSlide(): void {
    if (this.displaySlides.length <= 1) return;
    
    this.currentIndex--;

    // Gère le retour au début
    if (this.currentIndex < 0) {
      this.track.nativeElement.style.transition = 'none';
      this.currentIndex = this.originalSlideCount - 1;
      this.updatePosition();

      setTimeout(() => {
        this.track.nativeElement.style.transition = 'transform 0.5s ease-in-out';
      }, 50);
    } else {
      if (!this.track.nativeElement.style.transition) {
        this.track.nativeElement.style.transition = 'transform 0.5s ease-in-out';
      }
      this.updatePosition();
    }
  }

  // Lance un intervalle pour faire défiler automatiquement les slides
  startAutoSlide(): void {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => this.nextSlide(), 3500);
  }

  // Arrête le défilement automatique si actif
  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  // Fonction de tracking Angular pour optimiser les performances du *ngFor
  trackByFn(index: number, item: Vedette): string {
    return item.id + '-' + index;
  }

  // Getter pour vérifier s'il y a des slides originales
  get hasSlidesToDisplay(): boolean {
    return this.slides.length > 0;
  }

  // Nettoie les ressources à la destruction du composant : arrêt de l'auto-slide et retrait du resize listener
  ngOnDestroy(): void {
    this.stopAutoSlide();
    if (this.isBrowser) {
      window.removeEventListener('resize', this.calculateItemWidth.bind(this));
    }
  }
}