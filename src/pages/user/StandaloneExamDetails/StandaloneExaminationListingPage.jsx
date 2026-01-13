import { Box, Stack } from "@chakra-ui/layout";
import { Link, useHistory } from "react-router-dom";
import { Route } from "react-router-dom";
import { Heading, Image, Text } from "../../../components";
import coverImagePlaceholder from "../../../assets/images/events-banner.svg";
import { pageWrapperSpacing_userPages } from "../../../theme/breakpoints";
import { AiFillClockCircle } from "react-icons/ai";
import { useEffect, useState } from "react";
import timeConverter from "./timeConverter";
import { useToast } from "@chakra-ui/toast";

import useTakeStandalone from "../../../contexts/TakeStandaloneExam/useTakeStandalone";
import completeImg from "../../../assets/images/image 10.png";
import uncompleteImg from "../../../assets/images/image 11.png";
import CoursesPagination from "../../../components/Pagination/CoursesPagination";

const StandaloneExaminationListingPage = () => {
  const [exams, setExams] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(4);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const { examination, page, setPage } = useTakeStandalone();
  const { push } = useHistory();
  const toast = useToast();

  const handleNavigate = (length, id) => {
    if (length < 1) {
      push(`/standalone-exams/take/?exam=${id}`);
    } else {
      toast({
        description: "You have completed this examination",
        position: "top",
        status: "success",
      });
    }
  };

  useEffect(() => {
    setExams(examination);
  }, [examination]);

  console.log(exams);

  const DateConverter = (date) => {
    return new Date(date).toLocaleString("en-us", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const pageLength = exams?.length;

  const currentItems = exams?.slice(indexOfFirstItem, indexOfLastItem);

  const npages = Math.ceil(pageLength / itemsPerPage);

  return (
    <>
      <Box
        // {...maxWidthStyles_userPages}
        paddingY={{ base: 2, laptop: 5 }}
        // paddingX={{ base: 2, laptop: 8, 'laptop-l': 5 }}
      >
        <Box
          as="section"
          padding={10}
          marginBottom={10}
          color="white"
          position="relative"
        >
          <Image
            src={coverImagePlaceholder}
            width="100%"
            height="100%"
            top={0}
            left={0}
            position="absolute"
            alt="Course Header"
          />

          <Stack
            spacing={7}
            position="relative"
            // zIndex={1}
            {...pageWrapperSpacing_userPages}
          >
            <Heading>Examinations</Heading>
            <Text as="level2">Exams for you</Text>
          </Stack>
        </Box>

        <Box
          width="98%"
          margin="auto"
          display="flex"
          flexWrap="wrap"
          cursor="pointer"
          gap="30px"
        >
          {exams &&
            currentItems?.map((exam) => (
              <Box
                key={exam?.id}
                height="280px"
                width="350px"
                marginBottom="18px"
                borderRadius="8px"
                boxShadow="lg"
                border="2px solid #f5f5f5"
                background="#fff"
                onClick={() =>
                  handleNavigate(
                    exam?.standAloneExaminationGrade.length,
                    exam?.id
                  )
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "#660066",
                    alignItems: "center",
                    padding: "4px",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  }}
                >
                  <div
                    style={
                      exam?.standAloneExaminationGrade.length === 0
                        ? {
                            background: "red",
                            color: "#f5f5f5",
                            fontSize: "14px",
                            paddingRight: "4px",
                            paddingLeft: "4px",
                            borderRadius: "5px",
                          }
                        : {
                            background: "#27AE60",
                            color: "#f5f5f5",
                            fontSize: "14px",
                            paddingRight: "4px",
                            paddingLeft: "4px",
                            borderRadius: "5px",
                          }
                    }
                  >
                    {exam?.standAloneExaminationGrade.length === 0
                      ? "uncompleted"
                      : "completed"}
                  </div>
                  <p
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    score: {""}
                    {exam?.standAloneExaminationGrade[0]?.score}%
                  </p>
                </div>
                <div style={{ height: "130px" }}>
                  {exam?.standAloneExaminationGrade.length === 0 ? (
                    <img
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      src={uncompleteImg}
                      alt={exam?.title}
                    />
                  ) : (
                    <img
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      src={completeImg}
                      alt={exam?.title}
                    />
                  )}
                </div>
                <div
                  style={{
                    marginTop: "4px",
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <p style={{ fontWeight: "bold" }}>{exam?.title}</p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#697386",
                    }}
                  >
                    <p style={{ fontSize: "14px" }}>
                      Start: {DateConverter(exam?.startTime)}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <AiFillClockCircle />
                      <p>{timeConverter(exam?.duration)}</p>
                    </div>
                  </div>
                </div>
              </Box>
            ))}
        </Box>

        <CoursesPagination
          itemsPerPage={itemsPerPage}
          pageLength={pageLength}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          npages={npages}
        />
      </Box>
    </>
  );
};

export const StandalonePagesRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <StandaloneExaminationListingPage {...props} />}
    />
  );
};
