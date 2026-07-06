import { useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/layout";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  GridItem,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Button, Heading, Spinner, Text } from "../../../components";
import { EmptyState } from "../../../layouts";
import dayjs from "dayjs";
import {
  hasEnded,
  isOngoing,
  isUpcoming,
  sortByMostRelevantDate,
  truncateText,
} from "../../../utils";
import { Tag } from "@chakra-ui/tag";
import { useDisclosure } from "@chakra-ui/hooks";
import { BiRightArrowAlt } from "react-icons/bi";
import { useApp } from "../../../contexts";
import { useFetch } from "../../../hooks";
import { userJoinEvent } from "../../../services";
import { useToast } from "@chakra-ui/toast";

export const EventListing = ({
  isLoading,
  hasError,
  forAdmin,
  eventsIsEmpty,
  events,
  headerButton,
  emptyStateHeading,
  emptyStateDescription,
  emptyStateCta,
}) => (
  <>
    {isLoading && <LoadingState />}
    {hasError && <ErrorState />}
    {eventsIsEmpty &&
      (forAdmin ? (
        <EmptyState
          cta={
            emptyStateCta !== undefined ? (
              emptyStateCta
            ) : (
              <Button link="/admin/events/edit/new">Create one</Button>
            )
          }
          heading={emptyStateHeading || "No Events yet!"}
          description={
            emptyStateDescription ||
            "There isn't any event yet. Create one to get started!"
          }
        />
      ) : (
        <EmptyState
          cta={<Button link="/dashboard">Return to dashboard</Button>}
          heading="No Upcoming Events"
          description="You have no events scheduled"
        />
      ))}
    {events && !eventsIsEmpty && (
      <Listing events={events} headerButton={headerButton} />
    )}
  </>
);

const Listing = ({ events, headerButton }) => {
  events = sortByMostRelevantDate(events);

  const { resource: joinEventResource, handleFetchResource } = useFetch();
  const toast = useToast();
  const [joinedEvents, setJoinEvents] = useState(0);

  const handleJoinEvent = (id, link) =>
    handleFetchResource({
      fetcher: async () => {
        await userJoinEvent(id);

        return { link, id };
      },
      onError: (err) => {
        console.error(err);
        toast({
          description: "Something went wrong! please try again later",
          status: "error",
          position: "top",
        });
      },
      onSuccess: () => {
        let ls = localStorage.getItem("joined-events");
        ls = ls ? JSON.parse(ls) : {};
        ls[id] = true;

        localStorage.setItem("joined-events", JSON.stringify(ls));

        setJoinEvents((prev) => prev + 1);
      },
    });

  return (
    <Box
      minHeight="50vh"
      // width={breakpoints.tablet}
      marginX="auto"
      border="1px"
      backgroundColor="white"
      borderColor="accent.1"
      rounded="md"
    >
      {headerButton && (
        <Flex
          justifyContent="space-between"
          alignItems={{ base: "flex-start", md: "center" }}
          flexDirection={{ base: "column", md: "row" }}
          gap={4}
          borderBottom="1px"
          borderColor="accent.1"
          px={5}
          py={4}
        >
          <Heading as="h2" fontSize="heading.h4">
            Event List
          </Heading>
          {headerButton}
        </Flex>
      )}

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Event ID</Th>
              <Th>Event</Th>
              <Th>Description</Th>
              <Th>Schedule</Th>
              <Th>Status</Th>
              <Th textAlign="right">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {events &&
              events.map((event) => (
                <Tr key={event.id}>
                  <Td>
                    <Text bold>{event.displayId}</Text>
                  </Td>
                  <Td>
                    {event.renderEventName ? (
                      event.renderEventName()
                    ) : (
                      <EventNameLink
                        event={event}
                        joinEventResource={joinEventResource}
                        handleJoinEvent={handleJoinEvent}
                        joinedEvents={joinedEvents}
                      />
                    )}
                  </Td>
                  <Td>
                    <Text>{truncateText(event.description, 90)}</Text>
                  </Td>
                  <Td>
                    <Text color="primary.hover" as="level5">
                      {dayjs(event.startTime).format("dddd, D MMM YYYY")}
                    </Text>
                    <Text>
                      {dayjs(event.startTime).format("h:mm A")} to{" "}
                      {dayjs(event.endTime).format("h:mm A")}
                    </Text>
                  </Td>
                  <Td>
                    <Tag
                      size="sm"
                      variant="solid"
                      colorScheme={
                        isOngoing(event.startTime, event.endTime)
                          ? "green"
                          : hasEnded(event.endTime)
                          ? "gray"
                          : "blue"
                      }
                    >
                      {isOngoing(event.startTime, event.endTime) &&
                        "Ongoing Event"}
                      {hasEnded(event.endTime) && "Event Has Ended"}
                      {isUpcoming(event.startTime) && "Event Is Upcoming"}
                    </Tag>
                  </Td>
                  <Td textAlign="right">
                    {event.renderAction ? (
                      event.renderAction()
                    ) : (
                      <ViewEventButton
                        event={event}
                        joinEventResource={joinEventResource}
                        handleJoinEvent={handleJoinEvent}
                        joinedEvents={joinedEvents}
                      />
                    )}
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const JoinEventButton = ({ event, onJoinEvent, resource, canJoinEvent }) => {
  return (
    <Button
      isLoading={resource?.loading}
      disabled={
        // true
        canJoinEvent ||
        !isOngoing(event?.startTime, event?.endTime) || //Uncomment out
        resource?.loading ||
        resource?.data
      }
      rightIcon={<BiRightArrowAlt />}
      onClick={onJoinEvent?.bind(null, event?.id, event?.link)}
    >
      Join Event
    </Button>
  );
};

export const EventNameLink = ({
  event,
  renderCallToAction,
  joinEventResource,
  handleJoinEvent,
  joinedEvents,
}) => (
  <ViewEventButton
    event={event}
    joinedEvents={joinedEvents}
    joinEventResource={joinEventResource}
    handleJoinEvent={handleJoinEvent}
    renderCallToAction={renderCallToAction}
    renderTrigger={({ onOpen }) => (
      <Text
        as="level2"
        bold
        my={1}
        onClick={onOpen}
        _hover={{ textDecoration: "underline", cursor: "pointer" }}
      >
        {event.name}
      </Text>
    )}
  />
);

export const ViewEventButton = ({
  event,
  renderTrigger,
  renderCallToAction,
  joinEventResource,
  handleJoinEvent,
  joinedEvents,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { getOneMetadata } = useApp();

  const [canJoinEvent, setCanJoinEvent] = useState(0);

  useEffect(() => {
    let ls = localStorage.getItem("joined-events");
    ls = ls ? JSON.parse(ls) : {};

    const canJoin = ls[event.id];

    if (canJoin) {
      setCanJoinEvent(true);
    }
  }, [event.id, joinedEvents]);

  event.link = event.link?.replace(/\?pwd=(.)*$/, "");

  return (
    <>
      {renderTrigger ? (
        renderTrigger({ onOpen })
      ) : (
        <Button secondary onClick={onOpen}>
          View Event
        </Button>
      )}

      <Drawer
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        placement="right"
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex direction="column" gap={2} pr={6}>
              <Text fontSize="sm" color="accent.3" letterSpacing="0.08em" textTransform="uppercase">
                Event details
              </Text>
              <Flex align="center" gap={3} flexWrap="wrap">
                <Heading as="h3" fontSize="heading.h4">
                  {event.name}
                </Heading>
                <Tag
                  variant="solid"
                  colorScheme={
                    isOngoing(event.startTime, event.endTime)
                      ? "green"
                      : hasEnded(event.endTime)
                      ? "gray"
                      : "blue"
                  }
                >
                  {isOngoing(event.startTime, event.endTime) && "Ongoing Event"}
                  {hasEnded(event.endTime) && "Event Has Ended"}
                  {isUpcoming(event.startTime) && "Event Is Upcoming"}
                </Tag>
              </Flex>
            </Flex>
          </DrawerHeader>

          <DrawerBody py={6}>
            <Box mb={6}>
              <Text fontWeight="600" mb={2}>
                Description
              </Text>
              <Text color="accent.3">{event.description}</Text>
            </Box>

            <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={4} mb={6}>
              <GridItem p={4} border="1px" borderColor="accent.1" rounded="md">
                <Text fontSize="sm" color="accent.3" mb={1}>
                  Date
                </Text>
                <Text fontWeight="600">
                  {dayjs(event.startTime).format("dddd, D MMMM")}
                </Text>
              </GridItem>
              <GridItem p={4} border="1px" borderColor="accent.1" rounded="md">
                <Text fontSize="sm" color="accent.3" mb={1}>
                  Time
                </Text>
                <Text fontWeight="600">
                  {dayjs(event.startTime).format("h:mm A")} - {dayjs(event.endTime).format("h:mm A")}
                </Text>
              </GridItem>
              <GridItem p={4} border="1px" borderColor="accent.1" rounded="md">
                <Text fontSize="sm" color="accent.3" mb={1}>
                  Department
                </Text>
                <Text fontWeight="600">
                  {event.departmentId
                    ? getOneMetadata("departments", event.departmentId, {
                        allMetadata: true,
                      })?.name
                    : "N/A"}
                </Text>
              </GridItem>
              <GridItem p={4} border="1px" borderColor="accent.1" rounded="md">
                <Text fontSize="sm" color="accent.3" mb={1}>
                  Attendees
                </Text>
                <Text fontWeight="600">{event.attendeesCount ?? "-"}</Text>
              </GridItem>
            </Grid>

            {renderCallToAction ? (
              <Box p={4} border="1px" borderColor="accent.1" rounded="md">
                <Text fontWeight="600" mb={3}>
                  Event access
                </Text>
                <Text my={2} as="level3">
                  <Box as="b" mr={5}>
                    DEPARTMENT:
                  </Box>
                  {event.departmentId
                    ? getOneMetadata("departments", event.departmentId, {
                        allMetadata: true,
                      })?.name
                    : "N/A"}
                </Text>

                <Text my={2} as="level3">
                  <Box as="b" mr={5}>
                    ATTENDEES:
                  </Box>
                  {event.attendeesCount}
                </Text>
              </Box>
            ) : canJoinEvent && isOngoing(event.startTime, event.endTime) ? (
              <Box p={4} border="1px" borderColor="accent.1" rounded="md">
                <Text fontWeight="600" mb={3}>
                  Join details
                </Text>

                <Text my={2} as="level3">
                  <Box as="b" mr={5}>
                    LINK:
                  </Box>

                  <a href={event.link} target="_blank" rel="noreferrer">
                    <Box
                      as="b"
                      mr={5}
                      color="accent.6"
                      textDecoration="underline"
                    >
                      {event.link}
                    </Box>
                  </a>
                </Text>

                <Text my={2} as="level3">
                  <Box as="b" mr={5}>
                    PASSWORD:
                  </Box>

                  <i>{event.password}</i>
                </Text>
              </Box>
            ) : null}
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px" gap={3}>
            <Button secondary onClick={onClose}>
              Close
            </Button>

            {renderCallToAction ? (
              renderCallToAction({ event })
            ) : (
              <JoinEventButton
                canJoinEvent={canJoinEvent}
                event={event}
                resource={joinEventResource}
                onJoinEvent={handleJoinEvent}
              />
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

const LoadingState = () => (
  <EmptyState height="50vh">
    <Spinner />
  </EmptyState>
);

const ErrorState = () => (
  <EmptyState height="50vh">
    <Heading type="h3">Something went wrong</Heading>
  </EmptyState>
);
