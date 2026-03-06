export const QUESTION_TYPES = [
  { value: "multiple_choice_single", label: "Multiple Choice (Single Answer)" },
  {
    value: "multiple_choice_multiple",
    label: "Multiple Choice (Multiple Answers)",
  },
  { value: "true_false_not_given", label: "True / False / Not Given" },
  { value: "yes_no_not_given", label: "Yes / No / Not Given" },
  { value: "sentence_completion", label: "Sentence Completion" },
  { value: "note_completion", label: "Note Completion" },
  { value: "summary_completion", label: "Summary Completion" },
  { value: "short_answer", label: "Short Answer" },
  { value: "matching_headings", label: "Matching Headings" },
  { value: "matching_information", label: "Matching Information" },
];

export const OPTION_BASED_TYPES = new Set([
  "multiple_choice_single",
  "multiple_choice_multiple",
  "true_false_not_given",
  "yes_no_not_given",
  "matching_headings",
  "matching_information",
]);

export const FIXED_OPTIONS_BY_TYPE = {
  true_false_not_given: ["True", "False", "Not Given"],
  yes_no_not_given: ["Yes", "No", "Not Given"],
};
