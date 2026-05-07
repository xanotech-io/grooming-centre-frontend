/* eslint-disable no-unused-vars */
import { Grid, GridItem } from "@chakra-ui/layout";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { Box } from "@chakra-ui/layout";
import { CourseBoxCard, Button } from "../../../components";
import { EmptyState } from "../../../layouts";
import CoursesPagination from "../../../components/Pagination/CoursesPagination";
import { useEffect, useState } from "react";

export const CardGridLayout = ({ cardContents }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(12);

  const IsVideo = /videos/i.test(window.location.pathname);
  const IsAudio = /audio/i.test(window.location.pathname);
  const IsPdf = /books/i.test(window.location.pathname);

  const filteredData = cardContents?.data?.filter((course) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      course?.title?.toLowerCase().includes(q) ||
      course?.name?.toLowerCase().includes(q) ||
      course?.description?.toLowerCase().includes(q) ||
      (typeof course?.instructor === "string" && course.instructor.toLowerCase().includes(q))
    );
  });

  const cardContentsIsEmpty =
    !cardContents.loading &&
    !cardContents.err &&
    cardContents.data &&
    !cardContents.data?.length;

  const noSearchResults =
    !cardContents.loading &&
    !cardContents.err &&
    cardContents.data?.length > 0 &&
    filteredData?.length === 0;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const pageLength = filteredData?.length;

  const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem);

  const npages = Math.ceil(pageLength / itemsPerPage);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      <Box px={5} pt={4} pb={2}>
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </InputLeftElement>
          <Input
            placeholder={`Search ${IsVideo ? "videos" : IsAudio ? "audio" : IsPdf ? "books" : "courses"}...`}
            value={searchQuery}
            onChange={handleSearch}
            bg="white"
            borderRadius="md"
            borderColor="gray.300"
            _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
          />
        </InputGroup>
      </Box>

      {cardContentsIsEmpty && (
        <EmptyState
          width="100"
          cta={<Button link="/dashboard">Return to dashboard</Button>}
          heading={`No ${
            IsVideo ? "Videos" : IsAudio ? "Audio" : IsPdf ? "Books" : "Courses"
          } Available`}
          description={`${
            IsVideo
              ? "There are no videos in your library"
              : IsPdf
              ? "There are no books in your library"
              : IsAudio
              ? "There are no audio files in your library"
              : "Your department have no assigned courses just yet"
          }`}
        />
      )}

      {noSearchResults && (
        <EmptyState
          width="100"
          heading="No results found"
          description={`No ${IsVideo ? "videos" : IsAudio ? "audio" : IsPdf ? "books" : "courses"} match "${searchQuery}"`}
        />
      )}

      <Grid
        className="card-grid-layout"
        templateColumns={{
          base: "repeat(1, 1fr)",

          tablet: "repeat(3, 1fr)",
          laptop: "repeat(4, 1fr)",
          // "laptop-l": "repeat(5, 1fr)",
          "4k": "repeat(6, 1fr)",
        }}
        overflowX={{
          base: "hidden",
          "mobile-m": "scroll",
          "mobile-l": "hidden",
        }}
        overflowY="hidden"
        columnGap={{ base: "20px", laptop: "30px" }}
        rowGap={{ base: "40px", laptop: "50px" }}
        padding={5}
      >
        {cardContents.err && (
          <GridItem
            colSpan={6}
            width="100%"
            height="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <EmptyState
              // cta={<Button onClick={handleTryAgain}>Try Again</Button>}
              heading="Oops An Error Occurred"
              description="An unexpected error occurred, please try again later"
            />
          </GridItem>
        )}

        {cardContents.loading &&
          Array(8)
            .fill("")
            .map((_, index) => <CourseBoxCard key={index} isLoading />)}

        {currentItems?.map((cardContent, index) => (
          <CourseBoxCard
            key={index}
            {...cardContent}
            isLoading={cardContent.loading}
          />
        ))}
      </Grid>
      <CoursesPagination
        itemsPerPage={itemsPerPage}
        pageLength={pageLength}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        npages={npages}
      />
    </>
  );
};
