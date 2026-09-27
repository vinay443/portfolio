import { searchTextFrom, type EducationItem } from "./types";

/* ---------------------------------------------------------------------------
 * TODO(vinay): unconfirmed details.
 *
 * Every one of these is a real gap, not a placeholder: nothing below is guessed.
 * Fill any constant in and the Education block renders it with no code changes.
 *
 *   1. DEGREE_START — enrollment start, e.g. "Sep 2021". Until it is set the date
 *      gutter reads "Graduated May 2025", because a lone date sitting where the
 *      Work entries show a range reads as a range with its start missing. Set it
 *      and the gutter becomes "Sep 2021 – May 2025".
 *   2. DEGREE_CAMPUS — New Brunswick, Newark or Camden. Renders ahead of the
 *      state on the institution's second line.
 *   3. DEGREE_SCHOOL — the school within the university, e.g. "School of Arts and
 *      Sciences". Renders on the degree's subline, next to "Double major".
 *
 * Not modelled, because I do not know whether they exist: a thesis or capstone
 * title, named coursework worth listing, and any honors society or programme
 * membership beyond the awards already here. Each would earn its own field —
 * say which of them apply and they get one.
 * ------------------------------------------------------------------------ */

const DEGREE_START: string | undefined = undefined;
const DEGREE_CAMPUS: string | undefined = undefined;
const DEGREE_SCHOOL: string | undefined = undefined;

const DEGREE_END = "May 2025";

/**
 * The date gutter. Work entries show ranges, so Education shows one too; with no
 * confirmed start it degrades to a labelled end date rather than a bare one.
 */
function degreePeriod(start: string | undefined, end: string): string {
  return start ? `${start} – ${end}` : `Graduated ${end}`;
}

const degreeQualifier = "Double major";

/**
 * Credential labels, short enough to be scanned as a row of tags. Everything they
 * compress is spelled out in `degreeHonorsNote` and in `searchText`, so the short
 * form loses no fact and costs no search hit.
 */
const degreeHonors = ["Cum Laude", "Dean's List ×3", "$30,000 merit scholarship"];

const degreeHonorsNote = "Latin Honors · Dean's List: Fall 2023, Fall 2024, Spring 2025";

const degreePeriodText = degreePeriod(DEGREE_START, DEGREE_END);

/**
 * How people ask about a degree without naming it: "what did you study", "where did
 * you go to college". The block says none of these words, so without them those
 * questions matched nothing here. Index-only; nothing renders them.
 */
const degreeTerms = [
  "education",
  "educational background",
  "degree",
  "bachelor's degree",
  "undergraduate",
  "college",
  "university",
  "school",
  "study",
  "studied",
  "graduate",
  "graduated",
];

/** The same, for the certifications. */
const certificationTerms = ["certification", "certificate", "course"];

export const degree: EducationItem = {
  id: "rutgers-bs-cs-math",
  kind: "education",
  variant: "degree",
  // A conferred degree is completed work, which is what the verified hue means.
  domain: "verified",
  title: "B.S. Computer Science and Mathematics",
  qualifier: degreeQualifier,
  institution: "Rutgers University",
  campus: DEGREE_CAMPUS,
  school: DEGREE_SCHOOL,
  location: "New Jersey, USA",
  start: DEGREE_START,
  end: DEGREE_END,
  period: degreePeriodText,
  gpa: "3.52 / 4.0",
  honors: degreeHonors,
  honorsNote: degreeHonorsNote,
  searchText: searchTextFrom(
    "B.S. Computer Science and Mathematics",
    degreeQualifier,
    "Rutgers University",
    DEGREE_CAMPUS,
    DEGREE_SCHOOL,
    "New Jersey, USA",
    degreePeriodText,
    "GPA 3.52/4.0",
    degreeHonors,
    degreeHonorsNote,
    // The chip shortens "merit-based" to "merit", so the original wording is kept
    // here: the index should answer for a phrase the page no longer spells out.
    "merit-based scholarship",
    degreeTerms,
  ),
};

export const certifications: EducationItem[] = [
  {
    id: "cert-google-data-analytics",
    kind: "education",
    variant: "certification",
    title: "Google Data Analytics",
    institution: "Google",
    period: "Aug 2025",
    description: "Data cleaning, visualization, SQL, R, and dashboards.",
    searchText: searchTextFrom(
      "Google Data Analytics",
      "Google",
      "Aug 2025",
      "data cleaning visualization SQL R dashboards",
      certificationTerms,
    ),
  },
  {
    id: "cert-ml-using-python",
    kind: "education",
    variant: "certification",
    title: "Machine Learning using Python",
    institution: "Udemy",
    period: "Jun 2025",
    description: "Supervised and unsupervised machine learning with scikit-learn.",
    searchText: searchTextFrom(
      "Machine Learning using Python",
      "Udemy",
      "Jun 2025",
      "supervised unsupervised machine learning scikit-learn",
      certificationTerms,
    ),
  },
];

export const education: EducationItem[] = [degree, ...certifications];
