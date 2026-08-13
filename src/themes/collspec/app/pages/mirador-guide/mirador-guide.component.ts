import { Component, OnInit, ElementRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-mirador-guide',
  templateUrl: './mirador-guide.component.html',
  styleUrls: ['./mirador-guide.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    CommonModule,
    NgbModule
  ],
})
export class MiradorGuideComponent implements OnInit {
  currentLang: string;

  constructor(
    private translate: TranslateService,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang || this.translate.getDefaultLang();

    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });

    // Intercept TOC clicks and scroll to the target section
    setTimeout(() => {
      const links = this.elRef.nativeElement.querySelectorAll('.iiif-toc a[href^="#"]');
      links.forEach((link: HTMLAnchorElement) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const id = link.getAttribute('href')!.slice(1);
          const target = this.elRef.nativeElement.querySelector('#' + id);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }, 0);
  }
}