# PEA Visualiseur & Simulateur Patrimonial (Fortuneo)

Application locale, moderne et 100% privée d'analyse de rendement et de projection patrimoniale à long terme pour le PEA de **Matthias Lutz** (Fortuneo).

---

## 🚀 Accès & Lancement

L'application est active et accessible dans votre navigateur :
👉 **[http://localhost:3000/](http://localhost:3000/)** (ou **[http://localhost:3001/](http://localhost:3001/)**)

Pour la relancer depuis **VS Code** à tout moment :
- Ouvrez le terminal (`Ctrl + ~`) et tapez : `npm.cmd run dev`
- Ou appuyez sur **`Ctrl + Shift + B`** (raccourci automatique configuré)
- Ou double-cliquez sur `start.bat` depuis l'explorateur Windows.

---

## 🌟 Les Deux Modules Principaux

### 1. 📊 Tableau de Bord & Historique (2024-2026)
- **Métriques clés réelles** :
  - Capital investi (PRU historique) : **2 082,15 €**
  - Valorisation actuelle : **2 453,80 €**
  - Plus-value latente brute : **+371,65 € (+17,85 %)**
  - Rendement annualisé (CAGR) : **+7,55 % / an** (depuis Juillet 2024)
  - Dividendes perçus estimés : **~92 €** (Total Return avec dividendes : **+22,27 %**)
- **Découpage annuel (2024 S2, 2025, 2026 YTD)** : Bar chart interactif avec comparaison **S&P 500**, **MSCI World** et **CAC 40**.
- **Courbe d'enrichissement temporel** : Évolution mois par mois du capital vs valorisation.
- **Répartition & Diversification (Donut)** : 39,4 % en ETF vs 60,6 % en actions directes.
- **Tableau détaillé des 6 lignes** : PRU, cours, +/- values, dividendes estimés et année d'acquisition.

### 2. 🚀 Projections & Simulations Long Terme (10, 20, 30 ans)
- **Cartes Jalons avec années calendaires précises** :
  - **Dans 10 ans (Année 2036)**
  - **Dans 20 ans (Année 2046)**
  - **Dans 30 ans (Année 2056)**
- **Paramètres interactifs réglables** :
  - Capital initial (défini sur la valorisation actuelle ou personnalisable).
  - Versement mensuel programmé (**DCA** de 0 € à 1 500 €/mois, avec boutons rapides 100€, 200€, 300€, 500€...).
  - Rendement annuel espéré (de 3 % à 12 %, avec préréglages réalistes : 4% Prudent, 7.55% Votre PEA actuel, 8.5% MSCI World, 10% S&P 500).
  - Horizon temporel (10, 20, 30 ans).
  - Curseur d'ajustement à l'inflation (pouvoir d'achat réel en euros constants).
- **Courbe des Intérêts Composés** :
  - Mode **Versé vs Gains** : met en évidence l'effet boule de neige exponentiel où les gains dépassent le capital injecté.
  - Mode **3 Scénarios** : Prudent (-2%), Réaliste, et Optimiste (+2%).
- **Tableau des Jalons Clés** :
  - 5 ans (2031), 10 ans (2036), 15 ans (2041), 20 ans (2046), 25 ans (2051), 30 ans (2056).
  - Montant versé, Gains générés, Valeur totale brute, **Net après fiscalité PEA (17,2% de prélèvements sociaux)**, et **Rente mensuelle passive (règle des 4%)**.
- **Calculateur Inversé d'Objectif** :
  - Définissez une cible (ex: 100 000 €, 250 000 €, 500 000 €) et une année cible pour connaître l'effort d'épargne mensuel nécessaire.
