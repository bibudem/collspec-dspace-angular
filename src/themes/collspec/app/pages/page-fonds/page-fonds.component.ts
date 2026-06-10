import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';

const COL_NOM       = 'Nom';
const COL_PRECISION = 'Précision';
const COL_TYPE      = 'Type';
const COL_MERGED    = 'Fonds / Collection';
const COLS_IGNORE   = ['Canadiana'];

const PRESENCE_VALUES   = new Set(['x', 'oui', 'yes', '1']);
const ABSENT_VALUES     = new Set(['non', 'no', '0', '-']);
const COLS_INTERNAL_LINK = ['Numérisations'];

interface CollectionEntry {
  [key: string]: string;
}

@Component({
  selector: 'ds-fonds',
  templateUrl: './page-fonds.component.html',
  styleUrls: ['./page-fonds.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
})
export class PageFondsComponent implements OnInit, AfterViewInit {
  @ViewChild('tableWrapper') tableWrapper!: ElementRef<HTMLElement>;

  headers: string[] = [];
  rows: CollectionEntry[] = [];
  filteredRows: CollectionEntry[] = [];
  loading = true;
  error = false;
  sortColumn = '';
  sortDir: 'asc' | 'desc' = 'asc';
  canScrollLeft  = false;
  canScrollRight = false;
  periodGroup: { label: string; columns: string[] } | null = null;
  hasTwoHeaderRows = false;

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadExcel();
  }

  ngAfterViewInit(): void {
    this.checkScroll();
  }

  loadExcel(): void {
    const path = '/assets/collspec/files/repertoire-collections-fonds.xlsx';
    this.http.get(path, { responseType: 'arraybuffer' }).subscribe({
      next: (buffer) => {
        const wb = XLSX.read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        // range: 1 — ignore la ligne 1 (titre fusionné), ligne 2 = en-têtes réels
        const raw: CollectionEntry[] = XLSX.utils.sheet_to_json(ws, { defval: '', range: 1 });
        // Normalise les clés (trim) pour éviter les espaces invisibles dans l'Excel
        const normalized = raw.map(row =>
          Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim(), v]))
        ) as CollectionEntry[];
        const { headers, rows } = this.transform(normalized);
        this.headers = headers;
        this.rows = rows;
        this.detectSubHeaders();
        this.filteredRows = [...this.rows];
        this.loading = false;
        this.cdRef.detectChanges();
        // Vérifie le scroll après rendu du tableau
        setTimeout(() => this.checkScroll(), 0);
      },
      error: (err) => {
        console.error('Erreur chargement du répertoire', err);
        this.error = true;
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  private transform(data: CollectionEntry[]): { headers: string[]; rows: CollectionEntry[] } {
    if (data.length === 0) return { headers: [], rows: [] };

    const rawHeaders = Object.keys(data[0]);
    const mergeSources = [COL_NOM, COL_PRECISION, COL_TYPE];

    const headers: string[] = [];
    let mergedInserted = false;
    for (const h of rawHeaders) {
      if (COLS_IGNORE.includes(h)) continue;
      if (mergeSources.includes(h)) {
        if (!mergedInserted) { headers.push(COL_MERGED); mergedInserted = true; }
      } else {
        headers.push(h);
      }
    }

    const rows = data.map(row => {
      const out: CollectionEntry = {};

      const nom       = String(row[COL_NOM]       ?? '').trim();
      const precision = String(row[COL_PRECISION]  ?? '').trim();
      const type      = String(row[COL_TYPE]       ?? '').trim();
      let merged = nom;
      if (precision) merged += ` – ${precision}`;
      if (type)      merged += ` (${type})`;
      out[COL_MERGED] = merged;

      for (const h of rawHeaders) {
        if (COLS_IGNORE.includes(h) || mergeSources.includes(h)) continue;
        out[h] = String(row[h] ?? '').trim();
      }

      return out;
    });

    return { headers, rows };
  }

  private detectSubHeaders(): void {
    if (this.rows.length === 0) return;

    const firstRow = this.rows[0];
    const mergedVal = (firstRow[COL_MERGED] ?? '').trim();
    if (mergedVal) return;

    const periodeIdx = this.headers.indexOf('Période couverte');
    if (periodeIdx < 0) return;

    const keyRenames = new Map<string, string>();
    const periodColumnKeys: string[] = [];

    for (let i = periodeIdx; i < this.headers.length; i++) {
      const h = this.headers[i];
      const subVal = (firstRow[h] ?? '').trim();
      if (!subVal || this.isUrl(subVal)) break;
      keyRenames.set(h, subVal);
      periodColumnKeys.push(subVal);
    }

    if (periodColumnKeys.length === 0) return;

    this.headers = this.headers.map(h => keyRenames.get(h) ?? h);
    this.rows = this.rows.slice(1).map(row => {
      const out: CollectionEntry = {};
      for (const h of Object.keys(row)) {
        out[keyRenames.get(h) ?? h] = row[h];
      }
      return out;
    });
    this.periodGroup = { label: 'Période couverte', columns: periodColumnKeys };
    this.hasTwoHeaderRows = true;
  }

  isPeriodColumn(h: string): boolean {
    return !!this.periodGroup?.columns.includes(h);
  }

  isFirstPeriodColumn(h: string): boolean {
    return !!this.periodGroup && h === this.periodGroup.columns[0];
  }

  onScroll(event: Event): void {
    this.ngZone.run(() => this.checkScrollFromEl(event.target as HTMLElement));
  }

  private checkScroll(): void {
    if (this.tableWrapper?.nativeElement) {
      this.checkScrollFromEl(this.tableWrapper.nativeElement);
    }
  }

  private checkScrollFromEl(el: HTMLElement): void {
    this.canScrollLeft  = el.scrollLeft > 4;
    this.canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 4;
    this.cdRef.detectChanges();
  }

  filter(term: string): void {
    const lower = term.toLowerCase().trim();
    this.filteredRows = lower
      ? this.rows.filter(row =>
          Object.values(row).some(v => v.toLowerCase().includes(lower))
        )
      : [...this.rows];
    this.applySort();
  }

  sortBy(col: string): void {
    if (this.isUrl(this.rows.find(r => r[col])?.[col] ?? '')) return;
    this.sortDir = this.sortColumn === col && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortColumn = col;
    this.applySort();
  }

  private applySort(): void {
    if (!this.sortColumn) return;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    this.filteredRows = [...this.filteredRows].sort((a, b) =>
      (a[this.sortColumn] ?? '').localeCompare(b[this.sortColumn] ?? '', 'fr', { sensitivity: 'base' }) * dir
    );
  }

  isSortable(col: string): boolean {
    return !this.isUrl(this.rows.find(r => r[col])?.[col] ?? '');
  }

  isUrl(value: string): boolean {
    return /^https?:\/\//.test(value);
  }

  isInternalLink(colName: string): boolean {
    const norm = (s: string) => s.normalize('NFC').trim().toLowerCase();
    return COLS_INTERNAL_LINK.some(c => norm(c) === norm(colName));
  }

  isPresence(value: string): boolean {
    return PRESENCE_VALUES.has(value.toLowerCase());
  }

  isAbsent(value: string): boolean {
    return ABSENT_VALUES.has(value.toLowerCase()) || value === '';
  }
}
