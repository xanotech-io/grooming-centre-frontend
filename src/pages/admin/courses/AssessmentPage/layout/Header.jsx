import { Box, Flex } from "@chakra-ui/layout";
import { BreadcrumbItem } from "@chakra-ui/react";
import { IoArrowBack } from "react-icons/io5";
import { useParams } from "react-router";
import { Breadcrumb, Button, Link, Text } from "../../../../../components";
import { useQueryParams, useGoBack } from "../../../../../hooks";
import colors from "../../../../../theme/colors";
import useAssessmentStore from "../../../../../store/assessmentStore";

const buildQuery = (examinationId, moduleId) => {
  const params = new URLSearchParams();
  if (examinationId) params.set("examination", examinationId);
  if (moduleId) params.set("moduleId", moduleId);
  const query = params.toString();
  return query ? `?${query}` : "";
};

const links = [
  {
    matcher: (courseId, assessmentId) =>
      `/admin/courses/${courseId}/assessment/${assessmentId}/overview`,
    href: (courseId, assessmentId, examinationId, moduleId) =>
      `/admin/courses/${courseId}/assessment/${assessmentId}/overview${buildQuery(
        examinationId,
        moduleId
      )}`,
    text: "Overview",
  },
  {
    matcher: (courseId, assessmentId) =>
      `courses/${courseId}/assessment/${assessmentId}/questions`,
    href: (courseId, assessmentId, examinationId, moduleId) =>
      `/admin/courses/${courseId}/assessment/${assessmentId}/questions/new${buildQuery(
        examinationId,
        moduleId
      )}`,
    text: "Questions",
  },
  {
    matcher: (courseId, assessmentId) =>
      `/admin/courses/${courseId}/assessment/${assessmentId}/grading`,
    href: (courseId, assessmentId, examinationId, moduleId) =>
      `/admin/courses/${courseId}/assessment/${assessmentId}/grading${buildQuery(
        examinationId,
        moduleId
      )}`,
    text: "Grading",
  },
];

const Header = () => {
  const { id: courseId, assessmentId } = useParams();
  const handleCancel = useGoBack();
  const openBankPicker = useAssessmentStore((s) => s.openBankPicker);

  const queryParams = useQueryParams();
  const examinationId = queryParams.get("examination");
  const moduleId = queryParams.get("moduleId");
  const isExamination = examinationId;
  const isStandaloneExamination =
    courseId === "not-set" && assessmentId === "not-set" && examinationId
      ? true
      : false;
  // The standalone course-level assessment listing was retired — module-scoped
  // assessments are the only surviving flow, so anything without a moduleId
  // (which shouldn't happen via any live entry point anymore) falls back to
  // the Modules hub instead of a dead link.
  const backToAssessmentsLink = moduleId
    ? `/admin/courses/${courseId}/module/${moduleId}/assessments`
    : `/admin/courses/details/${courseId}/modules`;

  const isActiveLink = (LinkMatcher) =>
    window.location.pathname.includes(LinkMatcher);

  // The last breadcrumb crumb should name whichever tab (Overview / Questions
  // / Grading) is actually active, not be hardcoded to one of them.
  const activeLink = links.find((link) =>
    isActiveLink(link.matcher(courseId, assessmentId)),
  );
  const currentPageLabel = activeLink?.text || "Overview";

  const breadcrumbItems = isStandaloneExamination
    ? {
        item2: (
          <BreadcrumbItem>
            <Link href="/admin/standalone-exams">Standalone Exams</Link>
          </BreadcrumbItem>
        ),
        item3: (
          <BreadcrumbItem isCurrentPage>
            <Link href="#">{currentPageLabel}</Link>
          </BreadcrumbItem>
        ),
      }
    : moduleId
      ? {
          item2: (
            <BreadcrumbItem>
              <Link href="/admin/courses">Courses</Link>
            </BreadcrumbItem>
          ),
          item3: (
            <BreadcrumbItem>
              <Link href={`/admin/courses/details/${courseId}/modules`}>
                Modules
              </Link>
            </BreadcrumbItem>
          ),
          item4: (
            <BreadcrumbItem>
              <Link
                href={`/admin/courses/${courseId}/module/${moduleId}/${
                  isExamination ? "examinations" : "assessments"
                }`}
              >
                {isExamination ? "Examinations" : "Assessments"}
              </Link>
            </BreadcrumbItem>
          ),
          item5: (
            <BreadcrumbItem isCurrentPage>
              <Link href="#">{currentPageLabel}</Link>
            </BreadcrumbItem>
          ),
        }
      : {
          // No moduleId means this exam/assessment predates the module-scoped
          // flow (or was reached via a since-retired entry point) — same
          // "dead link" case `backToAssessmentsLink` above already handles,
          // so this crumb falls back to the Modules hub too instead of
          // linking to the no-longer-navigable course-level exam/assessment
          // listing (`/admin/courses/details/:id/exam`/`/assessment` —
          // deliberately commented out of ViewCourseInfoPage's own tabs).
          item2: (
            <BreadcrumbItem>
              <Link href="/admin/courses">Courses</Link>
            </BreadcrumbItem>
          ),
          item3: (
            <BreadcrumbItem>
              <Link href={`/admin/courses/details/${courseId}/modules`}>
                Modules
              </Link>
            </BreadcrumbItem>
          ),
          item4: (
            <BreadcrumbItem isCurrentPage>
              <Link href="#">{currentPageLabel}</Link>
            </BreadcrumbItem>
          ),
        };

  return (
    <Box>
      <Box paddingX={6} paddingTop={4}>
        <Breadcrumb {...breadcrumbItems} />
      </Box>

      <Flex
        as="header"
        backgroundColor="white"
        shadow="0 2px 2px rgba(0, 0, 0, .05)"
        marginTop="20px"
        padding={6}
      >
        <Box
          as="nav"
          display="flex"
          alignItems={{ base: "flex-start", md: "center", lg: "center" }}
          flexDirection={{ base: "column", md: "row", lg: "row" }}
          gap={3}
          justifyContent="space-between"
          width="100%"
        >
          {/** Empty box */}
          <Flex as="ul" listStyleType="none">
            {links.map((link) => (
              <li key={link.text}>
                <Link
                  href={link.href(courseId, assessmentId, examinationId, moduleId)}
                  style={{
                    color: isActiveLink(link.matcher(courseId, assessmentId))
                      ? colors.black
                      : colors.accent[2],
                    display: "block",
                  }}
                  disabled={assessmentId === "new"}
                >
                  <Text paddingX={3}>{link.text}</Text>
                </Link>
              </li>
            ))}
          </Flex>
          <Flex justifyContent="end" gap={2}>
            <Button
              secondary
              {...(isActiveLink("questions")
                ? { onClick: openBankPicker }
                : {
                    link: isStandaloneExamination
                      ? "/admin/exam-question-bank"
                      : `/admin/exam-question-bank?courseId=${courseId}${
                          moduleId ? `&moduleId=${moduleId}` : ""
                        }`,
                  })}
            >
              Question Bank
            </Button>
            <Button
              width="180px"
              leftIcon={<IoArrowBack />}
              link={isExamination ? undefined : backToAssessmentsLink}
              secondary
              onClick={isExamination ? handleCancel : undefined}
            >
              {isExamination ? "Examination" : "Back to Assessments"}
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default Header;
