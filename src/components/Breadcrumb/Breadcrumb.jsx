import {
  Breadcrumb as BreadcrumbChakraui,
  BreadcrumbItem,
} from "@chakra-ui/react";
import { ChevronRight } from "@material-ui/icons";
import { Link } from "../";

export const Breadcrumb = ({ item2, item3, item4, props }) => {
  return (
    <BreadcrumbChakraui
      paddingY={4}
      spacing="8px"
      color="accent.3"
      fontSize={14}
      {...props}
      separator={<ChevronRight style={{ fontSize: 18 }} />}
    >
      <BreadcrumbItem>
        <Link href="/admin">Home</Link>
      </BreadcrumbItem>
      {item2}
      {item3}
      {item4}
    </BreadcrumbChakraui>
  );
};
