import Icon from "@chakra-ui/icon";
import { Flex, Grid } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { AiOutlineLeft } from "react-icons/ai";
import { HiBadgeCheck } from "react-icons/hi";
import { Heading, Text, Button } from "../../../components";

export const CongratsModalContent = ({
  redirectLink,
  contextText,
  score,
  isExamination,
}) => (
  <Grid placeItems="center" minHeight="300px">
    <Heading as="h3">Congratulations</Heading>

    <Icon boxSize={"100px"} fontSize="heading.h3" color="primary.base">
      <HiBadgeCheck />
    </Icon>

    <Flex>
      <Text as="level2" marginRight={2}>
        {contextText}
      </Text>

      <Text color="accent.3" as="level2">
        is completed
      </Text>
    </Flex>
    <Text>Your score is {isExamination ? score : `${score}%`}</Text>

    <Button sm link={redirectLink} ghost leftIcon={<AiOutlineLeft />}>
      Back to course
    </Button>
  </Grid>
);

export const CustomModal = ({
  isOpen,
  onClose,
  canClose = false,
  prompt,
  children,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={canClose ? onClose : () => {}}>
      <ModalOverlay />
      <ModalContent>
        {prompt && (
          <>
            <ModalHeader>{prompt.heading}</ModalHeader>

            <ModalBody>{prompt.body}</ModalBody>

            <ModalFooter>
              <Button secondary mr={3} onClick={onClose}>
                Close
              </Button>
              {prompt.submitProps && (
                <Button {...prompt.submitProps}>
                  {prompt.submitText || "Submit"}
                </Button>
              )}
            </ModalFooter>
          </>
        )}

        {children}
      </ModalContent>
    </Modal>
  );
};
