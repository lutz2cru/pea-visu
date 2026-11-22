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

### Mon portefeuille
- **Chiffres clés** : valeur totale, plus-value latente, rendement annualisé, dividendes estimés, montant investi par rapport au plafond de 150 000 €.
- **Rendement annualisé** : taux de rendement interne calculé à partir de la date du premier achat de chaque ligne (modifiable dans le tableau). C'est une estimation tant que l'historique complet des opérations n'est pas importé.
- **Performance de chaque ligne** : plus ou moins-value en % ou en €, avec le rendement annualisé au survol.
- **Répartition** : poids de chaque ligne et part ETF / actions.
- **Où placer mon prochain versement ?** : choisis une répartition cible (70 % ETF / 30 % actions, 100 % ETF, priorité dividendes ou ta propre cible ligne par ligne) et l'outil calcule les parts entières à acheter pour t'en rapprocher sans rien vendre. Rappel mensuel téléchargeable (.ics).
- **Détail des lignes** : PRU, cours, plus-value, rendement annualisé, dividende estimé (rendement modifiable) et date du premier achat.

### Projections
- Simulation des intérêts composés sur 10, 20 ou 30 ans (versement mensuel, rendement espéré, inflation).
- Valeur nette après prélèvements sociaux, rente estimée (règle des 4 %).
- Comparaison avec le Livret A, calculateur d'effort d'épargne pour atteindre un objectif.

### Paramètres
- **Date du premier versement** sur le PEA : elle fait courir le délai fiscal de 5 ans et sert de date d'achat par défaut pour les nouvelles lignes importées.

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
