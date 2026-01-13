import { Box } from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react';
import { Link, Route } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { AiFillClockCircle } from 'react-icons/ai';
import { MdVerified, MdPlayLesson } from 'react-icons/md';
import { Button } from '../../../components';
import { useQueryParams } from '../../../hooks';
import useTakeStandalone from '../../../contexts/TakeStandaloneExam/useTakeStandalone';
import timeConverter from './timeConverter';
import { AppContext } from '../../../contexts';

const StandalonePreAssessment = () => {
  const [exams, setExams] = useState([]);
  const { examination } = useTakeStandalone();

  useEffect(() => {
    setExams(examination);
  }, [examination]);

  const examid = useQueryParams().get('exam');

  const currentExamDetails = exams?.find((item) => item?.id === examid);

  return (
    <Box
      width="80%"
      margin="auto"
      marginTop="50px"
      height="550px"
      border="2px solid #f5f5f5"
      boxShadow="lg"
      display="flex"
      flexDirection="column"
      gap="30px"
      padding="40px"
    >
      <Box display="flex" gap="8px" flexDirection="column">
        <h1 style={{ fontWeight: 'bold', fontSize: '24px' }}>Assessment 1</h1>
        <h3 style={{ fontWeight: 'bold' }}>
          Topic: {currentExamDetails?.title}
        </h3>
        <div>
          <p style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <MdPlayLesson style={{ color: '#c4c4c4' }} />
            {currentExamDetails?.question?.length} multiple choice questions
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <AiFillClockCircle style={{ color: '#c4c4c4' }} />{' '}
            {timeConverter(currentExamDetails?.duration)}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <MdVerified style={{ color: '#c4c4c4' }} />
            Score a minimum of 90% to earn a badge
          </p>
        </div>
      </Box>
      <hr />
      <Box>
        <h3 style={{ fontWeight: 'bold' }}>Before you start</h3>
        <ul className="my-bullet_point">
          <li>
            You must complete this assessment in one session — make sure your
            internet is reliable.
          </li>
          <li style={{ color: '#000' }}>
            You can only take this assessment once, so do well to put in your
            best.
          </li>
          <li>We won’t show your results to anyone without your permission.</li>
        </ul>
      </Box>
      {/* <Link to={`/exam-start/?exam=${examid}`}>
        <Button>Assessment</Button>
      </Link> */}
      <Link to={`/standalone-exams/start/?exam=${examid}`}>
        <Button>Assessment</Button>
      </Link>
    </Box>
  );
};

export const StandalonePreAssessmentRoute = ({ ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => <StandalonePreAssessment {...props} />}
    />
  );
};
