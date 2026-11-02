import { AsyncPipe, CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
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

import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { ItemDataService } from 'src/app/core/data/item-data.service';
import { RemoteData } from 'src/app/core/data/remote-data';
import { Collection } from 'src/app/core/shared/collection.model';
import { Item } from 'src/app/core/shared/item.model';
import { hasValue } from 'src/app/shared/empty.util';

@Component({
  selector: 'ds-themed-header',
  styleUrls: ['header.component.scss'],
  templateUrl: 'header.component.html',
  standalone: true,
  imports: [
    NgbDropdownModule,
    ThemedLangSwitchComponent,
    RouterLink,
    ThemedSearchNavbarComponent,
    ContextHelpToggleComponent,
    ThemedAuthNavMenuComponent,
    ImpersonateNavbarComponent,
    ThemedNavbarComponent,
    TranslateModule,
    AsyncPipe,
    CommonModule
  ],
})
export class HeaderComponent extends BaseComponent implements OnInit, OnDestroy {

  public isAuthenticated: Observable<boolean>;
  public isNavBarCollapsed$: Observable<boolean>;
  public isTabletOrMobile$: Observable<boolean>;
  public browseDefinitions$: Observable<BrowseDefinition[]>;

  public isMobileBrowseOpen = false;
  public isMobileRessourcesOpen = false;
  public isMobileIiifOpen = false;

  public collectionName$ = new BehaviorSubject<string>('');
  public collectionUuid$ = new BehaviorSubject<string>('');

  public collectionLink$: Observable<string[]>;

  private routerSub: Subscription;

  constructor(
    protected menuService: MenuService,
    protected store: Store<AppState>,
    protected windowService: HostWindowService,
    private browseService: BrowseService,
    private router: Router,
    private collectionService: CollectionDataService,
    private itemService: ItemDataService,
  ) {
    super(menuService, windowService);

    this.collectionLink$ = this.collectionUuid$.pipe(
      map((uuid: string) => uuid ? ['/collections', uuid] : ['/'])
    );
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

    this.setCurrentCollection(this.router.url);

    this.routerSub = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      switchMap(() => {
        this.setCurrentCollection(this.router.url);
        return of(null);
      })
    ).subscribe();
  }

  private setCurrentCollection(url: string): void {
    const collectionMatch = url.match(/\/collections\/([0-9a-f-]{36})/);
    const itemMatch = url.match(/\/items\/([0-9a-f-]{36})/);

    if (collectionMatch) {
      this.loadCollection(collectionMatch[1]);
      return;
    }

    if (itemMatch) {
      this.loadOwningCollection(itemMatch[1]);
      return;
    }

    this.resetCollection();
  }

  private loadCollection(uuid: string): void {
    this.collectionService.findById(uuid).pipe(
      map((rd: RemoteData<Collection>) => {
        if (hasValue(rd?.payload)) {
          this.collectionName$.next(rd.payload.name);
          this.collectionUuid$.next(rd.payload.uuid);
        } else {
          this.resetCollection();
        }
      }),
      catchError(() => {
        this.resetCollection();
        return of(null);
      })
    ).subscribe();
  }

  private loadOwningCollection(itemUuid: string): void {
    this.itemService.findById(itemUuid).pipe(
      switchMap((itemRd: RemoteData<Item>) => {
        if (!hasValue(itemRd?.payload)) {
          this.resetCollection();
          return of(null);
        }

        return itemRd.payload.owningCollection.pipe(
          map((collectionRd: RemoteData<Collection>) => {
            if (hasValue(collectionRd?.payload)) {
              this.collectionName$.next(collectionRd.payload.name);
              this.collectionUuid$.next(collectionRd.payload.uuid);
            } else {
              this.resetCollection();
            }
          }),
          catchError(() => {
            this.resetCollection();
            return of(null);
          })
        );
      }),
      catchError(() => {
        this.resetCollection();
        return of(null);
      })
    ).subscribe();
  }

  private resetCollection(): void {
    this.collectionName$.next('');
    this.collectionUuid$.next('');
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

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}