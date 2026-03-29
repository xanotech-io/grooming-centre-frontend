// import { http } from "../http";

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
    repositoryLink:
      "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
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
 * GET /api/v2/courses/{courseId}/materials
 */
export const userGetCourseMaterials = async (courseId, params = {}) => {
  // const { data: { data } } = await http.get(`/v2/courses/${courseId}/materials`, { params });
  // return data;

  const formats = (params.format || "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);

  const filteredByCourse = MOCK_COURSE_MATERIALS.filter(
    (material) => material.courseId === courseId,
  );

  const filteredByFormat = formats.length
    ? filteredByCourse.filter((material) =>
        formats.includes((material.fileFormat || "").toUpperCase()),
      )
    : filteredByCourse;

  const filteredMaterials =
    params.downloadableOnly === true || params.downloadableOnly === "true"
      ? filteredByFormat.filter((material) => material.downloadPermission)
      : filteredByFormat;

  const rows = filteredMaterials;

  return {
    materials: rows.map(toCardMaterial),
    rows,
    count: rows.length,
    page: Number(params.page || 1),
    limit: Number(params.limit || 10),
    totalPages: 1,
    showingDocumentsCount: rows.length,
    totalDocumentsCount: rows.length,
  };
};

/**
 * 1.14-TC21 Download Material
 * GET /api/v2/courses/{courseId}/materials/{materialId}/download
 */
export const userDownloadCourseMaterial = async (courseId, materialId) => {
  // const { data } = await http.get(`/v2/courses/${courseId}/materials/${materialId}/download`);
  // return data;

  const material = MOCK_COURSE_MATERIALS.find(
    (item) => item.courseId === courseId && item.materialId === materialId,
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
};
