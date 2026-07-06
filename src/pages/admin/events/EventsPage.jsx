import { Box, Flex, HStack } from '@chakra-ui/layout';
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu';
import { BreadcrumbItem } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BiGridSmall, BiRightArrowAlt } from 'react-icons/bi';
import { BsArrowUpLeft, BsClockHistory } from 'react-icons/bs';
import { GoIssueClosed } from 'react-icons/go';
import { HiDotsVertical } from 'react-icons/hi';
import { Route, useHistory } from 'react-router-dom';
import { Breadcrumb, Button, Heading, Link, SearchBar } from '../../../components';
import { useFetch, useQueryParams, useTab } from '../../../hooks';
import { AdminMainAreaWrapper } from '../../../layouts/admin/MainArea/Wrapper';
import { adminGetEventListing } from '../../../services';
import { isUpcoming } from '../../../utils';
import {
  EventListing,
  EventNameLink,
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
  const { resource, handleFetchResource } = useFetch();

  const fetcher = useCallback(async () => {
    const { events } = await adminGetEventListing(
      currentTab !== 'all' ? { status: currentTab } : undefined
    );

    return events.map((event) => ({
      ...event,
      title: event.name,
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

  useEffect(() => {
    handleFetchResource({ fetcher });
  }, [fetcher, handleFetchResource]);

  const events = resource.data;

  return {
    events,
    eventsIsEmpty:
      !resource.loading && !resource.err && events && !events.length,
    isLoading: resource.loading,
    hasError: resource.err,
  };
};

const EventsPage = () => {
  const { currentTab } = useTab();
  const { replace } = useHistory();
  const tabQuery = useQueryParams().get('tab');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!tabQuery) {
      replace('/admin/events?tab=all');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabQuery]);

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Events</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Flex
        justifyContent="space-between"
        alignItems={{ base: 'flex-start', md: 'center' }}
        flexDirection={{ base: 'column', md: 'row' }}
        gap={4}
        borderBottom="1px"
        borderColor="accent.2"
        paddingBottom={5}
        marginBottom={6}
      >
        <Heading as="h1" fontSize="heading.h3">
          Events
        </Heading>
        <Button link={`/admin/events/edit/new`}>Create Event</Button>
      </Flex>
      <Flex
        alignItems={{ base: 'stretch', md: 'center' }}
        flexDirection={{ base: 'column', md: 'row' }}
        gap={2}
        marginBottom={6}
      >
        <SearchBar
          sm
          placeholder="Search events"
          backgroundColor="white"
          maxWidth={{ base: '100%', md: '360px' }}
          flexShrink={0}
          onSearch={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        <HStack spacing={2} flexWrap="wrap" justifyContent="flex-start">
          {links.map((link) => (
            <Button
              key={link.tab}
              sm
              link={`?tab=${link.tab}`}
              {...(!(link.tab === currentTab) ? { ordinary: true } : { blue: true })}
              paddingX={3}
            >
              {link.icon} <Box paddingRight={1} /> {link.text}
            </Button>
          ))}
        </HStack>
      </Flex>
      {currentTab && (
        <Content currentTab={currentTab} searchQuery={searchQuery} />
      )}
    </AdminMainAreaWrapper>
  );
};

const Content = ({ currentTab, searchQuery }) => {
  const { events, eventsIsEmpty, isLoading, hasError } =
    useAdminEventsPage(currentTab);

  const filteredEvents = useMemo(() => {
    if (!events) return events;

    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return events;
    }

    return events.filter((event) => {
      const searchableValue = [
        event.displayId,
        event.title || event.name,
        event.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableValue.includes(normalizedQuery);
    });
  }, [events, searchQuery]);

  const hasFilteredSearch = searchQuery.trim().length > 0;
  const filteredEventsIsEmpty =
    !isLoading && !hasError && filteredEvents && !filteredEvents.length;

  const emptyStateHeading = hasFilteredSearch
    ? 'No matching events'
    : 'No Events yet!';
  const emptyStateDescription = hasFilteredSearch
    ? 'Try a different search or filter.'
    : "There isn't any event yet. Create one to get started!";

  return (
    <Box>
      <EventListing
        isLoading={isLoading}
        hasError={hasError}
        eventsIsEmpty={eventsIsEmpty || filteredEventsIsEmpty}
        events={filteredEvents}
        forAdmin
        emptyStateHeading={emptyStateHeading}
        emptyStateDescription={emptyStateDescription}
        emptyStateCta={hasFilteredSearch ? null : undefined}
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
