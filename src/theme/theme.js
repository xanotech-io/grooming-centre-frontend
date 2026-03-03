import { extendTheme } from "@chakra-ui/react";
import { createBreakpoints } from "@chakra-ui/theme-tools";
import colors from "./colors";
import fontSizes from "./fontSizes";
import fonts from "./fonts";
import breakpoints from "./breakpoints";

const theme = extendTheme({
  colors,
  fontSizes,
  fonts,
  breakpoints: createBreakpoints(breakpoints),
});

export default theme;
