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
  currentIndex = 0;
  itemWidth = 0;

  loading = true;
  error = false;
  autoSlideInterval: any;
  isBrowser: boolean;
  /** Pause demandée par l'utilisateur (bouton) : le survol et le focus ne relancent plus le défilement */
  userPaused = false;

  private resizeHandler: any;

  constructor(
    private vedetteService: VedetteService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.uuid) {
      console.error('UUID non fourni');
      return;
    }
    this.loadData();
  }

  ngAfterViewInit(): void {}

  private loadData(): void {
    this.vedetteService.getImagesColl(this.uuid).pipe(
      map(images => this.vedetteService.shuffleArray(images).slice(0, 8))
    ).subscribe({
      next: (images) => {
        this.slides = images;
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

  private initCarousel(): void {
    if (!this.isBrowser) return;

    this.calculateItemWidth();
    this.updatePosition();

    // Même comportement que le carrousel de l'accueil : défilement automatique, bouton pause pour l'arrêter
    if (this.slides.length > 1) {
      this.startAutoSlide();
    }

    this.resizeHandler = this.calculateItemWidth.bind(this);
    window.addEventListener('resize', this.resizeHandler);
  }

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

  updatePosition(): void {
    if (!this.track?.nativeElement || this.slides.length === 0) return;

    const offset = -this.currentIndex * (this.itemWidth + 20);
    this.track.nativeElement.style.transform = `translateX(${offset}px)`;
  }

  // Défilement en boucle dans les deux sens, comme le carrousel de l'accueil
  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.updatePosition();
    this.cdr.markForCheck(); // la page communauté est en OnPush : on signale le changement
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.updatePosition();
    this.cdr.markForCheck();
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.updatePosition();
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.stopAutoSlide();

    if (this.slides.length <= 1) return;

    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
      this.cdr.markForCheck();
    }
  }

  onMouseEnter(): void {
    this.stopAutoSlide();
  }

  onMouseLeave(): void {
    this.resumeIfAllowed();
  }

  /** Focus clavier dans le carrousel : on arrête le défilement pour ne pas déplacer le contenu sous le focus */
  onFocusIn(): void {
    this.stopAutoSlide();
  }

  onFocusOut(event: FocusEvent): void {
    const wrapper = event.currentTarget as HTMLElement;
    if (!wrapper.contains(event.relatedTarget as Node)) {
      this.resumeIfAllowed();
    }
  }

  /** Bouton pause / lecture */
  togglePause(): void {
    if (this.isPlaying) {
      this.userPaused = true;
      this.stopAutoSlide();
    } else {
      this.userPaused = false;
      this.startAutoSlide();
    }
  }

  get isPlaying(): boolean {
    return !!this.autoSlideInterval;
  }

  // Reprend seulement si l'utilisateur n'a pas mis le défilement en pause
  private resumeIfAllowed(): void {
    if (!this.userPaused && this.slides.length > 1) {
      this.startAutoSlide();
    }
  }

  trackByFn(index: number, item: Vedette): string {
    return item.id;
  }

  get hasSlidesToDisplay(): boolean {
    return this.slides.length > 0;
  }

  get showArrows(): boolean {
    return this.slides.length > 1;
  }

  get isFewSlides(): boolean {
    return this.slides.length <= 2;
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();

    if (this.isBrowser && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}