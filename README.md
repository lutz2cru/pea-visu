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

L'application est organisée en 4 onglets (en haut sur ordinateur, en bas de l'écran sur téléphone). Les termes techniques ont une bulle d'aide **?** qui les explique en langage courant.

### Vue d'ensemble
La page d'accueil répond à trois questions :
- **Combien j'ai ?** : valeur du PEA, gain depuis le début, rendement moyen par an (estimé à partir de la date du premier achat de chaque ligne), dividendes estimés, date des 5 ans fiscaux et plafond utilisé.
- **Comment vont mes lignes ? / Comment c'est réparti ?** : gain ou perte de chaque ligne (en % ou en €) et poids de chaque ligne, avec la part ETF / actions.
- **Que faire ce mois-ci ?** : les parts à acheter avec ton prochain versement.

### Mes lignes
Détail de chaque ligne : poids, quantité, PRU, cours, valeur, gain, rendement par an. Le **rendement du dividende** et la **date du premier achat** sont modifiables : ils alimentent les estimations.

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
