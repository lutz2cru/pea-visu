# PEA Visualiseur

Application web locale pour suivre un PEA à partir de l'export de portefeuille Fortuneo (.xlsx, .xls ou .csv) et projeter son évolution à long terme.

Toutes les données restent dans le navigateur (stockage local) : rien n'est envoyé à un serveur. Tant qu'aucun export n'a été importé, l'application affiche un **portefeuille d'exemple**.

> Outil d'information et de visualisation : ce n'est pas un conseil en investissement.

---

## Lancement

```bash
npm install
npm run dev
```

L'application s'ouvre sur http://localhost:3000/.
Sous Windows : double-clic sur `start.bat`, ou `Ctrl + Shift + B` dans VS Code.

---

## Fonctionnalités

L'application est organisée en 5 onglets (en haut sur ordinateur, en bas de l'écran sur téléphone). Les termes techniques ont une bulle d'aide **?** qui les explique en langage courant.

### Vue d'ensemble
- **Combien j'ai ?** : valeur du PEA, gain depuis le début, rendement moyen par an (estimé à partir de la date d'achat de chaque ligne), dividendes nets estimés, date des 5 ans fiscaux et plafond utilisé.
- **Est-ce que je fais mieux qu'un simple ETF ?** : ce que vaudraient les mêmes montants, placés aux mêmes dates sur un ETF MSCI World ou S&P 500. Un contrôle signale les dates d'achat incohérentes avec ton prix moyen, qui rendraient la comparaison peu fiable.
- **Points d'attention** : constats chiffrés (action qui pèse plus de 20 % du PEA, secteur ou zone dominants, lignes en baisse de plus de 10 %, espèces non investies, 5 ans fiscaux proches). Ce ne sont pas des recommandations.
- **Comment vont mes lignes ? / Comment c'est réparti ?** : gain ou perte de chaque ligne (en % ou en €) et poids de chaque ligne.
- **Que faire ce mois-ci ?** : les parts à acheter avec ton prochain versement.

### Mes lignes
Détail de chaque ligne : poids, quantité, PRU, cours, valeur, gain, rendement par an. Le **rendement du dividende** et la **date d'achat** (date moyenne si achats en plusieurs fois) sont modifiables : ils alimentent les estimations.
**Où est investi mon argent ?** : répartition par zone géographique (les ETF selon leur indice, les actions selon le pays de la société) et par secteur.

### Dividendes
Montant annuel estimé (brut, retenue à la source étrangère non récupérable dans le PEA, net), calendrier des 12 prochains mois d'après les mois de versement habituels, détail ligne par ligne, et une explication du fonctionnement des dividendes dans un PEA (où arrive l'argent, comment en profiter, date de détachement, sociétés étrangères).

### Prochain versement
En trois étapes : le montant, la répartition visée (70 % ETF / 30 % actions, 100 % ETF, priorité dividendes ou ta propre cible ligne par ligne), puis les parts entières à acheter pour t'en rapprocher sans rien vendre. Rappel mensuel téléchargeable pour ton agenda (.ics).

### Projections
- Simulation des intérêts composés sur 10, 20 ou 30 ans (versement mensuel, rendement espéré, inflation).
- Valeur après prélèvements sociaux, revenu mensuel possible (règle des 4 %).
- Comparaison avec le Livret A, calcul de l'effort d'épargne pour atteindre un objectif.

### Paramètres
- **Date du premier versement** sur le PEA : elle fait courir le délai fiscal de 5 ans et sert de date d'achat par défaut pour les nouvelles lignes importées.
- **Effacer mes données** : revient au portefeuille d'exemple.

---

## Taux réglementaires

Les taux utilisés sont centralisés dans [`src/config/fiscal.ts`](src/config/fiscal.ts) :

| Paramètre | Valeur | En vigueur depuis |
|---|---|---|
| Prélèvements sociaux sur les gains du PEA | 18,6 % | janvier 2026 |
| Flat tax en cas de retrait avant 5 ans | 31,4 % | janvier 2026 |
| Taux du Livret A | 1,7 % | août 2026 |
| Plafond des versements PEA | 150 000 € | — |

Pense à les mettre à jour à chaque changement de loi de finances ou de taux du Livret A.

---

## Cours des ETF de référence

La comparaison avec un ETF utilise l'historique quotidien (10 ans) de l'Amundi MSCI World (CW8) et du BNP Paribas Easy S&P 500 (ESE), récupéré sur Yahoo Finance par [`scripts/fetch-benchmarks.mjs`](scripts/fetch-benchmarks.mjs) et enregistré dans `public/data/benchmarks.json`.

- Le script tourne automatiquement avant chaque build (`npm run build`), donc à chaque déploiement.
- Pour rafraîchir à la main : `npm run data`.
- En cas d'échec réseau, la version précédente du fichier est conservée : le build ne casse jamais.

Les mois de versement des dividendes et les retenues à la source étrangères sont dans [`src/data/securities.ts`](src/data/securities.ts) (valeurs indicatives, à vérifier chaque année).
