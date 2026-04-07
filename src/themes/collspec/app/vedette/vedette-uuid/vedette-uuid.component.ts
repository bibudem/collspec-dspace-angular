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

  nextSlide(): void {
    if (this.currentIndex < this.slides.length - 1) {
      this.currentIndex++;
      this.updatePosition();
    } else {
      // ✅ stop auto quand on atteint la fin
      this.stopAutoSlide();
    }
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updatePosition();
    }
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
    }
  }

  onMouseEnter(): void {
    this.stopAutoSlide();
  }

  onMouseLeave(): void {
    // ✅ reprend seulement si pas à la fin
    if (this.slides.length > 1 && this.currentIndex < this.slides.length - 1) {
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

  get isPrevDisabled(): boolean {
    return this.currentIndex === 0;
  }

  get isNextDisabled(): boolean {
    return this.currentIndex === this.slides.length - 1;
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();

    if (this.isBrowser && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}