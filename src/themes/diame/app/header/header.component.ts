import { AsyncPipe, CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThemedLangSwitchComponent } from 'src/app/shared/lang-switch/themed-lang-switch.component';

import { ContextHelpToggleComponent } from '../../../../app/header/context-help-toggle/context-help-toggle.component';
import { HeaderComponent as BaseComponent } from '../../../../app/header/header.component';
import { ThemedNavbarComponent } from '../../../../app/navbar/themed-navbar.component';
import { ThemedSearchNavbarComponent } from '../../../../app/search-navbar/themed-search-navbar.component';
import { ThemedAuthNavMenuComponent } from '../../../../app/shared/auth-nav-menu/themed-auth-nav-menu.component';
import { ImpersonateNavbarComponent } from '../../../../app/shared/impersonate-navbar/impersonate-navbar.component';

import { Store, select } from '@ngrx/store';
import { isAuthenticated } from 'src/app/core/auth/selectors';
import { AppState } from 'src/app/app.reducer';
import { BrowseService } from 'src/app/core/browse/browse.service';
import { BrowseDefinition } from 'src/app/core/shared/browse-definition.model';
import { getFirstSucceededRemoteData } from 'src/app/core/shared/operators';
import { MenuService } from 'src/app/shared/menu/menu.service';
import { HostWindowService } from 'src/app/shared/host-window.service';

@Component({
  selector: 'ds-themed-header',
  styleUrls: ['header.component.scss'],
  templateUrl: 'header.component.html',
  standalone: true,
  imports: [NgbDropdownModule, ThemedLangSwitchComponent, RouterLink, ThemedSearchNavbarComponent, ContextHelpToggleComponent, ThemedAuthNavMenuComponent, ImpersonateNavbarComponent, ThemedNavbarComponent, TranslateModule, AsyncPipe, CommonModule],
})
export class HeaderComponent extends BaseComponent implements OnInit {

  public isAuthenticated: Observable<boolean>;
  public isNavBarCollapsed$: Observable<boolean>;
  public isTabletOrMobile$: Observable<boolean>;
  public browseDefinitions$: Observable<BrowseDefinition[]>;
  public isMobileBrowseOpen = false;
  public isMobileRessourcesOpen = false;
  public isMobileIiifOpen = false;

  constructor(
    protected menuService: MenuService,
    protected store: Store<AppState>,
    protected windowService: HostWindowService,
    private browseService: BrowseService,
  ) {
    super(menuService, windowService);
  }

  ngOnInit() {
    super.ngOnInit();

    this.isAuthenticated = this.store.pipe(select(isAuthenticated));
    this.isNavBarCollapsed$ = this.menuService.isMenuCollapsed(this.menuID);
    this.isTabletOrMobile$ = of(false);

    this.browseDefinitions$ = this.browseService.getBrowseDefinitions().pipe(
      getFirstSucceededRemoteData(),
      map(rd => rd.payload.page),
    );
  }

  public toggleMobileBrowse(): void {
    this.isMobileBrowseOpen = !this.isMobileBrowseOpen;
  }

  public toggleMobileRessources(): void {
    this.isMobileRessourcesOpen = !this.isMobileRessourcesOpen;
  }
  
  public toggleMobileIiif(): void {
  this.isMobileIiifOpen = !this.isMobileIiifOpen;
  }
}