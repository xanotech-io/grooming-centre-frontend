// import { http } from "../http";

// ---------------------------------------------------------------------------
// MOCK DATA – Admin Course Material Upload (TC10)
// ---------------------------------------------------------------------------

const MOCK_ADMIN_MATERIALS = [
  {
    materialId: "MAT-101",
    materialTitle: "Week 1 Introduction to Agriculture",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    moduleId: "MOD-001",
    moduleName: "Module 1 – Soil Science",
    materialType: "PDF",
    fileFormat: "PDF",
    fileName: "week1_intro.pdf",
    fileSize: 2516582,
    uploadLocation: "COURSE_MODULE",
    accessibility: "DOWNLOADABLE",
    restrictionStatus: "ALLOWED",
    status: "Successful",
    uploadedBy: "Instructor A",
    uploadDate: "2026-05-10T10:30:00Z",
  },
  {
    materialId: "MAT-102",
    materialTitle: "Soil Science Presentation Slides",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    moduleId: "MOD-001",
    moduleName: "Module 1 – Soil Science",
    materialType: "PPT",
    fileFormat: "PPT",
    fileName: "soil_science_slides.ppt",
    fileSize: 5242880,
    uploadLocation: "LESSON",
    accessibility: "VIEWABLE",
    restrictionStatus: "ALLOWED",
    status: "Successful",
    uploadedBy: "Instructor A",
    uploadDate: "2026-05-11T09:00:00Z",
  },
  {
    materialId: "MAT-103",
    materialTitle: "Irrigation Techniques – Training Video",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    moduleId: "MOD-002",
    moduleName: "Module 2 – Water Management",
    materialType: "VIDEO",
    fileFormat: "MP4",
    fileName: "irrigation_training.mp4",
    fileSize: 52428800,
    uploadLocation: "COURSE_MODULE",
    accessibility: "VIEWABLE",
    restrictionStatus: "ALLOWED",
    status: "Successful",
    uploadedBy: "Instructor B",
    uploadDate: "2026-05-12T14:00:00Z",
  },
  {
    materialId: "MAT-104",
    materialTitle: "Soil Training Audio – Field Guide",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    moduleId: "MOD-001",
    moduleName: "Module 1 – Soil Science",
    materialType: "AUDIO",
    fileFormat: "MP3",
    fileName: "soil_training_audio.mp3",
    fileSize: 3145728,
    uploadLocation: "LESSON",
    accessibility: "DOWNLOADABLE",
    restrictionStatus: "ALLOWED",
    status: "Successful",
    uploadedBy: "Instructor A",
    uploadDate: "2026-05-13T08:30:00Z",
  },
  {
    materialId: "MAT-105",
    materialTitle: "Crop Management Reference Guide",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    moduleId: "MOD-003",
    moduleName: "Module 3 – Crop Management",
    materialType: "WORD",
    fileFormat: "DOCX",
    fileName: "crop_management_guide.docx",
    fileSize: 1048576,
    uploadLocation: "COURSE_MODULE",
    accessibility: "DOWNLOADABLE",
    restrictionStatus: "ALLOWED",
    status: "Successful",
    uploadedBy: "Instructor B",
    uploadDate: "2026-05-14T11:00:00Z",
  },
  {
    materialId: "MAT-106",
    materialTitle: "Farm Layout Diagram",
    courseId: "AGR101",
    courseName: "Agriculture Fundamentals",
    moduleId: "MOD-002",
    moduleName: "Module 2 – Water Management",
    materialType: "IMAGE",
    fileFormat: "PNG",
    fileName: "farm_layout.png",
    fileSize: 768000,
    uploadLocation: "LIBRARY_SECTION",
    accessibility: "VIEWABLE",
    restrictionStatus: "ALLOWED",
    status: "Successful",
    uploadedBy: "Admin",
    uploadDate: "2026-05-15T13:00:00Z",
  },
  {
    materialId: "MAT-107",
    materialTitle: "Fertilisation Audio Lecture",
    courseId: "CS101",
    courseName: "Computer Science Basics",
    moduleId: "MOD-001",
    moduleName: "Module 1 – Introduction",
    materialType: "AUDIO",
    fileFormat: "WAV",
    fileName: "fertilisation_lecture.wav",
    fileSize: 8388608,
    uploadLocation: "LESSON",
    accessibility: "VIEWABLE",
    restrictionStatus: "ALLOWED",
    status: "Successful",
    uploadedBy: "Instructor C",
    uploadDate: "2026-05-16T10:00:00Z",
  },
  {
    materialId: "MAT-108",
    materialTitle: "Lab Report Template",
    courseId: "CS101",
    courseName: "Computer Science Basics",
    moduleId: "MOD-002",
    moduleName: "Module 2 – Lab Sessions",
    materialType: "WORD",
    fileFormat: "DOC",
    fileName: "lab_report_template.doc",
    fileSize: 524288,
    uploadLocation: "COURSE_MODULE",
    accessibility: "DOWNLOADABLE",
    restrictionStatus: "ALLOWED",
    status: "Failed",
    failureReason: "Upload failed due to format restriction",
    uploadedBy: "Instructor C",
    uploadDate: "2026-05-17T15:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// TC10 – Admin: Upload Course Material
// Closest endpoint: POST /api/v2/users/{id}/documents (adapted for materials)
// ---------------------------------------------------------------------------

/**
 * Upload a course material (PDF, PPT, VIDEO, IMAGE, AUDIO, WORD)
 * @param {{ courseId: string, moduleId: string, materialTitle: string, materialType: string, uploadLocation: string, accessibility: string, fileFormat: string, fileName: string, fileSize: number, file: File }} body
 * @returns {Promise<{ message: string, material: object }>}
 */
export const adminUploadCourseMaterial = async (body) => {
  // TODO: replace with real call
  // const formData = new FormData();
  // formData.append('file', body.file);
  // formData.append('courseId', body.courseId);
  // formData.append('moduleId', body.moduleId);
  // formData.append('materialTitle', body.materialTitle);
  // formData.append('materialType', body.materialType);
  // formData.append('uploadLocation', body.uploadLocation);
  // formData.append('accessibility', body.accessibility);
  // const { data: { message, data } } = await http.post(`/api/v2/users/${userId}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  // return { message, material: data };

  const newMaterial = {
    materialId: `MAT-${Date.now()}`,
    materialTitle: body.materialTitle,
    courseId: body.courseId,
    courseName: "Selected Course",
    moduleId: body.moduleId,
    moduleName: body.moduleName || body.moduleId,
    materialType: body.materialType,
    fileFormat: body.fileFormat,
    fileName: body.fileName,
    fileSize: body.fileSize,
    uploadLocation: body.uploadLocation,
    accessibility: body.accessibility,
    restrictionStatus: "ALLOWED",
    status: "Successful",
    uploadedBy: "Current User",
    uploadDate: new Date().toISOString(),
  };
  MOCK_ADMIN_MATERIALS.unshift(newMaterial);
  return { message: "Material uploaded successfully", material: newMaterial };
};

// ---------------------------------------------------------------------------
// TC10 – Admin: Get All Course Materials
// Closest endpoint: GET /api/v2/admin/documents/pending (adapted)
// ---------------------------------------------------------------------------

/**
 * Get all uploaded course materials with filtering
 * @param {{ page?: number, limit?: number, search?: string, materialType?: string, uploadLocation?: string, status?: string, courseId?: string }} params
 * @returns {Promise<{ materials: Array, pagination: object, stats: object }>}
 */
export const adminGetAllCourseMaterials = async (params = {}) => {
  // TODO: replace with real call
  // const { data: { data } } = await http.get('/api/v2/admin/documents/pending', { params });
  // return { materials: data.rows, pagination: {...}, stats: data.stats };

  let result = [...MOCK_ADMIN_MATERIALS];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (m) =>
        m.materialTitle.toLowerCase().includes(q) ||
        m.fileName.toLowerCase().includes(q),
    );
  }
  if (params.materialType) {
    result = result.filter((m) => m.materialType === params.materialType);
  }
  if (params.uploadLocation) {
    result = result.filter((m) => m.uploadLocation === params.uploadLocation);
  }
  if (params.status) {
    result = result.filter((m) => m.status === params.status);
  }
  if (params.courseId) {
    result = result.filter((m) => m.courseId === params.courseId);
  }

  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  const all = MOCK_ADMIN_MATERIALS;
  return {
    materials: paginated,
    pagination: {
      page,
      limit,
      totalItems: result.length,
      totalPages: Math.ceil(result.length / limit),
    },
    stats: {
      total: all.length,
      successful: all.filter((m) => m.status === "Successful").length,
      failed: all.filter((m) => m.status === "Failed").length,
      audio: all.filter((m) => m.materialType === "AUDIO").length,
      word: all.filter((m) => m.materialType === "WORD").length,
    },
  };
};

// ---------------------------------------------------------------------------
// TC10 – Admin: Get Course Material by ID
// Closest endpoint: GET /api/v2/users/{id}/documents/{uploadId}
// ---------------------------------------------------------------------------

/**
 * Get a specific course material by its ID
 * @param {string} materialId
 * @returns {Promise<{ material: object }>}
 */
export const adminGetCourseMaterialById = async (materialId) => {
  // TODO: replace with real call
  // const { data: { data } } = await http.get(`/api/v2/users/${userId}/documents/${materialId}`);
  // return { material: data };

  const material =
    MOCK_ADMIN_MATERIALS.find((m) => m.materialId === materialId) ||
    MOCK_ADMIN_MATERIALS[0];
  return { material: { ...material, materialId } };
};

// ---------------------------------------------------------------------------
// TC10 – Admin: Delete Course Material
// Endpoint: DELETE /api/v2/documents/{id}
// ---------------------------------------------------------------------------

/**
 * Permanently delete a course material
 * @param {string} materialId
 * @returns {Promise<{ message: string }>}
 */
export const adminDeleteCourseMaterial = async (materialId) => {
  // TODO: replace with real call
  // const { data: { message } } = await http.delete(`/api/v2/documents/${materialId}`);
  // return { message };

  const idx = MOCK_ADMIN_MATERIALS.findIndex((m) => m.materialId === materialId);
  if (idx !== -1) MOCK_ADMIN_MATERIALS.splice(idx, 1);
  return { message: "Material deleted successfully" };
};

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
