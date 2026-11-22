/**
 * Paramètres réglementaires et fiscaux, centralisés ici pour être mis à jour en un seul endroit.
 * Vérifier ces valeurs à chaque changement de loi de finances / révision du taux du Livret A.
 */

/** Prélèvements sociaux sur les gains du PEA (CSG 10,6 % + CRDS + prélèvement de solidarité), en %. */
export const PEA_SOCIAL_TAX_RATE = 18.6;
export const PEA_SOCIAL_TAX_SINCE = 'janvier 2026';

/** Flat tax (PFU) applicable aux gains en cas de retrait avant 5 ans (12,8 % IR + 18,6 % PS), en %. */
export const PEA_EARLY_WITHDRAWAL_TAX_RATE = 31.4;

/** Plafond des versements sur un PEA classique, en €. */
export const PEA_DEPOSIT_CEILING = 150_000;

/** Ancienneté (en années) à partir de laquelle les gains du PEA sont exonérés d'impôt sur le revenu. */
export const PEA_TAX_FREE_YEARS = 5;

/** Taux du Livret A (net d'impôt), en %. */
export const LIVRET_A_RATE = 1.7;
export const LIVRET_A_SINCE = 'août 2026';
