// Shared KEA category labels + grouping for KCET and PGCET predictors.
// Codes match the real KEA cutoff PDF: <category><G|K|R> where G = General, K = Kannada Medium, R = Rural.
const suffix = { G: 'General', K: 'Kannada Medium', R: 'Rural' };
const base = { '1': 'Category 1', '2A': 'Category 2A', '2B': 'Category 2B', '3A': 'Category 3A', '3B': 'Category 3B', SC: 'SC', ST: 'ST' };

export const CATEGORY_LABELS = {};
Object.keys(base).forEach((b) => {
  Object.entries(suffix).forEach(([s, label]) => { CATEGORY_LABELS[`${b}${s}`] = `${b}${s} — ${base[b]} (${label})`; });
});
Object.assign(CATEGORY_LABELS, {
  GM: 'GM — General Merit', GMK: 'GMK — General Merit (Kannada Medium)', GMR: 'GMR — General Merit (Rural)', GMP: 'GMP — General Merit (PH)',
  NRI: 'NRI', OPN: 'OPN — Persons with Disability', OTH: 'OTH — Other',
  // older SC sub-category codes some KEA files use
  S1G: 'S1G — SC (SCA) General', S1K: 'S1K — SC (SCA) Kannada Medium', S1R: 'S1R — SC (SCA) Rural',
  S2G: 'S2G — SC (SCB) General', S2K: 'S2K — SC (SCB) Kannada Medium', S2R: 'S2R — SC (SCB) Rural',
  S3G: 'S3G — SC (SCC 80%) General', S3K: 'S3K — SC (SCC 80%) Kannada Medium', S3R: 'S3R — SC (SCC 80%) Rural',
  S4G: 'S4G — SC (SCC 20%) General', S4K: 'S4K — SC (SCC 20%) Kannada Medium', S4R: 'S4R — SC (SCC 20%) Rural',
});

const GROUP_ORDER = ['GM', '1', '2A', '2B', '3A', '3B', 'SC', 'ST', 'Other'];
const GROUP_LABELS = { GM: 'General Merit', 1: 'Category 1', '2A': 'Category 2A', '2B': 'Category 2B', '3A': 'Category 3A', '3B': 'Category 3B', SC: 'SC', ST: 'ST', Other: 'Other / Special' };

function groupOf(code) {
  if (code.startsWith('GM')) return 'GM';
  if (code.startsWith('1')) return '1';
  if (code.startsWith('2A')) return '2A';
  if (code.startsWith('2B')) return '2B';
  if (code.startsWith('3A')) return '3A';
  if (code.startsWith('3B')) return '3B';
  if (code.startsWith('SC') || /^S\d/.test(code)) return 'SC';
  if (code.startsWith('ST')) return 'ST';
  return 'Other';
}

export function groupCategories(categories = []) {
  const groups = {};
  categories.forEach((code) => { (groups[groupOf(code)] = groups[groupOf(code)] || []).push(code); });
  return GROUP_ORDER.filter((g) => groups[g]?.length).map((g) => ({ group: GROUP_LABELS[g], options: groups[g].sort() }));
}