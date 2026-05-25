import React, { useCallback, useEffect, useState } from "react";
import { Route } from "react-router-dom";
import { Box, useDisclosure, useToast } from "@chakra-ui/react";
import { useFetch } from "../../../../hooks";
import {
  adminGetCourseRoster,
  adminExportCourseRoster,
  adminGetCourseListing,
} from "../../../../services";

import RosterHeader from "./components/RosterHeader";
import RosterStats from "./components/RosterStats";
import RosterFilters from "./components/RosterFilters";
import RosterTable from "./components/RosterTable";
import ExportModal from "./components/ExportModal";

const EMPTY_SUMMARY = {
  totalStudents: 0,
  enrolled: 0,
  pending: 0,
  completed: 0,
  averageProgress: 0,
};

const CourseRosterPage = () => {
  const toast = useToast();

  const { resource, handleFetchResource: fetchRoster } = useFetch();
  const exportModal = useDisclosure();

  const [courseId, setCourseId] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  useEffect(() => {
    setCoursesLoading(true);
    adminGetCourseListing({ limit: 200 })
      .then(({ courses: list }) => setCourses(list))
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, []);

  const fetcher = useCallback(async () => {
    if (!courseId) return { roster: null, pagination: {} };
    return adminGetCourseRoster(courseId, { page, limit: 10 });
  }, [courseId, page]);

  useEffect(() => {
    fetchRoster({ fetcher });
  }, [fetchRoster, fetcher]);

  const roster = resource.data?.roster ?? null;
  const pagination = resource.data?.pagination ?? {};

  const allStudents = roster?.students ?? [];

  const filteredStudents = allStudents.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q);
    const matchesStatus = !status || s.enrollmentStatus === status;
    return matchesSearch && matchesStatus;
  });

  const summary = roster?.summary ?? EMPTY_SUMMARY;

  const handleCourseChange = (val) => {
    setCourseId(val);
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const handleSearchChange = (val) => { setSearch(val); setPage(1); };
  const handleStatusChange = (val) => { setStatus(val); setPage(1); };
  const handleReset = () => { setSearch(""); setStatus(""); setPage(1); };

  const handleExport = async (body) => {
    if (!courseId) return;
    setIsExporting(true);
    try {
      const { exportRecord } = await adminExportCourseRoster(courseId, body);
      toast({
        title: "Export successful",
        description: `Roster exported as ${exportRecord.format}. Export ID: ${exportRecord.exportId}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      exportModal.onClose();
    } catch {
      toast({
        title: "Export failed",
        description: "Unable to export the roster. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box marginX="22px" marginY="20px">
      <RosterHeader
        courseName={roster?.courseName}
        semester={roster?.semester}
        instructorName={roster?.instructor?.name}
        onExportClick={exportModal.onOpen}
      />

      {roster && <RosterStats summary={summary} />}

      <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" overflow="hidden">
        <RosterFilters
          courseId={courseId}
          onCourseChange={handleCourseChange}
          courses={courses}
          coursesLoading={coursesLoading}
          search={search}
          onSearchChange={handleSearchChange}
          status={status}
          onStatusChange={handleStatusChange}
          onReset={handleReset}
        />

        <RosterTable
          students={filteredStudents}
          loading={resource.loading}
          error={resource.err}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
          courseSelected={!!courseId}
        />
      </Box>

      <ExportModal
        isOpen={exportModal.isOpen}
        onClose={exportModal.onClose}
        courseId={courseId}
        courseName={roster?.courseName}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </Box>
  );
};

export const CourseRosterPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CourseRosterPage {...props} />} />
);

export default CourseRosterPage;
