import { Stack } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";
import PropTypes from "prop-types";

export const SkeletonText = ({
  numberOfLines = 2,
  height = "10px",
  spacing = 2,
  ...rest
}) => {
  const lines = Array(numberOfLines - 1).fill();

  return (
    <Stack spacing={spacing} {...rest}>
      {lines.map((_, index) => (
        <Skeleton key={index} width="100%" height={height} />
      ))}
      <Skeleton width="80%" height={height} />
    </Stack>
  );
};

SkeletonText.propTypes = {
  height: PropTypes.string,
  numberOfLines: PropTypes.number,
  spacing: PropTypes.number,
};
