import {
  isPlatformBrowser,
  NgTemplateOutlet,
} from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';

/** Une image d'un carrousel du guide */
interface GuideDiapo {
  src: string;
  alt: string;
  legende: string;
}

const IMG = '/assets/collspec/images/guides/mirador/';

/**
 * Guide d'utilisation de Mirador (/page/mirador-guide).
 * Même structure et mêmes styles que les pages À propos et Droits d'auteur
 * (.about-page, .about-intro, .about-section, .h2-bib-titre, .bib-description).
 *
 * Carrousels sans bibliothèque (motif WAI-ARIA « Carousel ») : un seul gabarit
 * (#carrousel dans le HTML) réutilisé pour chaque carrousel, l'image affichée
 * de chacun est retenue dans `actifs`. Pas de défilement automatique, boutons
 * nommés, flèches du clavier, image courante annoncée, légende sous l'image.
 */
@Component({
  selector: 'ds-mirador-guide',
  templateUrl: './mirador-guide.component.html',
  styleUrls: ['./mirador-guide.component.scss'],
  standalone: true,
  imports: [NgTemplateOutlet],
})
export class MiradorGuideComponent implements AfterViewInit {

  readonly carrousels: Record<string, GuideDiapo[]> = {
    panneauInfo: [
      { src: IMG + 'mirador-info-closed.png', alt: 'Panneau d’information : métadonnées', legende: 'Métadonnées descriptives du document.' },
      { src: IMG + 'mirador-info-open.png', alt: 'Panneau d’information : transcription et voir aussi', legende: 'Transcription, liens « Voir aussi » et autres formats.' },
    ],
    espaceTravail: [
      { src: IMG + 'mirador-panes.png', alt: 'Espace de travail Mirador : vue générale', legende: 'Vue générale de l’espace de travail Mirador.' },
      { src: IMG + 'mirador-links.png', alt: 'Espace de travail Mirador : comparaison de documents', legende: 'Autres liens et formats alternatifs.' },
    ],
    barreSuperieure: [
      { src: IMG + 'mirador-plugins-bar.png', alt: 'Barre supérieure : titre du document', legende: 'Titre du document dans la barre supérieure.' },
      { src: IMG + 'mirador-image-tools.png', alt: 'Barre supérieure : plugins et options', legende: 'Accès aux plugins et options avancées.' },
    ],
    transcriptions: [
      { src: IMG + 'mirador-transcriptions-1.png', alt: 'Icône pour afficher les transcriptions', legende: 'Cliquez sur l’icône de transcription dans la fenêtre Mirador.' },
      { src: IMG + 'mirador-transcriptions-2.png', alt: 'Panneau de transcription affiché', legende: 'Le panneau de transcription s’affiche dans le panneau d’information.' },
    ],
    manifeste: [
      { src: IMG + 'mirador-manifest-1.png', alt: 'Copier l’adresse du manifeste IIIF', legende: 'Copiez l’adresse du manifeste IIIF depuis la notice du document.' },
      { src: IMG + 'mirador-manifest-2.png', alt: 'Ajouter un manifeste dans Mirador', legende: 'Ajoutez le manifeste dans un nouveau panneau Mirador.' },
      { src: IMG + 'mirador-manifest-3.png', alt: 'Comparer plusieurs documents avec des manifestes IIIF', legende: 'Comparez plusieurs documents à l’aide de leurs manifestes IIIF.' },
    ],
    recherche: [
      { src: IMG + 'mirador-search-1.png', alt: 'Outil de recherche dans Mirador', legende: 'Ouvrez l’outil de recherche dans Mirador.' },
      { src: IMG + 'mirador-search-2.png', alt: 'Recherche d’un terme dans le document', legende: 'Entrez un terme ou une expression à rechercher.' },
      { src: IMG + 'mirador-search-3.png', alt: 'Résultats de recherche surlignés dans les pages', legende: 'Les occurrences du terme sont surlignées dans les pages correspondantes.' },
    ],
    ocr: [
      { src: IMG + 'mirador-ocr-1.png', alt: 'Activation de l’affichage OCR', legende: 'Activez l’affichage OCR dans les options de la fenêtre.' },
      { src: IMG + 'mirador-ocr-2.png', alt: 'Texte OCR en surimpression sur l’image', legende: 'Le texte OCR s’affiche en surimpression sur l’image.' },
      { src: IMG + 'mirador-ocr-3.png', alt: 'Détail du texte OCR en surimpression', legende: 'Détail du texte OCR en surimpression, facilitant la lecture.' },
    ],
  };

  /** Image affichée dans chaque carrousel (clé = nom du carrousel) */
  readonly actifs: Record<string, number> = {};

  constructor(
    private elRef: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  /** Arrivée avec une ancre (ex. lien « C'est quoi IIIF ? » de la notice : #what-is-iiif) */
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (/^[\w-]+$/.test(id)) {
      setTimeout(() => this.elRef.nativeElement.querySelector<HTMLElement>('#' + id)?.scrollIntoView({ block: 'start' }));
    }
  }

  /**
   * Table des matières : un lien « #ancre » renverrait à l'accueil (balise <base>),
   * on défile donc vers la section et on y place le focus (clavier, lecteur d'écran).
   */
  allerA(event: Event, id: string): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const cible = this.elRef.nativeElement.querySelector<HTMLElement>('#' + id);
    if (!cible) {
      return;
    }
    const reduit = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    cible.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' });
    cible.focus({ preventScroll: true });
  }

  /** Index de l'image affichée dans un carrousel */
  actif(cle: string): number {
    return this.actifs[cle] ?? 0;
  }

  /** Affiche l'image `index` d'un carrousel (ignoré hors limites) */
  aller(cle: string, index: number): void {
    if (index >= 0 && index < this.carrousels[cle].length) {
      this.actifs[cle] = index;
    }
  }
}
