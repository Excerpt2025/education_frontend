export const BLOG_POSTS = [
  {
    slug: 'how-to-read-kcet-cutoffs',
    title: 'How to read KCET cutoffs before you apply',
    excerpt: 'Safe, moderate and dream colleges — what those bands mean for a realistic option list.',
    category: 'KCET',
    author: 'Rajeev M P',
    date: '2026-07-14',
    image: '/images/hero-2-desktop.webp',
    body: [
      'KCET cutoffs are a map, not a promise. Last year’s closing rank for a course tells you where students actually landed, not where you are guaranteed a seat this year.',
      'Start by grouping options into safe, moderate and dream bands using your rank, category and preferred cities. A safe college should still be one you would attend. Dream options belong on the list only if you can absorb the wait.',
      'Refresh the list after every mock allotment. Fees, commute and course fit matter as much as the rank number on the sheet.',
    ],
  },
  {
    slug: 'when-career-assessment-helps',
    title: 'When a career assessment is worth doing',
    excerpt: 'Use aptitude and interest results as a filter, not as a final college name.',
    category: 'Assessment',
    author: 'Rakshith Kumar',
    date: '2026-06-28',
    image: '/images/hero-1-desktop.webp',
    body: [
      'An assessment is useful when you have too many course names and no way to rank them. It is less useful when you already know the field and only need cutoff data.',
      'Read aptitude and interest together. A high score in one stream with low interest often leads to a first-year drop. Treat the report as a shortlist of 3–5 directions, then check KCET or PGCET seats in those directions.',
      'Bring the report to counselling. The value is the conversation after the scores, not the PDF itself.',
    ],
  },
  {
    slug: 'pgcet-then-campus-visits',
    title: 'PGCET vs campus visits: a simple sequence',
    excerpt: 'Rank, category and course first — then compare fees and commute before you lock a choice.',
    category: 'PGCET',
    author: 'Raghavendra M',
    date: '2026-06-11',
    image: '/images/hero-3-desktop.webp',
    body: [
      'For postgraduate counselling, rank and category decide the feasible set. Visiting campuses before that set exists wastes travel and creates false favourites.',
      'Run a predictor, freeze 8–12 realistic programmes, then visit or call only those. Ask about lab load, internship support and fee timelines — not just the brochure ranking.',
      'If two programmes look equal on paper, commute and stipend patterns usually break the tie.',
    ],
  },
  {
    slug: 'building-a-college-compare-sheet',
    title: 'Build a college compare sheet that actually helps',
    excerpt: 'Fees, courses and rankings side by side — plus the columns families usually forget.',
    category: 'Admissions',
    author: 'Rajeev M P',
    date: '2026-05-22',
    image: '/images/student-to-professional.png',
    body: [
      'A compare sheet should answer one question: which campus can this student join and stay on without strain. Rankings alone do not answer that.',
      'Keep columns for total first-year fees, hostel, travel time, course availability in your category, and a simple yes/no for counselling support.',
      'Update the sheet after each counselling round. Retired options should leave the table so the remaining five stay visible.',
    ],
  },
  {
    slug: 'what-priority-support-changes',
    title: 'What counsellor support actually changes in counselling week',
    excerpt: 'Priority help is most useful when option-entry windows are short and family opinions conflict.',
    category: 'Guidance',
    author: 'Rakshith Kumar',
    date: '2026-05-03',
    image: '/images/hero-fallback-desktop.webp',
    body: [
      'Counselling week is noisy. Relatives, WhatsApp forwards and last year’s closing ranks all arrive at once. A counsellor’s job is to keep the option list consistent with rank and preference, not to add more colleges.',
      'Come with your assessment summary, a first draft of options, and the constraints you will not break — city, budget, or a must-have course.',
      'The session should end with a written order of choices you can paste into the portal, not a longer debate.',
    ],
  },
  {
    slug: 'kcet-mock-allotment-checklist',
    title: 'A KCET mock allotment checklist for parents',
    excerpt: 'What to verify after a mock round so the real option entry does not surprise you.',
    category: 'KCET',
    author: 'Raghavendra M',
    date: '2026-04-18',
    image: '/images/hero-2-mobile.webp',
    body: [
      'A mock allotment is a rehearsal. Treat a disappointing mock as information, not as a final result.',
      'Check whether the allotted course was high on your list or a leftover. If leftovers keep appearing, your safe band is too thin.',
      'Confirm documents, category claims and fee readiness before the real round. Rank strategy fails when paperwork is late.',
    ],
  },
];

export function getBlogCategories(posts = BLOG_POSTS) {
  return [...new Set(posts.map((post) => post.category))];
}

export function getBlogPost(slug) {
  return BLOG_POSTS.find((post) => post.slug === slug) || null;
}

export function filterBlogPosts(posts, { query = '', category = 'All' } = {}) {
  const needle = query.trim().toLowerCase();
  return posts.filter((post) => {
    const inCategory = category === 'All' || post.category === category;
    if (!inCategory) return false;
    if (!needle) return true;
    return [post.title, post.excerpt, post.category, post.author]
      .join(' ')
      .toLowerCase()
      .includes(needle);
  });
}

export function formatBlogDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
