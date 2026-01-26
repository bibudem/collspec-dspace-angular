import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
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
  selector: 'ds-vedette-liste',
  templateUrl: './vedette-liste.component.html',
  styleUrls: ['./vedette-liste.component.scss'],
  standalone: true,
  imports: [
    ThemedLoadingComponent,
    TranslateModule,
    RouterModule,
    CommonModule,
    NgbModule,
  ],
})
export class VedetteListeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('track') track: ElementRef<HTMLUListElement>;
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

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Laisse le DOM se stabiliser, initCarousel sera appelé après le loadData()
  }

  // Appelle le service pour charger les vedettes, puis initialise le carrousel
  private loadData(): void {
    this.vedetteService.getImagesHome().pipe(
      map(images => this.vedetteService.shuffleArray(images).slice(0, 8))
    ).subscribe({
      next: (images) => {
        this.slides = images;
        this.originalSlideCount = images.length;
        // Duplique les slides pour créer une boucle infinie
        this.displaySlides = [...images, ...images];
        this.loading = false;
        this.error = false;

        // On attend un tick pour que le DOM soit prêt avant d'initialiser
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

  // Initialise le carrousel (calcul de largeur, position, démarrage auto-slide)
  private initCarousel(): void {
    if (!this.isBrowser) return;

    this.calculateItemWidth();
    this.updatePosition();
    this.startAutoSlide();

    window.addEventListener('resize', this.calculateItemWidth.bind(this));
  }

  // Calcule dynamiquement la largeur d'un item en utilisant le DOM
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

  // Applique une translation horizontale en fonction de l'index courant
  updatePosition(): void {
    if (!this.track?.nativeElement || this.displaySlides.length === 0) return;
    const offset = -this.currentIndex * (this.itemWidth + 20);
    this.track.nativeElement.style.transform = `translateX(${offset}px)`;
  }

  // Passe à la slide suivante avec effet de boucle
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

  // Revient à la slide précédente avec effet de boucle
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

  // Lance le défilement automatique du carrousel
  startAutoSlide(): void {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => this.nextSlide(), 4000);
  }

  // Arrête le défilement automatique
  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  // Fonction de tracking Angular pour optimiser les itérations
  trackByFn(index: number, item: Vedette): string {
    return item.id + '-' + index;
  }

  // Getter pour vérifier s'il y a des slides originales
  get hasSlidesToDisplay(): boolean {
    return this.slides.length > 0;
  }

  // Nettoyage : arrêt de l'auto-slide et retrait des listeners
  ngOnDestroy(): void {
    this.stopAutoSlide();
    if (this.isBrowser) {
      window.removeEventListener('resize', this.calculateItemWidth.bind(this));
    }
  }
}