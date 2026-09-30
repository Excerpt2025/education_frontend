/* ============================================================================
 *  SINGLE SOURCE OF TRUTH for course categories.
 *  Used by: Home (CollegeSpotlight), Colleges page (tabs + filters) and the
 *  admin Manage Colleges form (Programs checkboxes).
 *
 *  To add / rename a category or program later, edit ONLY this file.
 *  `keywords` are matched (whole-word) against a college's programs, linked
 *  courses and specializations.
 * ==========================================================================*/

export const COURSE_CATEGORIES = [
  {
    id: 'engineering', label: 'Engineering', emoji: '⚙️',
    programs: [
      { id: 'be', label: 'B.E.', keywords: ['b.e', 'be', 'bachelor of engineering'] },
      { id: 'btech', label: 'B.Tech', keywords: ['b.tech', 'btech', 'b tech', 'bachelor of technology'] },
      { id: 'me', label: 'M.E.', keywords: ['m.e', 'master of engineering'] },
      { id: 'mtech', label: 'M.Tech', keywords: ['m.tech', 'mtech', 'm tech', 'master of technology'] },
      { id: 'eng-diploma', label: 'Engineering Diploma', keywords: ['engineering diploma', 'diploma in engineering', 'polytechnic'] },
    ],
    extraKeywords: ['engineering'],
  },
  {
    id: 'mba', label: 'MBA & PGDM', emoji: '💼',
    programs: [
      { id: 'mba', label: 'MBA', keywords: ['mba', 'master of business administration'] },
      { id: 'emba', label: 'Executive MBA', keywords: ['executive mba', 'emba'] },
      { id: 'pgdm', label: 'PGDM', keywords: ['pgdm'] },
      { id: 'epgdm', label: 'Executive PGDM', keywords: ['executive pgdm'] },
    ],
  },
  {
    id: 'other-pg', label: 'Other PG Programs', emoji: '🎓',
    programs: [
      { id: 'mca', label: 'MCA', keywords: ['mca', 'master of computer applications'] },
      { id: 'mcom', label: 'M.Com', keywords: ['m.com', 'mcom', 'master of commerce'] },
      { id: 'msc', label: 'M.Sc', keywords: ['m.sc', 'msc', 'master of science'] },
      { id: 'ma', label: 'MA', keywords: ['m.a', 'ma', 'master of arts'] },
      { id: 'mtech-pg', label: 'M.Tech', keywords: ['m.tech', 'mtech', 'm tech'] },
      { id: 'pg-diploma', label: 'PG Diploma', keywords: ['pg diploma', 'pgd', 'post graduate diploma'] },
    ],
  },
  {
    id: 'undergraduate', label: 'Undergraduate Programs', emoji: '📚',
    programs: [
      { id: 'bba', label: 'BBA', keywords: ['bba', 'bbm', 'bachelor of business administration'] },
      { id: 'bca', label: 'BCA', keywords: ['bca', 'bachelor of computer applications'] },
      { id: 'bcom', label: 'B.Com', keywords: ['b.com', 'bcom', 'bachelor of commerce'] },
      { id: 'ba', label: 'BA', keywords: ['b.a', 'ba', 'bachelor of arts'] },
      { id: 'bsc', label: 'B.Sc', keywords: ['b.sc', 'bsc', 'bachelor of science'] },
      { id: 'bvoc', label: 'B.Voc', keywords: ['b.voc', 'bvoc'] },
    ],
  },
  {
    id: 'online', label: 'Online Degree Programs', emoji: '💻',
    programs: [
      { id: 'o-mba', label: 'Online MBA', keywords: ['online mba'] },
      { id: 'o-mca', label: 'Online MCA', keywords: ['online mca'] },
      { id: 'o-bba', label: 'Online BBA', keywords: ['online bba'] },
      { id: 'o-bca', label: 'Online BCA', keywords: ['online bca'] },
      { id: 'o-bcom', label: 'Online B.Com', keywords: ['online b.com', 'online bcom'] },
      { id: 'o-mcom', label: 'Online M.Com', keywords: ['online m.com', 'online mcom'] },
      { id: 'o-ba', label: 'Online BA', keywords: ['online ba', 'online b.a'] },
      { id: 'o-msc', label: 'Online M.Sc', keywords: ['online m.sc', 'online msc'] },
    ],
    extraKeywords: ['online'],
  },
  {
    id: 'doctorate', label: 'Doctorate Programs', emoji: '🔬',
    programs: [
      { id: 'dba', label: 'DBA', keywords: ['dba'] },
      { id: 'gdba', label: 'Global DBA', keywords: ['global dba'] },
      { id: 'edba', label: 'Executive DBA', keywords: ['executive dba'] },
      { id: 'mba-dba', label: 'MBA + DBA', keywords: ['mba + dba', 'mba+dba', 'mba dba'] },
      { id: 'ai-doc', label: 'AI & Technology Doctorate', keywords: ['ai & technology doctorate', 'ai and technology doctorate', 'technology doctorate'] },
    ],
    extraKeywords: ['doctorate', 'ph.d', 'phd'],
  },
  {
    id: 'medical', label: 'Medical & Healthcare', emoji: '🩺',
    programs: [
      { id: 'mbbs', label: 'MBBS', keywords: ['mbbs'] },
      { id: 'bds', label: 'BDS', keywords: ['bds'] },
      { id: 'nursing', label: 'Nursing', keywords: ['nursing', 'b.sc nursing', 'gnm'] },
      { id: 'pharmacy', label: 'Pharmacy', keywords: ['pharmacy', 'b.pharm', 'bpharm', 'd.pharm', 'pharm.d'] },
      { id: 'physio', label: 'Physiotherapy', keywords: ['physiotherapy', 'bpt'] },
      { id: 'allied', label: 'Allied Health', keywords: ['allied health', 'paramedical', 'optometry', 'radiology', 'lab technology'] },
    ],
  },
  {
    id: 'law', label: 'Law Programs', emoji: '⚖️',
    programs: [
      { id: 'llb', label: 'LLB', keywords: ['llb', 'll.b'] },
      { id: 'ba-llb', label: 'BA LLB', keywords: ['ba llb', 'b.a. llb', 'ba, llb'] },
      { id: 'bba-llb', label: 'BBA LLB', keywords: ['bba llb', 'bba, llb'] },
      { id: 'llm', label: 'LLM', keywords: ['llm', 'll.m'] },
    ],
    extraKeywords: ['law'],
  },
];

export function getCategory(id) {
  return COURSE_CATEGORIES.find((c) => c.id === id) || null;
}

export function getProgram(categoryId, programId) {
  return getCategory(categoryId)?.programs.find((p) => p.id === programId) || null;
}

/* Whole-word-ish match so "ba" doesn't match "Urban Planning". */
export function keywordMatches(haystack, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(haystack);
}

/* Everything we know about what a college teaches, as one lowercase string.
 * Admin-ticked `programs` come first, then linked Course docs, then the older
 * free-text specializations. */
export function courseHaystack(college) {
  const programs = (college.programs || []).join(' | ');
  const courses = (college.coursesOffered || [])
    .map((c) => (typeof c === 'string' ? c : `${c?.name || ''} ${c?.level || ''}`))
    .join(' | ');
  const specs = (college.specializations || []).join(' | ');
  return `${programs} | ${courses} | ${specs}`.toLowerCase();
}

export function matchesProgram(college, categoryId, programId) {
  const p = getProgram(categoryId, programId);
  if (!p) return true;
  const hay = courseHaystack(college);
  return p.keywords.some((k) => keywordMatches(hay, k));
}

export function matchesCategory(college, categoryId, programId = '') {
  if (!categoryId) return true;
  const cat = getCategory(categoryId);
  if (!cat) return true;
  if (programId) return matchesProgram(college, categoryId, programId);
  const hay = courseHaystack(college);
  const keywords = [...cat.programs.flatMap((p) => p.keywords), ...(cat.extraKeywords || [])];
  return keywords.some((k) => keywordMatches(hay, k));
}

/* { engineering: 12, mba: 8, ... } */
export function categoryCounts(colleges) {
  const counts = {};
  COURSE_CATEGORIES.forEach((cat) => {
    counts[cat.id] = colleges.filter((c) => matchesCategory(c, cat.id)).length;
  });
  return counts;
}

/* What to show on a card: linked courses > admin-ticked programs > specializations */
export function courseLabels(college) {
  const fromCourses = (college.coursesOffered || [])
    .map((c) => (typeof c === 'string' ? c : c?.name))
    .filter(Boolean);
  if (fromCourses.length) return fromCourses;
  if ((college.programs || []).length) return college.programs.filter(Boolean);
  return (college.specializations || []).filter(Boolean);
}