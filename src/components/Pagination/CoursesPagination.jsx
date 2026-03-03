import React, { useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { Button } from "../Button/Button";

const CoursesPagination = ({
  itemsPerPage,
  pageLength,
  setCurrentPage,
  currentPage,
  npages,
}) => {
  const pages = [];
  const [active, setActive] = useState(false);
  const [pageNum, setPageNum] = useState("");
  for (let i = 1; i <= Math.ceil(pageLength / itemsPerPage); i++) {
    pages.push(i);
  }

  const handlePrevious = () => {
    setCurrentPage(currentPage === 1 ? 1 : currentPage - 1);
    setActive(true);
    setPageNum(pageNum === 1 ? 1 : pageNum - 1);
  };

  const handleNext = () => {
    setCurrentPage(currentPage === npages ? npages : currentPage + 1);
    setPageNum(pageNum === npages ? npages : pageNum + 1);
    setActive(true);
  };

  const handlePageChange = (e, num) => {
    setActive(true);
    setPageNum(num);
    setCurrentPage(Number(e.target.id));
  };

  useEffect(() => {
    setActive(true);
    setPageNum(1);
  }, []);

  const renderPageNumbers = pages.map((number) => {
    return (
      <p
        className={`${
          active && pageNum === number ? "course-pagination_active" : ""
        }`}
        onClick={(e) => handlePageChange(e, number)}
        key={number}
        id={number}
      >
        {number}
      </p>
    );
  });

  return (
    <div className="course-pagination">
      <Button asIcon onClick={handlePrevious}>
        <BiChevronLeft />
      </Button>
      <div className="course-pagination_num">{renderPageNumbers}</div>
      <Button asIcon onClick={handleNext}>
        <BiChevronRight />
      </Button>
    </div>
  );
};

export default CoursesPagination;
