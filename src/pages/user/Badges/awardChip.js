export const awardChip = (status) => {
  switch ((status || "").toLowerCase()) {
    case "earned":
      return { label: "Earned", bg: "#E6F4EA", color: "#38A169" };
    case "pending approval":
      return { label: "Pending Approval", bg: "#FFF5EA", color: "#DD6B20" };
    case "in progress":
      return { label: "In Progress", bg: "#EBF4FF", color: "#3182CE" };
    default:
      return { label: "Not Started", bg: "#F7FAFC", color: "#718096" };
  }
};
