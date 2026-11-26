import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { RootModule } from '../../app/root.module';
import { SearchResultsSkeletonComponent } from '../../app/shared/search/search-results/search-results-skeleton/search-results-skeleton.component';
import { CollectionPageComponent } from './app/collection-page/collection-page.component';
import { EditItemTemplatePageComponent } from './app/collection-page/edit-item-template-page/edit-item-template-page.component';
import { DsoEditMetadataComponent } from './app/dso-shared/dso-edit-metadata/dso-edit-metadata.component';
import { ItemPageComponent } from './app/item-page/simple/item-page.component';
import { RootComponent } from './app/root/root.component';
import { BrowseByComponent } from './app/shared/browse-by/browse-by.component';
import { SearchResultsComponent } from './app/shared/search/search-results/search-results.component';
// collspec modules


const DECLARATIONS = [
  RootComponent,
  ItemPageComponent,
  EditItemTemplatePageComponent,
  SearchResultsComponent,
  DsoEditMetadataComponent,
  BrowseByComponent,
  SearchResultsSkeletonComponent,
];

@NgModule({
  imports: [
    RootModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    NgbModule,
    RouterModule,
    ScrollToModule,
    StoreModule,
    StoreRouterConnectingModule,
    TranslateModule,
    NgxGalleryModule,

    RootComponent,
    CollectionPageComponent,
    ItemPageComponent,
    EditItemTemplatePageComponent,
    SearchResultsComponent,
    DsoEditMetadataComponent,
    BrowseByComponent,
    SearchResultsSkeletonComponent,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
class LazyThemeModule {
}