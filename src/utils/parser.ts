import * as XLSX from 'xlsx';
import { Position, PortfolioData } from '../types/portfolio';

/**
 * Nettoie et extrait un nombre à partir d'une cellule (string ou number).
 * Gère les séparateurs français (virgule), espaces insécables, devises et pourcentages.
 */
export function parseNumber(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val)
    .replace(/\s/g, '')
    .replace(/€/g, '')
    .replace(/%/g, '')
    .replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Découpe une ligne CSV en respectant les guillemets et le séparateur choisi.
 */
export function parseCSVLine(line: string, separator: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Convertit un texte CSV brut en tableau 2D (lignes et colonnes).
 * Détecte automatiquement le séparateur (virgule, point-virgule ou tabulation).
 */
export function parseCSVText(content: string): any[][] {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];

  // Détection automatique du séparateur sur les premières lignes
  const sample = lines.slice(0, 10).join('\n');
  const countSemicolon = (sample.match(/;/g) || []).length;
  const countComma = (sample.match(/,/g) || []).length;
  const countTab = (sample.match(/\t/g) || []).length;

  let separator = ',';
  if (countSemicolon > countComma && countSemicolon > countTab) separator = ';';
  else if (countTab > countComma && countTab > countSemicolon) separator = '\t';

  return lines.map(line => parseCSVLine(line, separator));
}

/**
 * Convertit un classeur Excel (ArrayBuffer) en tableau 2D de cellules.
 */
export function parseExcelBuffer(buffer: ArrayBuffer): any[][] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: true, defval: '' });
}

/**
 * Analyse un tableau 2D de cellules représentant un export de portefeuille Fortuneo
 * (depuis Excel ou CSV).
 */
export function parseFortuneoRows(
  rows: any[][],
  existingPositions?: Position[]
): PortfolioData | null {
  try {
    if (!rows || rows.length < 5) return null;

    let accountNumber = '';
    let accountName = 'Mon Portefeuille PEA';
    let asOfDate = new Date().toISOString().split('T')[0];
    let cashBalance = 0;

    // 1. Extraction des métadonnées d'en-tête (5 premières lignes)
    for (let i = 0; i < Math.min(6, rows.length); i++) {
      const row = rows[i];
      const rowStr = row.map(c => String(c)).join(' ');

      if (rowStr.includes('Portefeuille')) {
        const match = rowStr.match(/Portefeuille\s+([0-9A-Za-z]+)/i);
        if (match) accountNumber = match[1];
      }
      if (rowStr.includes('PEA') || rowStr.includes('M ')) {
        const cleaned = rowStr.replace(/,/g, '').replace(/[()]/g, '').trim();
        if (cleaned) accountName = cleaned;
      }

      // Détection de la date de situation
      for (const cell of row) {
        if (cell instanceof Date) {
          asOfDate = cell.toLocaleDateString('fr-FR');
          break;
        } else if (typeof cell === 'number' && cell > 35000 && cell < 60000) {
          // Format numéro de série Excel
          const date = new Date(Math.round((cell - 25569) * 86400 * 1000));
          asOfDate = date.toLocaleDateString('fr-FR');
          break;
        } else if (typeof cell === 'string') {
          const dateMatch = cell.match(/\b\d{2}[/-]\d{2}[/-]\d{4}\b/);
          if (dateMatch) {
            asOfDate = dateMatch[0];
            break;
          }
        }
      }
    }

    // 2. Trouver la ligne d'en-tête du tableau contenant "Libellé"
    const headerIndex = rows.findIndex(row =>
      row.some(cell => /libell[eé]/i.test(String(cell)))
    );
    if (headerIndex === -1) return null;

    // Détection dynamique des indices des colonnes
    const headerRow = rows[headerIndex].map(c => String(c).trim().toLowerCase());
    const colLabel = headerRow.findIndex(h => /libell/i.test(h));
    const colPrice = headerRow.findIndex(h => /cours/i.test(h));
    const colQty = headerRow.findIndex(h => /qt[eé]|quantit/i.test(h));
    const colPru = headerRow.findIndex(h => /pru|prix/i.test(h));
    const colValo = headerRow.findIndex(h => /valo/i.test(h));
    const colGain = headerRow.findIndex(h => (/(\+\/-|plus).*value/i.test(h)) && !h.includes('%'));
    const colGainPct = headerRow.findIndex(h => (/(\+\/-|plus).*value/i.test(h) || h.includes('%')) && h.includes('%'));
    const colWeight = headerRow.findIndex(h => /poids/i.test(h));
    const colIsin = headerRow.findIndex(h => /isin/i.test(h));
    const colDev = headerRow.findIndex(h => /dev/i.test(h));

    const positions: Position[] = [];

    // 3. Parcourir les lignes de positions
    for (let i = headerIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const label = String(row[colLabel >= 0 ? colLabel : 0] || '').trim();
      if (!label) continue;

      // ATTENTION CRITIQUE : ignorer les lignes de totaux mais NE PAS ignorer TOTALENERGIES !
      const isSummaryRow = /^total(\s|$|:|\b)/i.test(label) && !/totalenergies/i.test(label);
      if (isSummaryRow) continue;

      // Détection des liquidités ou espèces
      if (/liquidit|esp[eè]ce/i.test(label)) {
        cashBalance = parseNumber(row[colValo >= 0 ? colValo : 7]);
        continue;
      }

      const currentPrice = parseNumber(row[colPrice >= 0 ? colPrice : 1]);
      const quantity = parseNumber(row[colQty >= 0 ? colQty : 5]);
      const pru = parseNumber(row[colPru >= 0 ? colPru : 6]);
      const valuation = parseNumber(row[colValo >= 0 ? colValo : 7]) || (quantity * currentPrice);
      const unrealizedGain = parseNumber(row[colGain >= 0 ? colGain : 8]) || (valuation - (quantity * pru));
      const unrealizedGainPercent = parseNumber(row[colGainPct >= 0 ? colGainPct : 9]) || (pru > 0 ? unrealizedGain / (quantity * pru) : 0);
      const weight = parseNumber(row[colWeight >= 0 ? colWeight : 10]);
      const currency = String(row[colDev >= 0 ? colDev : 3] || 'EUR').trim() || 'EUR';

      // Détection du code ISIN (12 caractères : 2 lettres + 10 alphanumériques)
      let isin = '';
      if (colIsin >= 0 && row[colIsin]) {
        const match = String(row[colIsin]).trim().match(/^[A-Z]{2}[A-Z0-9]{10}$/);
        if (match) isin = match[0];
      }
      if (!isin) {
        for (const cell of row) {
          const match = String(cell).trim().match(/^[A-Z]{2}[A-Z0-9]{10}$/);
          if (match) {
            isin = match[0];
            break;
          }
        }
      }

      // Extraction du Ticker (symbole boursier entre parenthèses)
      const tickerMatch = label.match(/\(([A-Z0-9]+)\)/);
      const ticker = tickerMatch ? tickerMatch[1] : (isin.slice(0, 4) || 'ACT');

      // Récupération des préférences utilisateur existantes (si déjà configurées)
      const existing = existingPositions?.find(p =>
        (isin && p.isin === isin) || (ticker && p.ticker === ticker)
      );

      // Déduction du type d'actif (ETF vs Action)
      const isETF = label.toUpperCase().includes('ETF') ||
                    label.toUpperCase().includes('UCITS') ||
                    label.toUpperCase().includes('MSCI') ||
                    label.toUpperCase().includes('ISHARES') ||
                    label.toUpperCase().includes('VANGUARD') ||
                    label.toUpperCase().includes('AMUNDI');

      // Catégorisation et dividendes
      let category = existing?.category || (isETF ? 'Indice US' : 'Industrie & Aéro');
      let dividendEstimate = existing?.dividendYieldEstimate !== undefined ? existing.dividendYieldEstimate : 0;
      let purchaseYear = existing?.purchaseYear || 2024;
      let purchaseMonth = existing?.purchaseMonth || 7;

      if (!existing) {
        const upper = label.toUpperCase();
        if (upper.includes('S&P 500') || upper.includes('ESE')) {
          category = 'Indice US';
          dividendEstimate = 0;
          purchaseMonth = 7;
        } else if (upper.includes('EMERGENT') || upper.includes('PAEEM')) {
          category = 'Marchés Émergents';
          dividendEstimate = 0;
          purchaseMonth = 10;
        } else if (upper.includes('TOTAL') || upper.includes('TTE')) {
          category = 'Énergie';
          dividendEstimate = 5.8;
          purchaseMonth = 8;
        } else if (upper.includes('ORANGE') || upper.includes('ORA')) {
          category = 'Télécoms';
          dividendEstimate = 5.2;
          purchaseMonth = 7;
        } else if (upper.includes('CREDIT AGRICOLE') || upper.includes('ACA')) {
          category = 'Finance';
          dividendEstimate = 6.5;
          purchaseMonth = 8;
        } else if (upper.includes('AIRBUS') || upper.includes('AIR')) {
          category = 'Industrie & Aéro';
          dividendEstimate = 1.2;
          purchaseMonth = 9;
        } else if (upper.includes('WORLD') || upper.includes('WPEA') || upper.includes('CW8')) {
          category = 'Indice Monde';
          dividendEstimate = 0;
          purchaseMonth = 7;
        } else if (upper.includes('AIR LIQUIDE') || upper.includes('AI')) {
          category = 'Industrie & Aéro';
          dividendEstimate = 2.2;
        } else if (upper.includes('SCHNEIDER') || upper.includes('SU')) {
          category = 'Industrie & Aéro';
          dividendEstimate = 2.0;
        } else if (upper.includes('LVMH') || upper.includes('MC') || upper.includes('HERMES')) {
          category = 'Luxe & Conso';
          dividendEstimate = 1.5;
        } else if (upper.includes('SANOFI') || upper.includes('SAN')) {
          category = 'Santé';
          dividendEstimate = 4.0;
        } else if (isETF) {
          category = 'Indice US';
          dividendEstimate = 0;
        } else {
          category = 'Industrie & Aéro';
          dividendEstimate = 2.0;
        }
      }

      positions.push({
        id: `pos-${i}-${ticker}`,
        label,
        ticker,
        isin,
        quantity,
        pru,
        currentPrice,
        valuation,
        unrealizedGain,
        unrealizedGainPercent,
        weight,
        currency,
        assetType: isETF ? 'ETF' : 'Action',
        category,
        purchaseYear,
        purchaseMonth,
        dividendYieldEstimate: dividendEstimate
      });
    }

    if (positions.length === 0) return null;

    return {
      accountName,
      accountNumber,
      asOfDate,
      startDate: '2024-07',
      cashBalance,
      positions
    };
  } catch (err) {
    console.error('Erreur lors de la lecture du portefeuille Fortuneo:', err);
    return null;
  }
}

/**
 * Analyse une chaîne de caractères CSV Fortuneo.
 */
export function parseFortuneoCSV(
  content: string,
  existingPositions?: Position[]
): PortfolioData | null {
  const rows = parseCSVText(content);
  return parseFortuneoRows(rows, existingPositions);
}

/**
 * Analyse un classeur Excel (.xlsx, .xls) Fortuneo depuis un buffer binaire.
 */
export function parseFortuneoExcel(
  buffer: ArrayBuffer,
  existingPositions?: Position[]
): PortfolioData | null {
  const rows = parseExcelBuffer(buffer);
  return parseFortuneoRows(rows, existingPositions);
}

/**
 * Fonction universelle d'import : gère à la fois les fichiers Excel (.xlsx, .xls)
 * et les fichiers texte (.csv, .txt) avec détection automatique de l'encodage (UTF-8 ou ISO-8859-1).
 */
export async function parseFortuneoFile(
  file: File,
  existingPositions?: Position[]
): Promise<PortfolioData | null> {
  const isExcel = /\.(xlsx|xls)$/i.test(file.name);

  if (isExcel) {
    const buffer = await file.arrayBuffer();
    return parseFortuneoExcel(buffer, existingPositions);
  }

  // Fichier CSV / texte
  const buffer = await file.arrayBuffer();
  // Tester d'abord UTF-8, basculer sur windows-1252 (ISO) si caractères corrompus
  let text = new TextDecoder('utf-8').decode(buffer);
  if (text.includes('\uFFFD')) {
    text = new TextDecoder('windows-1252').decode(buffer);
  }

  return parseFortuneoCSV(text, existingPositions);
}
