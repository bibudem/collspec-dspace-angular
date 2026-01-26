import { AsyncPipe } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ThemedLangSwitchComponent } from 'src/app/shared/lang-switch/themed-lang-switch.component';

import { ContextHelpToggleComponent } from '../../../../app/header/context-help-toggle/context-help-toggle.component';
import { HeaderComponent as BaseComponent } from '../../../../app/header/header.component';
import { ThemedNavbarComponent } from '../../../../app/navbar/themed-navbar.component';
import { ThemedSearchNavbarComponent } from '../../../../app/search-navbar/themed-search-navbar.component';
import { ThemedAuthNavMenuComponent } from '../../../../app/shared/auth-nav-menu/themed-auth-nav-menu.component';
import { ImpersonateNavbarComponent } from '../../../../app/shared/impersonate-navbar/impersonate-navbar.component';
import { CommonModule } from '@angular/common';

import { Store, select } from '@ngrx/store';
import { isAuthenticated } from 'src/app/core/auth/selectors';
import { AppState } from 'src/app/app.reducer';
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

  constructor(
    protected menuService: MenuService,
    protected store: Store<AppState>,
    protected windowService: HostWindowService
  ) {
    super(menuService, windowService);
  }

  ngOnInit() {
    super.ngOnInit();

    this.isAuthenticated = this.store.pipe(select(isAuthenticated));
    this.isNavBarCollapsed$ = this.menuService.isMenuCollapsed(this.menuID);

    // Solution simple : utilisez directement les classes Bootstrap dans le template
    // Au lieu de gérer la logique dans TypeScript
    this.isTabletOrMobile$ = of(false); // Valeur par défaut
  }
}