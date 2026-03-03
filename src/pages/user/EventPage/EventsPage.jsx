import { Box, Stack } from "@chakra-ui/layout";
import { useEffect, useCallback } from "react";
import { Route } from "react-router-dom";
import { Heading, Image, Text } from "../../../components";
import { useFetch } from "../../../hooks";
import { userGetEventListing } from "../../../services";
import coverImagePlaceholder from "../../../assets/images/events-banner.svg";
import { maxWidthStyles_userPages } from "../../../theme/breakpoints";
import { EventListing } from "./EventListing";

export const useEventsPage = (props) => {
  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { events } = await userGetEventListing();

    return events;
  }, []);

  useEffect(() => {
    handleFetchResource({
      cacheKey: props?.cacheKey || "events",
      fetcher: props?.fetcher || fetcher,
    });
  }, [fetcher, handleFetchResource, props?.fetcher, props?.cacheKey]);

  return {
    events: resource.data,
    eventsIsEmpty:
      !resource.loading &&
      !resource.err &&
      resource.data &&
      !resource.data?.length,
    isLoading: resource.loading,
    hasError: resource.err,
  };
};

const EventsPage = () => {
  const { events, eventsIsEmpty, isLoading, hasError } = useEventsPage();

  return (
    <Box>
      <Box
        as="section"
        padding={10}
        marginBottom={10}
        // backgroundColor="secondary.9"
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
          {...maxWidthStyles_userPages}
        >
          <Heading>Upcoming Events</Heading>
          <Text as="level2">Here is your schedule for the upcoming days</Text>
        </Stack>
      </Box>

      <EventListing
        isLoading={isLoading}
        hasError={hasError}
        eventsIsEmpty={eventsIsEmpty}
        events={events}
        // headerButton={<Button>Create Event</Button>}
      />
    </Box>
  );
};

export const EventsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <EventsPage {...props} />} />;
};
