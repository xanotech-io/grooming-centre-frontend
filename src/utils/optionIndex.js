// Some backends encode `optionIndex` as a letter ("A"/"B"/"C"/"D") instead of
// a number, depending on how the question was created (e.g. the batch-upload
// flow). Numeric fields/comparisons downstream (option-1..option-4 form
// fields, the `answer` radio value) all expect a 1-based number, so any value
// coming from the API needs to go through here rather than a bare `+value`.
const LETTER_TO_INDEX = { A: 1, B: 2, C: 3, D: 4 };

export const parseOptionIndex = (optionIndex) => {
  if (optionIndex === null || optionIndex === undefined) return undefined;
  const letterIndex = LETTER_TO_INDEX[String(optionIndex).toUpperCase()];
  if (letterIndex) return letterIndex;
  const numeric = +optionIndex;
  return Number.isNaN(numeric) ? undefined : numeric;
};
