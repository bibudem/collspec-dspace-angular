import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VedetteService } from '../../../service/vedette.service';
import { map } from 'rxjs/operators';
import { Vedette } from '../../../models/Vedette';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

const AUTO_SLIDE_DELAY_MS = 5000;
const MAX_SLIDES = 8;
const SWIPE_THRESHOLD_PX = 40;

/**
 * Carrousel des pièces en vedette (page d'accueil).
 *
 * Boucle infinie : la liste est affichée deux fois. L'index reste entre 0 et n
 * (n = nombre d'images) ; les positions 0 et n montrent la même image, ce qui permet
 * de sauter de l'une à l'autre sans animation, juste avant de défiler, sans que ça se voie.
 */
@Component({
  selector: 'ds-vedette-liste',
  templateUrl: './vedette-liste.component.html',
  styleUrls: ['./vedette-liste.component.scss'],
  standalone: true,
  imports: [
    ThemedLoadingComponent,
    TranslateModule,
    RouterModule,
  ],
})
export class VedetteListeComponent implements OnInit, OnDestroy {
  @ViewChild('track') track: ElementRef<HTMLUListElement>;
  slides: Vedette[] = [];
  displaySlides: Vedette[] = [];
  currentIndex = 0;
  loading = true;
  error = false;
  isBrowser: boolean;

  /** Pause demandée par le bouton (le carrousel défile par défaut) */
  userPaused = false;

  private step = 0;
  private autoSlideInterval: ReturnType<typeof setInterval> | null = null;
  private hovered = false;
  private focused = false;
  private touchStartX: number | null = null;
  private resizeFrame: number | null = null;

  private readonly onResize = () => {
    if (this.resizeFrame !== null) return;
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = null;
      this.measure();
      this.applyPosition(false);
    });
  };

  private readonly onVisibilityChange = () => this.updateAutoSlide();

  constructor(
    private vedetteService: VedetteService,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.loadData();
  }

  get originalSlideCount(): number {
    return this.slides.length;
  }

  get activeIndicator(): number {
    return this.currentIndex % (this.originalSlideCount || 1);
  }

  get hasSlidesToDisplay(): boolean {
    return this.slides.length > 0;
  }

  // ───── Chargement ─────

  private loadData(): void {
    this.vedetteService.getImagesHome().pipe(
      map(images => this.vedetteService.shuffleArray(images).slice(0, MAX_SLIDES)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (images) => {
        this.slides = images;
        this.displaySlides = [...images, ...images];
        this.loading = false;
        this.error = false;
        this.cdr.detectChanges();
        this.initCarousel();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private initCarousel(): void {
    if (!this.isBrowser || !this.track) return;

    this.measure();
    this.applyPosition(false);

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onResize, { passive: true });
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    });
    this.updateAutoSlide();
  }

  // ───── Position ─────

  /** Largeur d'une image + espace réel entre les images (lu dans le CSS) */
  private measure(): void {
    const list = this.track?.nativeElement;
    const firstSlide = list?.querySelector<HTMLElement>('.slider__slide');
    if (!list || !firstSlide) return;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    this.step = firstSlide.offsetWidth + gap;
  }

  private applyPosition(animate: boolean): void {
    const list = this.track?.nativeElement;
    if (!list) return;
    list.style.transition = animate ? '' : 'none';
    list.style.transform = `translateX(${-this.currentIndex * this.step}px)`;
  }

  /** Place la liste sur la copie identique (0 ↔ n) sans animation */
  private jumpTo(index: number): void {
    this.currentIndex = index;
    this.applyPosition(false);
    void this.track.nativeElement.offsetWidth; // force l'application avant la prochaine animation
  }

  // ───── Navigation ─────

  nextSlide(): void {
    if (this.originalSlideCount <= 1) return;
    if (this.currentIndex >= this.originalSlideCount) this.jumpTo(this.currentIndex - this.originalSlideCount);
    this.currentIndex++;
    this.applyPosition(true);
  }

  prevSlide(): void {
    if (this.originalSlideCount <= 1) return;
    if (this.currentIndex <= 0) this.jumpTo(this.originalSlideCount);
    this.currentIndex--;
    this.applyPosition(true);
  }

  goToSlide(index: number): void {
    if (index === this.currentIndex) return;
    // Même image affichée depuis la copie (position n) : on revient sur l'originale sans animation
    if (index === this.activeIndicator) {
      this.jumpTo(index);
      return;
    }
    this.currentIndex = index;
    this.applyPosition(true);
    this.restartAutoSlide();
  }

  onArrow(direction: 'prev' | 'next'): void {
    direction === 'next' ? this.nextSlide() : this.prevSlide();
    this.restartAutoSlide();
  }

  // ───── Défilement automatique ─────

  togglePause(): void {
    this.userPaused = !this.userPaused;
    this.updateAutoSlide();
  }

  onMouseEnter(): void {
    this.hovered = true;
    this.updateAutoSlide();
  }

  onMouseLeave(): void {
    this.hovered = false;
    this.updateAutoSlide();
  }

  onFocusIn(): void {
    this.focused = true;
    this.updateAutoSlide();
  }

  onFocusOut(event: FocusEvent): void {
    const wrapper = event.currentTarget as HTMLElement;
    if (wrapper.contains(event.relatedTarget as Node)) return;
    this.focused = false;
    this.updateAutoSlide();
  }

  private get shouldAutoSlide(): boolean {
    return this.isBrowser
      && this.originalSlideCount > 1
      && !this.userPaused
      && !this.hovered
      && !this.focused
      && document.visibilityState === 'visible';
  }

  private updateAutoSlide(): void {
    if (this.shouldAutoSlide) {
      if (!this.autoSlideInterval) this.startAutoSlide();
    } else {
      this.stopAutoSlide();
    }
  }

  private restartAutoSlide(): void {
    this.stopAutoSlide();
    this.updateAutoSlide();
  }

  /** Hors de la zone Angular : seule la vue du carrousel est rafraîchie à chaque tour */
  private startAutoSlide(): void {
    this.ngZone.runOutsideAngular(() => {
      this.autoSlideInterval = setInterval(() => {
        this.nextSlide();
        this.cdr.detectChanges();
      }, AUTO_SLIDE_DELAY_MS);
    });
  }

  private stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  // ───── Balayage tactile ─────

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0]?.clientX ?? null;
  }

  onTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === null) return;
    const deltaX = (event.changedTouches[0]?.clientX ?? this.touchStartX) - this.touchStartX;
    this.touchStartX = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    this.onArrow(deltaX < 0 ? 'next' : 'prev');
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
    if (this.isBrowser) {
      window.removeEventListener('resize', this.onResize);
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      if (this.resizeFrame !== null) cancelAnimationFrame(this.resizeFrame);
    }
  }
}
