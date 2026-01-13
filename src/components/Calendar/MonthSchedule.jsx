import { ViewState } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  MonthView,
  Appointments,
} from "@devexpress/dx-react-scheduler-material-ui";
import { Box, Flex } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { Button, Text } from "../";
import { getServerDateNow } from "../../utils";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { BiFullscreen } from "react-icons/bi";
import { useState } from "react";
import dayjs from "dayjs";
import { useDisclosure } from "@chakra-ui/hooks";

/**
 * MonthSchedule Component for the Calendar
 * @param {{ appointments: Array<{ title: string, startDate: Date, endDate: Date, id: string }> }} props
 *
 * @returns {JSX.Element}
 */
export const MonthSchedule = ({ appointments, dateManger }) => {
  const initNow = new Date(getServerDateNow());
  const [currentDate, setCurrentDate] = useState(initNow);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleNext = () => {
    var dt = new Date(currentDate);
    dt.setMonth(dt.getMonth() + 1);

    setCurrentDate(dt);
  };
  const handlePrev = () => {
    var dt = new Date(currentDate);
    dt.setMonth(dt.getMonth() - 1);

    setCurrentDate(dt);
  };

  const renderContent = (isFull) => (
    <Box className={`${!isFull ? "mini" : ""}`}>
      <Scheduler data={appointments}>
        <ViewState currentDate={currentDate} />
        <MonthView />
        <Appointments />
      </Scheduler>
    </Box>
  );
  const renderMonthSwitch = () => (
    <Flex justifyContent="space-between" alignItems="center" p={3} flex={1}>
      <Button asIcon onClick={handlePrev}>
        <AiOutlineLeft />
      </Button>

      <Text bold as="level3">
        {dayjs(currentDate).format("MMMM YYYY")}
      </Text>

      <Button asIcon onClick={handleNext}>
        <AiOutlineRight />
      </Button>
    </Flex>
  );

  return (
    <>
      <Flex alignItems="center" p={3}>
        {renderMonthSwitch()}

        <>
          <Button asIcon onClick={onOpen}>
            <BiFullscreen />
          </Button>

          <Modal
            blockScrollOnMount={false}
            isOpen={isOpen}
            onClose={onClose}
            size="full"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader></ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {renderMonthSwitch()}
                {renderContent(true)}
              </ModalBody>
            </ModalContent>
          </Modal>
        </>
      </Flex>

      {!isOpen && renderContent()}
    </>
  );
};
