import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ThemedLoadingComponent } from "../../../../app/shared/loading/themed-loading.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from '@ngx-translate/core';
import { AboutComponent } from "./about/about.component";
import { CommonModule } from '@angular/common';
import { GuideComponent } from './guide/guide.component';

@Component({
  selector: 'ds-pages',
  templateUrl: './pages.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ThemedLoadingComponent,
    TranslateModule,
    RouterModule,
    NgbModule,
    GuideComponent,
    AboutComponent
  ],
})
export class PagesComponent implements OnInit {
  currentComponent: any;
  private readonly componentMap: { [key: string]: any } = {
    'a-propos': AboutComponent,
    'guide': GuideComponent,

  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const namePage = params['page'];

      if (namePage && this.componentMap[namePage]) {
        this.currentComponent = this.componentMap[namePage];
      } else {
        this.reload('not-found');
      }

    });
  }

  /**
   * Fonction pour recharger l'URL de manière propre
   * @param url - L'URL cible vers laquelle rediriger
   * @returns Une promesse de navigation
   */
  reload(url: string): Promise<boolean> {
    // Navigation temporaire vers l'URL courante sans changer l'historique, puis redirection vers l'URL cible
    return this.router.navigateByUrl('.', { skipLocationChange: true })
      .then(() => this.router.navigateByUrl(url));
  }
}
