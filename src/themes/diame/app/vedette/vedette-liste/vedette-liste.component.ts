import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Inject,
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
  itemWidth = 0;
  loading = true;
  error = false;
  autoSlideInterval: any;
  isBrowser: boolean;
  private originalSlideCount = 0;
  private resizeHandler = () => this.calculateItemWidth();

  constructor(
    private vedetteService: VedetteService,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.vedetteService.getImagesHome().pipe(
      map(images => this.vedetteService.shuffleArray(images).slice(0, 8)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (images) => {
        this.slides = images;
        this.originalSlideCount = images.length;
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

  private initCarousel(): void {
    if (!this.isBrowser) return;

    this.calculateItemWidth();
    this.updatePosition();
    this.startAutoSlide();

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
    if (!this.track?.nativeElement || this.displaySlides.length === 0) return;
    const offset = -this.currentIndex * (this.itemWidth + 20);
    this.track.nativeElement.style.transform = `translateX(${offset}px)`;
  }

  nextSlide(): void {
    if (this.displaySlides.length <= 1) return;

    this.currentIndex++;

    if (this.currentIndex >= this.displaySlides.length) {
      this.track.nativeElement.style.transition = 'none';
      this.currentIndex = 0;
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

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.updatePosition();
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  get activeIndicator(): number {
    return this.currentIndex % (this.originalSlideCount || 1);
  }

  prevSlide(): void {
    if (this.displaySlides.length <= 1) return;

    this.currentIndex--;

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

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  onMouseEnter(): void {
    this.stopAutoSlide();
  }

  onMouseLeave(): void {
    this.startAutoSlide();
  }

  trackByFn(index: number, item: Vedette): string {
    return item.id + '-' + index;
  }

  get hasSlidesToDisplay(): boolean {
    return this.slides.length > 0;
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
    if (this.isBrowser) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}
