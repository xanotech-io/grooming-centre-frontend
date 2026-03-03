import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Route } from "react-router-dom";
import { RiRadioButtonFill } from "react-icons/ri";
import { MdRadioButtonUnchecked } from "react-icons/md";
import { Button } from "../../../components";
import useTakeStandalone from "../../../contexts/TakeStandaloneExam/useTakeStandalone";
import { useQueryParams } from "../../../hooks";
import congratsIcon from "../../../assets/images/congratsIcon.png";
import { useDisclosure } from "@chakra-ui/react";
import { Warning } from "@material-ui/icons";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useLocation } from "react-router-dom/cjs/react-router-dom";
const AssessmentStart = () => {
  const [modal, setModal] = useState({
    state: false,
    congrats: false,
    score: false,
  });
  const modalManager = useDisclosure();
  const [modalContent, setModalContent] = useState();
  const [modalPrompt, setModalPrompt] = useState(null);
  const [modalCanClose, setModalCanClose] = useState(true);
  const [end, setEnd] = useState(true);
  const [icon, setIcon] = useState(false);
  const [page, setPage] = useState(0);
  const [id, setId] = useState("");
  const [arr, setArr] = useState([]);
  const [examTitle, setExamTitle] = useState("");
  const [ansArr, setAnsArr] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [ans, setAns] = useState({
    ans1: [],
  });
  const [main, setMain] = useState([]);

  const [exams, setExams] = useState([]);
  const examid = useQueryParams().get("exam");

  const { examination } = useTakeStandalone();

  const [exitAttempts, setExitAttempts] = useState(0);

  const handleExitAttempt = () => {
    setExitAttempts((prevAttempts) => prevAttempts + 1);
  };

  useEffect(() => {
    const handleUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
      handleExitAttempt();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        modalManager.onOpen();
        setModalContent(null);
        setModalPrompt({
          heading: `Leaving this tab more than twice will automatically submit your examination`,
          body: (
            <Box as="div" display="flex" alignItems="center" gap={3}>
              <Warning
                style={{
                  height: "40px",
                  width: "40px",
                  color: "red",
                }}
              />
              <div>please take note....</div>
            </Box>
          ),
        });
        handleExitAttempt();
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (exitAttempts >= 3) {
      handleSubmit();
    }
  }, [exitAttempts]);

  //   return (
  //     <div>
  //       <p>Exam content goes here...</p>
  //       <button onClick={handleExitAttempt}>Exit</button>
  //     </div>
  //   );
  // };

  // export default ExamComponent;

  useEffect(() => {
    setExams(examination);
    const currentExamDetails = exams?.find((item) => item?.id === examid);
    setExamTitle(currentExamDetails?.title);
    setQuestions(currentExamDetails?.question);
  }, [examination, exams, examid]);

  const handleDestructuring = (question) => {
    const blocks = JSON.parse(question);
    const text = blocks?.blocks[0]?.text;
    return text;
  };

  const pageLength = questions?.length - 1;

  const handleSelectQuestion = (id, myId) => {
    // setting
    setAns({ ...ans, ans1: [...ans.ans1, id] });
    setArr([...arr, myId]);
    setIcon(true);
    setId(id);
  };
  useEffect(() => {
    if (ans.ans1.length > 1) {
      setAns({ ...ans, ans1: [ans.ans1.pop()] });
    }
  }, [ans.ans1.length]);

  // console.log(ans.ans1);

  useEffect(() => {
    setMain([...main, ...ans.ans1]);
  }, []);

  // console.log(main);

  useEffect(() => {
    setAnsArr([...new Set(main)]);
  }, [main]);

  const handleNext = () => {
    setPage(page === pageLength ? pageLength : page + 1);
    setIcon(false);
  };

  const handleSubmit = () => {
    setModal({ ...modal, state: true });
  };
  const handlePrev = () => {
    setPage(page === 0 ? 0 : page - 1);
    setIcon(false);
  };

  return (
    <Box position="relative">
      {modal.state && (
        <Box
          zIndex="100"
          backgroundColor="rgba(0, 0, 0, 0.6)"
          width="100vw"
          top="0"
          right="0"
          position="fixed"
          height="100vh"
          padding="40px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            borderRadius="10px"
            backgroundColor="white"
            width="525px"
            height="256px"
          >
            {modal.congrats ? (
              <Box>
                {modal.score ? (
                  <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="column"
                    gap="30px"
                    padding="20px"
                  >
                    <p style={{ fontWeight: "bold" }}>Result Overview</p>
                    <p>Your Score is</p>
                    <p>10/20</p>
                  </Box>
                ) : (
                  <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="column"
                    gap="20px"
                    padding="20px"
                  >
                    <p style={{ fontWeight: "bold" }}>Congratulations</p>
                    <img src={congratsIcon} width={"50px"} alt="congrats" />
                    <p>{examTitle} completed</p>
                    <Button onClick={() => setModal({ ...modal, score: true })}>
                      View Result
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Box padding="15px">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <h2
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      marginTop: "7px",
                    }}
                  >
                    Are you sure you want to submit your assessment?
                  </h2>
                  <p style={{ width: "90%" }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. A,
                    tristique aliquam adipiscing senectus nulla nibh..
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    float: "right",
                    marginTop: "50px",
                  }}
                >
                  <Button
                    onClick={() => setModal({ ...modal, state: false })}
                    secondary
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setModal({ ...modal, congrats: true })}
                  >
                    Submit
                  </Button>
                </div>
              </Box>
            )}
          </Box>
        </Box>
      )}
      <Box
        width="80%"
        marginLeft="auto"
        marginRight="auto"
        height="auto"
        border="2px solid #f5f5f5"
        boxShadow="lg"
        display="flex"
        marginTop="60px"
        flexDirection="column"
        paddingBottom="40px"
      >
        <h1
          style={{
            width: "100%",
            color: "white",
            height: "80px",
            background: "#5A051A",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: "20px",
            padding: "20px",
            display: "flex",
          }}
        >
          {examTitle}
        </h1>
        <Box
          width="98%"
          marginLeft="auto"
          marginRight="auto"
          display="flex"
          flexDirection={{ sm: "column", md: "column", lg: "row" }}
          gap="30px"
        >
          <Box
            marginTop="10px"
            display="flex"
            flexDirection="column"
            width={{ sm: "90%", md: "80%", lg: "90%" }}
          >
            <h2
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                marginBottom: "25px",
              }}
            >
              Question {page + 1} of {questions?.length}
            </h2>
            <hr style={{ marginTop: "10px" }} />

            {questions?.map((assessment, i) => (
              <div key={i}>
                {i === page && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "25px",
                    }}
                  >
                    <p style={{ marginTop: "10px" }}>
                      {handleDestructuring(
                        assessment?.question,
                        assessment?.id
                      )}
                    </p>

                    {assessment?.standAloneExaminationOption?.map(
                      (item, index) => (
                        <p
                          key={item?.id}
                          onClick={() =>
                            handleSelectQuestion(item?.id, assessment?.id, i)
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                          }}
                        >
                          {(icon && id === item?.id) ||
                          ansArr.includes(item?.id) ? (
                            <RiRadioButtonFill
                              size="20px"
                              style={{ color: "#800020" }}
                            />
                          ) : (
                            <MdRadioButtonUnchecked
                              size="20px"
                              style={{ color: "#800020" }}
                            />
                          )}
                          {item?.name}
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "30px",
              }}
            >
              <Button onClick={() => handlePrev()} secondary>
                Previous
              </Button>
              {page === pageLength ? (
                <Button onClick={() => handleSubmit()}>Submit</Button>
              ) : (
                <Button onClick={() => handleNext()}>Next</Button>
              )}
            </div>
          </Box>
          <Box
            marginTop="10px"
            paddingLeft="20px"
            paddingRight="20px"
            borderLeft={{
              sm: "none",
              md: "none",
              lg: "1px solid rgba(105, 115, 134, 0.31)",
            }}
            width={{ sm: "90%", md: "80%", lg: "40%" }}
          >
            <h2
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                marginBottom: "35px",
              }}
            >
              Time Left
            </h2>
            <hr style={{ marginTop: "10px", marginBottom: "10px" }} />

            <Box display="flex" gap="40px">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  textAlign: "center",
                }}
              >
                <p style={{ fontWeight: "bold", fontSize: "16px" }}>01</p>
                <p>hours</p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  textAlign: "center",
                }}
              >
                <p style={{ fontWeight: "bold", fontSize: "16px" }}>31</p>
                <p>minutes</p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  textAlign: "center",
                }}
              >
                <p style={{ fontWeight: "bold", fontSize: "16px" }}>30</p>
                <p>seconds</p>
              </div>
            </Box>

            <Box marginTop="20px">
              <h2>Questions</h2>
              <Box
                display="flex"
                justifyContent="space-between"
                marginTop="20px"
              >
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    fontSize: "12px",
                  }}
                >
                  <p
                    style={{
                      width: "22px",
                      height: "10px",
                      backgroundColor: "#800020",
                    }}
                  ></p>
                  <p>Answered</p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    fontSize: "12px",
                  }}
                >
                  <p
                    style={{
                      width: "22px",
                      height: "10px",
                      border: "2px solid #800020",
                    }}
                  ></p>
                  <p>Unanswered</p>
                </div>
              </Box>
            </Box>

            <Box marginTop="20px" display="flex" flexWrap="wrap" gap="10px">
              {questions?.map((item, i) => (
                <div
                  key={i}
                  style={
                    arr.includes(item?.id)
                      ? {
                          height: "55px",
                          width: "55px",
                          backgroundColor: "#800020",
                          textAlign: "center",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "4px",
                          color: "white",
                        }
                      : {
                          height: "55px",
                          width: "55px",
                          border: "1px solid #800020",
                          textAlign: "center",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "4px",
                          color: "#000",
                        }
                  }
                >
                  {i + 1}
                </div>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const AssessmentStartRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <AssessmentStart {...props} />} />;
};
