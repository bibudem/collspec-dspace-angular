import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';

const COL_NOM       = 'Nom';
const COL_PRECISION = 'Précision';
const COL_TYPE      = 'Type';
const COL_MERGED    = 'Fonds / Collection';
const COL_PERIOD    = 'Périodique couvert';
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
export class PageFondsComponent implements OnInit {
  headers: string[] = [];
  rows: CollectionEntry[] = [];
  filteredRows: CollectionEntry[] = [];
  loading = true;
  error = false;
  sortColumn = '';
  sortDir: 'asc' | 'desc' = 'asc';
  allPeriods: string[] = [];
  selectedPeriod: string | null = null;
  private searchTerm = '';

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadExcel();
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

    // Renomme les clés de colonnes de période dans les lignes et supprime la ligne sous-en-tête
    this.rows = this.rows.slice(1).map(row => {
      const out: CollectionEntry = {};
      for (const h of Object.keys(row)) {
        out[keyRenames.get(h) ?? h] = row[h];
      }
      return out;
    });

    // Remplace les N colonnes de période par une seule colonne COL_PERIOD
    // insérée à la même position qu'occupait "Période couverte" dans l'Excel
    const renamedHeaders = this.headers.map(h => keyRenames.get(h) ?? h);
    const nonPeriodHeaders = renamedHeaders.filter(h => !periodColumnKeys.includes(h));
    this.headers = [
      ...nonPeriodHeaders.slice(0, periodeIdx),
      COL_PERIOD,
      ...nonPeriodHeaders.slice(periodeIdx),
    ];

    this.allPeriods = periodColumnKeys;
  }

  getActivePeriods(row: CollectionEntry): string[] {
    return this.allPeriods.filter(p => this.isPresence(row[p] ?? ''));
  }

  isPeriodCol(col: string): boolean {
    return col === COL_PERIOD;
  }

  setPeriodFilter(period: string): void {
    this.selectedPeriod = period || null;
    this.applyFilters();
  }

  filter(term: string): void {
    this.searchTerm = term.toLowerCase().trim();
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = this.rows;
    if (this.searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(v => v.toLowerCase().includes(this.searchTerm))
      );
    }
    if (this.selectedPeriod) {
      const p = this.selectedPeriod;
      result = result.filter(row => this.isPresence(row[p] ?? ''));
    }
    this.filteredRows = [...result];
    this.applySort();
  }

  sortBy(col: string): void {
    if (!this.isSortable(col)) return;
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
    if (col === COL_PERIOD) return false;
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
