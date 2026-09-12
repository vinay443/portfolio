import { searchTextFrom, type EducationItem } from "./types";

const degreeHonors = [
  "$30,000 merit-based scholarship",
  "Dean's List: Fall 2023, Fall 2024, Spring 2025",
  "Latin Honors (Cum Laude)",
];

export const degree: EducationItem = {
  id: "rutgers-bs-cs-math",
  kind: "education",
  variant: "degree",
  title: "B.S. Computer Science and Mathematics",
  institution: "Rutgers University",
  location: "New Jersey, USA",
  period: "May 2025",
  gpa: "3.52 / 4.0",
  honors: degreeHonors,
  searchText: searchTextFrom(
    "B.S. Computer Science and Mathematics",
    "Rutgers University",
    "New Jersey, USA",
    "May 2025",
    "GPA 3.52/4.0",
    degreeHonors,
  ),
};

export const certifications: EducationItem[] = [
  {
    id: "cert-google-data-analytics",
    kind: "education",
    variant: "certification",
    title: "Google Data Analytics Professional Certificate",
    institution: "Coursera",
    period: "TODO: confirm completion date",
    description: "Data cleaning, visualization, SQL, R, and dashboards.",
    searchText: searchTextFrom(
      "Google Data Analytics Professional Certificate",
      "Coursera",
      "data cleaning visualization SQL R dashboards",
    ),
  },
  {
    id: "cert-ml-using-python",
    kind: "education",
    variant: "certification",
    title: "Machine Learning using Python",
    institution: "Udemy",
    period: "TODO: confirm completion date",
    description: "Supervised and unsupervised machine learning with scikit-learn.",
    searchText: searchTextFrom(
      "Machine Learning using Python",
      "Udemy",
      "supervised unsupervised machine learning scikit-learn",
    ),
  },
];

export const education: EducationItem[] = [degree, ...certifications];
