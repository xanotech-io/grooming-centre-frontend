import { http } from "../http";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const normalizeMaterial = (doc) => {
  if (!doc) return null;
  const uploader = doc.uploader ?? doc.uploadedBy;
  return {
    materialId: doc.id ?? doc.materialId,
    materialTitle: doc.materialTitle ?? doc.title,
    courseId: doc.course?.id ?? doc.courseId,
    courseName: doc.course?.title,
    moduleId: doc.module?.id ?? doc.moduleId,
    moduleName: doc.module?.title,
    lessonId: doc.lesson?.id ?? doc.lessonId,
    lessonName: doc.lesson?.title,
    materialType: doc.materialType,
    fileFormat: doc.fileFormat,
    fileName: doc.fileName ?? (doc.file
      ? decodeURIComponent(doc.file.split("/").pop().split("?")[0])
      : null),
    // API returns fileSize in MB — convert to bytes for the table's formatBytes()
    fileSize: doc.fileSize != null ? Math.round(doc.fileSize * 1024 * 1024) : null,
    file: doc.file,
    uploadLocation: doc.uploadLocation,
    accessibility: doc.accessibility,
    restrictionStatus: doc.restrictionStatus,
    status: doc.uploadStatus ?? doc.status,
    uploadedBy: uploader && typeof uploader === "object"
      ? `${uploader.firstName ?? ""} ${uploader.lastName ?? ""}`.trim()
      : null,
    uploadDate: doc.uploadDate ?? doc.createdAt,
  };
};

// ---------------------------------------------------------------------------
// TC10 – Admin: Upload Course Material
// POST /api/v1/course-materials-v2
// ---------------------------------------------------------------------------

export const adminUploadCourseMaterial = async (body) => {
  const formData = new FormData();
  formData.append("materialTitle", body.materialTitle);
  formData.append("courseId", body.courseId);
  formData.append("uploadLocation", body.uploadLocation);
  if (body.moduleId && body.moduleId !== "—") formData.append("moduleId", body.moduleId);
  if (body.lessonId) formData.append("lessonId", body.lessonId);
  if (body.accessibility) formData.append("accessibility", body.accessibility);
  formData.append("restrictionStatus", body.restrictionStatus || "ALLOWED");
  formData.append("file", body.file);

  const { data } = await http.post("/v1/course-materials-v2", formData);
  return {
    message: data?.message ?? "Material uploaded successfully",
    material: normalizeMaterial(data?.data),
  };
};

// ---------------------------------------------------------------------------
// TC10 – Admin: Get Upload KPI Statistics
// GET /api/v1/course-materials-v2/kpis
// ---------------------------------------------------------------------------

export const adminGetCourseMaterialKpis = async (courseId) => {
  const params = courseId ? { courseId } : {};
  const { data } = await http.get("/v1/course-materials-v2/kpis", { params });
  const d = data?.data ?? {};
  return {
    total: d.totalUploads ?? 0,
    successful: d.successfulUploads ?? 0,
    failed: d.failedUploads ?? 0,
    successRate: d.successRate ?? 0,
    totalStorageMb: d.totalStorageMb ?? 0,
    byMaterialType: d.byMaterialType ?? {},
    byUploadLocation: d.byUploadLocation ?? {},
  };
};

// ---------------------------------------------------------------------------
// TC10 – Admin: List Materials for a Course (paginated)
// GET /api/v1/course-materials-v2/course/{courseId}
// ---------------------------------------------------------------------------

export const adminGetAllCourseMaterials = async (params = {}) => {
  const { courseId, materialType, uploadLocation, search, page = 1, limit = 10 } = params;

  const query = { page, limit };
  if (search) query.search = search;
  if (materialType) query.materialType = materialType;
  if (uploadLocation) query.uploadLocation = uploadLocation;

  // Use the course-scoped endpoint when filtering by course, otherwise list all
  const path = courseId
    ? `/v1/course-materials-v2/course/${courseId}`
    : `/v1/course-materials-v2`;

  const { data } = await http.get(path, { params: query });
  const d = data?.data ?? {};
  return {
    materials: (d.materials ?? []).map(normalizeMaterial),
    pagination: {
      page: d.page ?? page,
      limit: d.limit ?? limit,
      totalItems: d.total ?? 0,
      totalPages: d.totalPages ?? 1,
    },
  };
};

// ---------------------------------------------------------------------------
// TC10 – Admin: List Materials for a Module
// GET /api/v1/course-materials-v2/module/{moduleId}
// ---------------------------------------------------------------------------

export const adminGetModuleMaterials = async (moduleId) => {
  const { data } = await http.get(`/v1/course-materials-v2/module/${moduleId}`);
  const d = data?.data ?? {};
  return {
    moduleId: d.moduleId,
    total: d.total ?? 0,
    materials: (d.materials ?? []).map(normalizeMaterial),
  };
};

// ---------------------------------------------------------------------------
// TC10 – Admin: Get Course Material by ID
// GET /api/v1/course-materials-v2/{materialId}
// ---------------------------------------------------------------------------

export const adminGetCourseMaterialById = async (materialId) => {
  const { data } = await http.get(`/v1/course-materials-v2/${materialId}`);
  return { material: normalizeMaterial(data?.data) };
};

// ---------------------------------------------------------------------------
// TC10 – Admin: Delete Course Material
// DELETE /api/v1/course-materials-v2/{materialId}
// ---------------------------------------------------------------------------

export const adminDeleteCourseMaterial = async (materialId) => {
  const { data } = await http.delete(`/v1/course-materials-v2/${materialId}`);
  return { message: data?.message ?? "Material deleted successfully" };
};

// ---------------------------------------------------------------------------
// Student-facing course materials
// ---------------------------------------------------------------------------

const MOCK_COURSE_MATERIALS = [
  {
    materialId: "MAT-001",
    materialTitle: "Week 1 Lecture Notes",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    fileFormat: "PDF",
    downloadPermission: true,
    uploadedBy: "Instructor-002",
    uploadDate: "2025-10-15T10:00:00Z",
    fileSize: 2048000,
    accessLevel: "Learner",
    downloadCount: 34,
    repositoryLink:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    status: "Available",
    instructor: {
      id: "INST-002",
      firstName: "Jane",
      lastName: "Smith",
      profilePics: "",
      title: "Instructor",
    },
  },
  {
    materialId: "MAT-002",
    materialTitle: "Soil Science Presentation",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    fileFormat: "PPT",
    downloadPermission: true,
    uploadedBy: "Instructor-002",
    uploadDate: "2025-10-16T11:00:00Z",
    fileSize: 5120000,
    accessLevel: "Learner",
    downloadCount: 21,
    repositoryLink:
      "https://file-examples.com/storage/fe6f7d31f6c8a4f251f9f95/2017/08/file_example_PPT_500kB.ppt",
    status: "Available",
    instructor: {
      id: "INST-002",
      firstName: "Jane",
      lastName: "Smith",
      profilePics: "",
      title: "Instructor",
    },
  },
  {
    materialId: "MAT-003",
    materialTitle: "Crop Management Guide",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    fileFormat: "DOCX",
    downloadPermission: false,
    uploadedBy: "Instructor-002",
    uploadDate: "2025-10-17T09:00:00Z",
    fileSize: 1024000,
    accessLevel: "Learner",
    downloadCount: 0,
    repositoryLink: "",
    status: "View Only",
    restrictionReason: "Word documents are not permitted in course download",
    instructor: {
      id: "INST-002",
      firstName: "Jane",
      lastName: "Smith",
      profilePics: "",
      title: "Instructor",
    },
  },
  {
    materialId: "MAT-004",
    materialTitle: "Irrigation Video",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    fileFormat: "MP4",
    downloadPermission: false,
    uploadedBy: "Instructor-002",
    uploadDate: "2025-10-18T14:00:00Z",
    fileSize: 52428800,
    accessLevel: "Learner",
    downloadCount: 0,
    repositoryLink: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    status: "Streaming Only",
    restrictionReason: "Video streaming only; download restricted",
    instructor: {
      id: "INST-002",
      firstName: "Jane",
      lastName: "Smith",
      profilePics: "",
      title: "Instructor",
    },
  },
];

const toCardMaterial = (material) => ({
  id: material.materialId,
  materialId: material.materialId,
  courseId: material.courseId,
  title: material.materialTitle,
  file: material.repositoryLink,
  fileExtension: material.fileFormat?.toLowerCase(),
  fileFormat: material.fileFormat,
  downloadPermission: material.downloadPermission,
  restrictionReason: material.restrictionReason,
  status: material.status,
  uploadDate: material.uploadDate,
  uploadedBy: material.uploadedBy,
  downloadCount: material.downloadCount,
  instructor: material.instructor,
});

/**
 * 1.14-TC21 Downloadable Content
 * GET /v2/courses/{courseId}/materials
 */
export const userGetCourseMaterials = async (courseId, params = {}) => {
  try {
    const { data } = await http.get(`/v2/courses/${courseId}/materials`, { params });
    const rows = data?.data?.rows ?? data?.rows ?? data?.materials ?? [];
    return {
      materials: rows.map(toCardMaterial),
      rows,
      count: rows.length,
      page: Number(params.page || 1),
      limit: Number(params.limit || 10),
      totalPages: data?.data?.totalPages ?? 1,
      showingDocumentsCount: rows.length,
      totalDocumentsCount: data?.data?.count ?? rows.length,
    };
  } catch {
    const formats = (params.format || "")
      .split(",")
      .map((v) => v.trim().toUpperCase())
      .filter(Boolean);

    const filtered = MOCK_COURSE_MATERIALS.filter((m) => {
      if (m.courseId !== courseId) return false;
      if (formats.length && !formats.includes((m.fileFormat || "").toUpperCase())) return false;
      if ((params.downloadableOnly === true || params.downloadableOnly === "true") && !m.downloadPermission) return false;
      return true;
    });

    return {
      materials: filtered.map(toCardMaterial),
      rows: filtered,
      count: filtered.length,
      page: Number(params.page || 1),
      limit: Number(params.limit || 10),
      totalPages: 1,
      showingDocumentsCount: filtered.length,
      totalDocumentsCount: filtered.length,
    };
  }
};

/**
 * 1.14-TC21 Download Material
 * GET /v2/courses/{courseId}/materials/{materialId}/download
 */
export const userDownloadCourseMaterial = async (courseId, materialId) => {
  try {
    const { data } = await http.get(`/v2/courses/${courseId}/materials/${materialId}/download`);
    return data?.data ?? data;
  } catch {
    const material = MOCK_COURSE_MATERIALS.find(
      (m) => m.courseId === courseId && m.materialId === materialId,
    );
    if (!material || !material.downloadPermission) {
      return {
        success: false,
        message: material?.restrictionReason || "Download not permitted",
        downloadUrl: null,
      };
    }
    return {
      success: true,
      message: "Material download link generated",
      downloadUrl: material.repositoryLink,
    };
  }
};
