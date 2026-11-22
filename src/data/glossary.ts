import {
  LIVRET_A_RATE,
  PEA_DEPOSIT_CEILING,
  PEA_EARLY_WITHDRAWAL_TAX_RATE,
  PEA_SOCIAL_TAX_RATE,
  PEA_TAX_FREE_YEARS
} from '../config/fiscal';

const pct = (v: number) => `${v.toLocaleString('fr-FR')} %`;
const eur = (v: number) => `${v.toLocaleString('fr-FR')} €`;

/** Définitions en langage courant des termes affichés dans l'app (bulles d'aide « ? »). */
export const GLOSSARY = {
  valeur: {
    title: 'Valeur du PEA',
    text: "Ce que vaudraient toutes tes lignes si tu les vendais au cours du jour de l'export, plus l'argent non investi (espèces)."
  },
  plusValue: {
    title: 'Gain (plus-value latente)',
    text: "Valeur actuelle moins ce que tu as payé. « Latente » parce que ce gain n'est encaissé que si tu vends."
  },
  rendementAnnuel: {
    title: 'Rendement moyen par an',
    text: "Ce que ton argent a rapporté en moyenne chaque année, en tenant compte de la date d'achat de chaque ligne. Pratique pour comparer avec un livret (Livret A : " + pct(LIVRET_A_RATE) + ' par an). Les performances passées ne préjugent pas des performances futures.'
  },
  dividende: {
    title: 'Dividende',
    text: "Part des bénéfices qu'une entreprise reverse à ses actionnaires. Dans un PEA, il arrive sur le compte espèces du PEA, sans impôt tant qu'il reste dans le PEA. Le montant affiché est une estimation à partir du rendement indiqué pour chaque ligne."
  },
  etf: {
    title: 'ETF (tracker)',
    text: "Fonds coté en bourse qui copie un indice : une seule part donne accès à des centaines d'entreprises. C'est diversifié et peu coûteux."
  },
  etfCapitalisant: {
    title: 'ETF capitalisant',
    text: "Il ne te verse pas de dividendes : il les réinvestit automatiquement, ce qui fait monter le prix de la part."
  },
  pru: {
    title: 'PRU (prix de revient unitaire)',
    text: "Prix moyen payé pour une part, frais d'achat généralement inclus. Si tu as acheté en plusieurs fois, c'est la moyenne de tes achats."
  },
  dateAchat: {
    title: "Date d'achat",
    text: "Date à laquelle tu as acheté cette ligne. Si tu l'as achetée en plusieurs fois, indique une date moyenne (pondérée par les montants). Elle sert au rendement par an et à la comparaison avec un ETF : plus elle est juste, plus ces chiffres sont fiables."
  },
  poids: {
    title: 'Poids',
    text: 'Part que représente une ligne dans la valeur totale de ton PEA.'
  },
  cinqAns: {
    title: `Les ${PEA_TAX_FREE_YEARS} ans du PEA`,
    text: `Le délai part du premier versement. Après ${PEA_TAX_FREE_YEARS} ans, tu peux retirer sans clôturer le plan et les gains ne paient que ${pct(PEA_SOCIAL_TAX_RATE)} de prélèvements sociaux. Avant, un retrait clôture le PEA et les gains supportent ${pct(PEA_EARLY_WITHDRAWAL_TAX_RATE)}.`
  },
  plafond: {
    title: 'Plafond du PEA',
    text: `Tu peux verser au maximum ${eur(PEA_DEPOSIT_CEILING)} sur un PEA. Les gains, eux, ne sont pas plafonnés.`
  },
  prelevementsSociaux: {
    title: 'Prélèvements sociaux',
    text: `Impôt de ${pct(PEA_SOCIAL_TAX_RATE)} prélevé sur les gains (pas sur ce que tu as versé) quand tu retires de l'argent du PEA après ${PEA_TAX_FREE_YEARS} ans.`
  },
  reequilibrage: {
    title: 'Rééquilibrer sans vendre',
    text: "Tu choisis la part que chaque ligne devrait représenter. Plutôt que de vendre ce qui a trop monté, on oriente les nouveaux versements vers les lignes en dessous de leur cible."
  },
  versementMensuel: {
    title: 'Versement mensuel',
    text: "Investir la même somme chaque mois, quel que soit le cours (on parle aussi de DCA). Le prix d'achat moyen se lisse dans le temps et on évite de chercher « le bon moment »."
  },
  interetsComposes: {
    title: 'Intérêts composés',
    text: "Les gains d'une année produisent à leur tour des gains les années suivantes : c'est l'effet « boule de neige », d'autant plus fort que la durée est longue."
  },
  rendementHypothese: {
    title: 'Rendement espéré',
    text: "Hypothèse de rendement moyen annuel, pas une promesse : les marchés actions varient fortement d'une année à l'autre et peuvent baisser plusieurs années de suite."
  },
  inflation: {
    title: "Pouvoir d'achat réel",
    text: "Avec l'inflation, 1 000 € dans 20 ans achèteront moins qu'aujourd'hui. Cette option convertit les montants futurs en euros d'aujourd'hui."
  },
  regle4: {
    title: 'Revenu mensuel possible',
    text: "Estimé avec la « règle des 4 % » : retirer 4 % du capital par an, une hypothèse courante pour le faire durer longtemps. Ce n'est pas une garantie."
  }
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
