import React, { useCallback, useEffect, useState } from "react";
import { Route } from "react-router-dom";
import { Box, useDisclosure, useToast } from "@chakra-ui/react";
import { useFetch } from "../../../../hooks";
import {
  adminGetAllCourseMaterials,
  adminDeleteCourseMaterial,
} from "../../../../services";

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
  const [materialType, setMaterialType] = useState("");
  const [uploadLocation, setUploadLocation] = useState("");
  const [status, setStatus] = useState("");

  const uploadModal = useDisclosure();
  const viewModal = useDisclosure();
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const fetcher = useCallback(async () => {
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (materialType) params.materialType = materialType;
    if (uploadLocation) params.uploadLocation = uploadLocation;
    if (status) params.status = status;
    return adminGetAllCourseMaterials(params);
  }, [page, search, materialType, uploadLocation, status]);

  useEffect(() => {
    fetchMaterials({ fetcher });
  }, [fetchMaterials, fetcher]);

  const refresh = () => fetchMaterials({ fetcher });

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
  const handleMaterialTypeChange = (val) => { setMaterialType(val); setPage(1); };
  const handleUploadLocationChange = (val) => { setUploadLocation(val); setPage(1); };
  const handleStatusChange = (val) => { setStatus(val); setPage(1); };
  const handleReset = () => {
    setSearch("");
    setMaterialType("");
    setUploadLocation("");
    setStatus("");
    setPage(1);
  };

  const materials = resource.data?.materials ?? [];
  const pagination = resource.data?.pagination ?? {};
  const stats = resource.data?.stats ?? { total: 0, successful: 0, failed: 0, audio: 0, word: 0 };

  return (
    <Box marginX="22px" marginY="20px">
      <MaterialsHeader stats={stats} onUploadClick={uploadModal.onOpen} />

      <Box bg="white" borderRadius="8px" border="1px solid #E2E8F0" overflow="hidden">
        <MaterialsFilters
          search={search}
          onSearchChange={handleSearchChange}
          materialType={materialType}
          onMaterialTypeChange={handleMaterialTypeChange}
          uploadLocation={uploadLocation}
          onUploadLocationChange={handleUploadLocationChange}
          status={status}
          onStatusChange={handleStatusChange}
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
    </Box>
  );
};

export const CourseMaterialUploadPageRoute = ({ ...rest }) => (
  <Route {...rest} render={(props) => <CourseMaterialUploadPage {...props} />} />
);

export default CourseMaterialUploadPage;
