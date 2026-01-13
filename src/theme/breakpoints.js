const breakpoints = {
  "mobile-s": "320px",
  "mobile-m": "375px",
  "mobile-l": "425px",
  tablet: "768px",
  laptop: "1024px",
  "laptop-l": "1440px",
  "4k": "2560px",
};

export const maxWidthStyles_userPages = {
  maxWidth: breakpoints["laptop-l"],
  marginX: "auto",
  paddingX: { base: 3, laptop: 6 },
};

export const pageWrapperSpacing_userPages = {
	marginX: { base: 0, laptop: 6 },
	paddingX: { base: 2, laptop: 0 },
};

export default breakpoints;
