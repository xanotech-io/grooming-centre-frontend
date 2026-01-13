import { Box, Flex, HStack } from '@chakra-ui/layout';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import { useCallback, useEffect } from 'react';
import { BiGridSmall, BiRightArrowAlt } from 'react-icons/bi';
import { BsArrowUpLeft, BsClockHistory } from 'react-icons/bs';
import { GoIssueClosed } from 'react-icons/go';
import { HiDotsVertical } from 'react-icons/hi';
import { Route, useHistory } from 'react-router-dom';
import { Button } from '../../../components';
import { useQueryParams, useTab } from '../../../hooks';
import { adminGetEventListing } from '../../../services';
import { isUpcoming } from '../../../utils';
import {
  EventListing,
  EventNameLink,
  useEventsPage,
  ViewEventButton,
} from '../../user';

const links = [
  {
    text: 'All',
    tab: 'all',
    icon: <BiGridSmall />,
  },
  {
    text: 'Ongoing',
    tab: 'ongoing',
    icon: <BsClockHistory />,
  },
  {
    text: 'Upcoming',
    tab: 'upcoming',
    icon: <BsArrowUpLeft />,
  },
  {
    text: 'Ended',
    tab: 'ended',
    icon: <GoIssueClosed />,
  },
];

export const useAdminEventsPage = (currentTab) => {
  const fetcher = useCallback(async () => {
    const { events } = await adminGetEventListing(
      currentTab !== 'all' && { status: currentTab }
    );

    return events.map((event) => ({
      ...event,
      renderAction: () => (
        <Box marginLeft="auto">
          <MoreIcon event={event} />
        </Box>
      ),
      renderEventName: () => (
        <EventNameLink
          event={event}
          renderCallToAction={({ event }) => <EditButton event={event} />}
        />
      ),
    }));
  }, [currentTab]);

  const { events, eventsIsEmpty, isLoading, hasError } = useEventsPage({
    fetcher,
    cacheKey: 'admin-events',
  });

  return { events, eventsIsEmpty, isLoading, hasError };
};

const EventsPage = () => {
  const { currentTab } = useTab();
  const { replace } = useHistory();
  const tabQuery = useQueryParams().get('tab');

  useEffect(() => {
    if (!tabQuery) {
      replace('/admin/events?tab=all');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabQuery]);

  return (
    <Flex marginTop="16" justifyContent="center">
      {currentTab && <Content currentTab={currentTab} />}
    </Flex>
  );
};

const Content = ({ currentTab }) => {
  const { events, eventsIsEmpty, isLoading, hasError } =
    useAdminEventsPage(currentTab);

  const getStyles = (tab) =>
    !(tab === currentTab) ? { ordinary: true } : { blue: true };

  return (
    <Box>
      <HStack alignSelf="flex-start" spacing={1} flex={1} mb={2}>
        {links.map((link) => (
          <Button
            key={link.tab}
            sm
            link={`?tab=${link.tab}`}
            {...getStyles(link.tab)}
            paddingX={3}
          >
            {link.icon} <Box paddingRight={1}></Box> {link.text}
          </Button>
        ))}
      </HStack>
      <EventListing
        isLoading={isLoading}
        hasError={hasError}
        eventsIsEmpty={eventsIsEmpty}
        events={events}
        forAdmin
        headerButton={
          <Button link={`/admin/events/edit/new`}>Create Event</Button>
        }
      />
    </Box>
  );
};

const MoreIcon = ({ event }) => {
  return (
    <Menu placement="bottom-end">
      <MenuButton
        padding={4}
        rounded="full"
        _hover={{ backgroundColor: 'secondary.05' }}
      >
        <HiDotsVertical />
      </MenuButton>

      <MenuList position="relative" zIndex={2}>
        <ViewEventButton
          event={event}
          renderTrigger={({ onOpen }) => (
            <MenuItem onClick={onOpen}>View</MenuItem>
          )}
          renderCallToAction={({ event }) => <EditButton event={event} />}
        />

        <EditButton event={event} isMenuItem />
      </MenuList>
    </Menu>
  );
};

const EditButton = ({ event, isMenuItem }) => {
  const { push } = useHistory();

  return isMenuItem ? (
    <MenuItem
      onClick={() =>
        isUpcoming(event.startTime, event.endTime) &&
        push(`/admin/events/edit/${event.id}`)
      }
      cursor={!isUpcoming(event.startTime, event.endTime) && 'no-drop'}
    >
      Edit
    </MenuItem>
  ) : (
    <Button
      link={`/admin/events/edit/${event.id}`}
      disabled={!isUpcoming(event.startTime, event.endTime)}
      rightIcon={<BiRightArrowAlt />}
    >
      Edit Event
    </Button>
  );
};

export const EventsPageRoute = ({ ...rest }) => {
  return <Route {...rest} render={(props) => <EventsPage {...props} />} />;
};
