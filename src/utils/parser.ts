import { Position, PortfolioData } from '../types/portfolio';

export function parseFortuneoCSV(content: string): PortfolioData | null {
  try {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 5) return null;

    let accountNumber = '';
    let accountName = 'Mon Portefeuille PEA';
    let asOfDate = new Date().toISOString().split('T')[0];

    // Extraction métadonnées en-tête
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.includes('Portefeuille')) {
        const match = line.match(/Portefeuille\s+([0-9A-Za-z]+)/);
        if (match) accountNumber = match[1];
      }
      if (line.includes('PEA') || line.includes('M ')) {
        const cleaned = line.replace(/,/g, '').replace(/[()]/g, '').trim();
        if (cleaned) accountName = cleaned;
      }
      if (line.match(/\d{2}\/\d{2}\/\d{4}/)) {
        const match = line.match(/\d{2}\/\d{2}\/\d{4}/);
        if (match) asOfDate = match[0];
      }
    }

    // Trouver la ligne d'en-tête contenant "Libellé"
    const headerIndex = lines.findIndex(l => l.toLowerCase().includes('libellé') || l.toLowerCase().includes('libelle'));
    if (headerIndex === -1) return null;

    const positions: Position[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      // Ignorer les totaux ou lignes vides
      if (line.toLowerCase().includes('total') || line.replace(/,/g, '').trim() === '') continue;

      // Parsing CSV (gestion des séparateurs virgule ou point-virgule)
      const separator = line.includes(';') ? ';' : ',';
      const parts = line.split(separator).map(s => s.trim());

      if (parts.length < 8) continue;

      const label = parts[0];
      if (!label || label.toLowerCase().includes('liquidit')) continue;

      const currentPrice = parseFloat(parts[1]?.replace(',', '.')) || 0;
      // Devise souvent en colonne 3 ou 4
      const currency = parts.find(p => p === 'EUR' || p === 'USD') || 'EUR';
      
      // Trouver la quantité, le PRU, la valorisation
      // Structure standard Fortuneo :
      // Libellé, Cours, [vide], Dev, Var/Veille, Qté, PRU, Valorisation, +/- values, +/- values (%), Poids, ISIN
      let quantity = 0;
      let pru = 0;
      let valuation = 0;
      let unrealizedGain = 0;
      let unrealizedGainPercent = 0;
      let weight = 0;
      let isin = '';

      // Tenter d'extraire l'ISIN (12 caractères, 2 lettres + 10 alphanum)
      const isinMatch = parts.find(p => /^[A-Z]{2}[A-Z0-9]{10}$/.test(p));
      if (isinMatch) isin = isinMatch;

      // Parse numérique
      // En partant de la structure connue :
      // col 5 = Qté, col 6 = PRU, col 7 = Valo, col 8 = +/- value, col 9 = +/- value %, col 10 = Poids
      quantity = parseFloat(parts[5]?.replace(',', '.')) || 0;
      pru = parseFloat(parts[6]?.replace(',', '.')) || 0;
      valuation = parseFloat(parts[7]?.replace(',', '.')) || (quantity * currentPrice);
      unrealizedGain = parseFloat(parts[8]?.replace(',', '.')) || (valuation - (quantity * pru));
      unrealizedGainPercent = parseFloat(parts[9]?.replace(',', '.')) || (pru > 0 ? unrealizedGain / (quantity * pru) : 0);
      weight = parseFloat(parts[10]?.replace(',', '.')) || 0;

      // Déduction du type d'actif et catégorie
      const isETF = label.toUpperCase().includes('ETF') || label.toUpperCase().includes('UCITS') || label.toUpperCase().includes('MSCI');
      let category: Position['category'] = 'Industrie & Aéro';
      let dividendEstimate = 0;

      if (label.toUpperCase().includes('S&P 500') || label.toUpperCase().includes('ESE')) {
        category = 'Indice US';
        dividendEstimate = 0;
      } else if (label.toUpperCase().includes('EMERGENT') || label.toUpperCase().includes('PAEEM')) {
        category = 'Marchés Émergents';
        dividendEstimate = 0;
      } else if (label.toUpperCase().includes('TOTAL') || label.toUpperCase().includes('TTE')) {
        category = 'Énergie';
        dividendEstimate = 5.8;
      } else if (label.toUpperCase().includes('ORANGE') || label.toUpperCase().includes('ORA')) {
        category = 'Télécoms';
        dividendEstimate = 5.2;
      } else if (label.toUpperCase().includes('CREDIT AGRICOLE') || label.toUpperCase().includes('ACA')) {
        category = 'Finance';
        dividendEstimate = 6.5;
      } else if (label.toUpperCase().includes('AIRBUS') || label.toUpperCase().includes('AIR')) {
        category = 'Industrie & Aéro';
        dividendEstimate = 1.2;
      }

      // Ticker simple
      const tickerMatch = label.match(/\(([A-Z0-9]+)\)/);
      const ticker = tickerMatch ? tickerMatch[1] : (isin.slice(0, 4) || 'ACT');

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
        purchaseYear: 2024,
        purchaseMonth: 7,
        dividendYieldEstimate: dividendEstimate
      });
    }

    if (positions.length === 0) return null;

    return {
      accountName,
      accountNumber,
      asOfDate,
      startDate: '2024-07',
      cashBalance: 0,
      positions
    };
  } catch (err) {
    console.error('Erreur parsing CSV Fortuneo:', err);
    return null;
  }
}
