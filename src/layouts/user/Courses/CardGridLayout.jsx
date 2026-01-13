import { Grid, GridItem } from "@chakra-ui/layout";
import { CourseBoxCard, Button } from "../../../components";
import { EmptyState } from "../../../layouts";
import CoursesPagination from "../../../components/Pagination/CoursesPagination";
import { useEffect, useState } from "react";

export const CardGridLayout = ({ cardContents }) => {
  const cardContentsIsEmpty =
    !cardContents.loading &&
    !cardContents.err &&
    cardContents.data &&
    !cardContents.data?.length;

  const IsVideo = /videos/i.test(window.location.pathname);

  const IsAudio = /audio/i.test(window.location.pathname);

  const IsPdf = /books/i.test(window.location.pathname);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(4);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const pageLength = cardContents?.data?.length;

  const currentItems = cardContents?.data?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const npages = Math.ceil(pageLength / itemsPerPage);

  return (
    <>
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
