import React, { useCallback, useEffect, useState } from "react";
import { Route } from "react-router-dom";
import { Box, BreadcrumbItem, Flex, useDisclosure, useToast } from "@chakra-ui/react";
import { useFetch } from "../../../../hooks";
import {
  adminGetAllCourseMaterials,
  adminDeleteCourseMaterial,
  adminGetCourseMaterialKpis,
  adminGetCourseListing,
} from "../../../../services";

import { Breadcrumb, Link } from "../../../../components";
import { AdminMainAreaWrapper } from "../../../../layouts/admin/MainArea/Wrapper";
import MaterialsHeader from "./components/MaterialsHeader";
import MaterialsFilters from "./components/MaterialsFilters";
import MaterialsTable from "./components/MaterialsTable";
import UploadMaterialModal from "./components/UploadMaterialModal";
import ViewMaterialModal from "./components/ViewMaterialModal";

const CourseMaterialUploadPage = () => {
  const toast = useToast();

  const { resource, handleFetchResource: fetchMaterials } = useFetch();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [uploadLocation, setUploadLocation] = useState("");
  const [courses, setCourses] = useState([]);
  const [kpis, setKpis] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    successRate: 0,
    totalStorageMb: 0,
  });

  const uploadModal = useDisclosure();
  const viewModal = useDisclosure();
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    adminGetCourseListing({ limit: 500 })
      .then((res) => setCourses(res.courses || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    adminGetCourseMaterialKpis(courseId || undefined)
      .then(setKpis)
      .catch(() => {});
  }, [courseId]);

  const fetcher = useCallback(async () => {
    const params = { page, limit: 10, courseId };
    if (search) params.search = search;
    if (materialType) params.materialType = materialType;
    if (uploadLocation) params.uploadLocation = uploadLocation;
    return adminGetAllCourseMaterials(params);
  }, [page, search, courseId, materialType, uploadLocation]);

  useEffect(() => {
    fetchMaterials({ fetcher });
  }, [fetchMaterials, fetcher]);

  const refresh = () => {
    fetchMaterials({ fetcher });
    adminGetCourseMaterialKpis(courseId || undefined)
      .then(setKpis)
      .catch(() => {});
  };

  const handleView = (mat) => {
    setSelectedMaterial(mat);
    viewModal.onOpen();
  };

  const handleDelete = async (mat) => {
    if (!window.confirm(`Delete "${mat.materialTitle}"? This cannot be undone.`)) return;
    try {
      await adminDeleteCourseMaterial(mat.materialId);
      toast({ title: "Material deleted", status: "success", duration: 3000, isClosable: true });
      refresh();
    } catch {
      toast({ title: "Failed to delete material", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleSearchChange = (val) => { setSearch(val); setPage(1); };
  const handleCourseIdChange = (val) => { setCourseId(val); setPage(1); };
  const handleMaterialTypeChange = (val) => { setMaterialType(val); setPage(1); };
  const handleUploadLocationChange = (val) => { setUploadLocation(val); setPage(1); };
  const handleReset = () => {
    setSearch("");
    setCourseId("");
    setMaterialType("");
    setUploadLocation("");
    setPage(1);
  };

  const materials = resource.data?.materials ?? [];
  const pagination = resource.data?.pagination ?? {};

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Course Materials</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>

      <MaterialsHeader stats={kpis} onUploadClick={uploadModal.onOpen} />

      <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" overflow="hidden">
        <MaterialsFilters
          search={search}
          onSearchChange={handleSearchChange}
          courses={courses}
          courseId={courseId}
          onCourseIdChange={handleCourseIdChange}
          materialType={materialType}
          onMaterialTypeChange={handleMaterialTypeChange}
          uploadLocation={uploadLocation}
          onUploadLocationChange={handleUploadLocationChange}
          onReset={handleReset}
        />

        <MaterialsTable
          materials={materials}
          loading={resource.loading}
          error={resource.err}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
          onView={handleView}
          onDelete={handleDelete}
        />
      </Box>

      <UploadMaterialModal
        isOpen={uploadModal.isOpen}
        onClose={uploadModal.onClose}
        onSuccess={refresh}
      />

      <ViewMaterialModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.onClose}
        material={selectedMaterial}
      />
    </AdminMainAreaWrapper>
  );
};

export const CourseMaterialUploadPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CourseMaterialUploadPage {...props} />} />
);

export default CourseMaterialUploadPage;
