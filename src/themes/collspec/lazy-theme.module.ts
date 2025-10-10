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
import { CommunityPageComponent } from './app/community-page/community-page.component';
import { EditItemTemplatePageComponent } from './app/collection-page/edit-item-template-page/edit-item-template-page.component';
import { DsoEditMetadataComponent } from './app/dso-shared/dso-edit-metadata/dso-edit-metadata.component';
import { HomePageComponent } from './app/home-page/home-page.component';
import { FeedbackComponent } from './app/info/feedback/feedback.component';
import { FeedbackFormComponent } from './app/info/feedback/feedback-form/feedback-form.component';
import { ItemPageComponent } from './app/item-page/simple/item-page.component';
import { RootComponent } from './app/root/root.component';
import { BrowseByComponent } from './app/shared/browse-by/browse-by.component';
import { SearchResultsComponent } from './app/shared/search/search-results/search-results.component';
// collspec modules

import { VedetteUUIDComponent } from './app/vedette/vedette-uuid/vedette-uuid.component';


const DECLARATIONS = [
  HomePageComponent,
  VedetteUUIDComponent,
  RootComponent,
  CollectionPageComponent,
  CommunityPageComponent,
  ItemPageComponent,
  FeedbackComponent,
  FeedbackFormComponent,
  EditItemTemplatePageComponent,
  SearchResultsComponent,
  DsoEditMetadataComponent,
  BrowseByComponent,
  SearchResultsSkeletonComponent
];

@NgModule({
  imports: [RootModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    NgbModule,
    RouterModule,
    ScrollToModule,
    StoreModule,
    StoreRouterConnectingModule,
    TranslateModule,
    FormsModule,
    NgxGalleryModule,
    ...DECLARATIONS],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
  ],
})

  /**
   * This module serves as an index for all the components in this theme.
   * It should import all other modules, so the compiler knows where to find any components referenced
   * from a component in this theme
   * It is purposefully not exported, it should never be imported anywhere else, its only purpose is
   * to give lazily loaded components a context in which they can be compiled successfully
   */
class LazyThemeModule {
}
