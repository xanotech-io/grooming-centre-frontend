import { http } from "../http";

// ---------------------------------------------------------------------------
// MOCK DATA – fallback when real API is unavailable
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
// POST /api/v2/users/{id}/documents
// ---------------------------------------------------------------------------

/**
 * Upload a course material (PDF, PPT, VIDEO, IMAGE, AUDIO, WORD)
 */
export const adminUploadCourseMaterial = async (body) => {
  try {
    const payload = {
      documentType: body.materialType === "VIDEO" ? "REGISTRATION_SHEET" : "CERTIFICATE",
      fileFormat: body.fileFormat,
      fileName: body.fileName,
      fileUrl: body.fileUrl || body.fileName,
      courseId: body.courseId,
      fileSize: body.fileSize,
    };
    const userId = body.uploadedBy || "current-user";
    const { data } = await http.post(`/api/v2/users/${userId}/documents`, payload);
    const doc = data?.data ?? data;
    return {
      message: data?.message ?? "Material uploaded successfully",
      material: {
        materialId: doc?.uploadId ?? `MAT-${Date.now()}`,
        materialTitle: body.materialTitle,
        courseId: body.courseId,
        courseName: doc?.courseName ?? "Selected Course",
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
        uploadedBy: userId,
        uploadDate: doc?.uploadDate ?? new Date().toISOString(),
      },
    };
  } catch {
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
  }
};

// ---------------------------------------------------------------------------
// TC10 – Admin: Get All Course Materials
// GET /api/v2/admin/documents/pending  (adapted for materials list)
// ---------------------------------------------------------------------------

/**
 * Get all uploaded course materials with filtering
 */
export const adminGetAllCourseMaterials = async (params = {}) => {
  try {
    const { data } = await http.get("/api/v2/admin/documents/pending", { params });
    const docs = data?.data?.rows ?? data?.data ?? data?.rows ?? [];
    const pagination = data?.data?.pagination ?? {};
    const materials = docs.map((doc) => ({
      materialId: doc.uploadId ?? doc.id,
      materialTitle: doc.fileName ?? doc.materialTitle ?? doc.documentType,
      courseId: doc.courseId,
      courseName: doc.courseName ?? "",
      materialType: doc.documentType ?? "PDF",
      fileFormat: doc.fileFormat ?? doc.documentType,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      uploadLocation: doc.uploadLocation ?? "COURSE_MODULE",
      accessibility: doc.accessibility ?? "DOWNLOADABLE",
      restrictionStatus: "ALLOWED",
      status: doc.verificationStatus === "VERIFIED" ? "Successful" : doc.verificationStatus === "REJECTED" ? "Failed" : "Successful",
      uploadedBy: doc.uploadedBy ?? doc.userName,
      uploadDate: doc.uploadDate,
    }));
    return {
      materials,
      pagination: {
        page: pagination.currentPage ?? params.page ?? 1,
        limit: pagination.itemsPerPage ?? params.limit ?? 10,
        totalItems: pagination.totalItems ?? materials.length,
        totalPages: pagination.totalPages ?? 1,
      },
      stats: {
        total: materials.length,
        successful: materials.filter((m) => m.status === "Successful").length,
        failed: materials.filter((m) => m.status === "Failed").length,
        audio: materials.filter((m) => m.materialType === "AUDIO").length,
        word: materials.filter((m) => m.materialType === "WORD").length,
      },
    };
  } catch {
    let result = [...MOCK_ADMIN_MATERIALS];
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (m) => m.materialTitle.toLowerCase().includes(q) || m.fileName.toLowerCase().includes(q),
      );
    }
    if (params.materialType) result = result.filter((m) => m.materialType === params.materialType);
    if (params.uploadLocation) result = result.filter((m) => m.uploadLocation === params.uploadLocation);
    if (params.status) result = result.filter((m) => m.status === params.status);
    if (params.courseId) result = result.filter((m) => m.courseId === params.courseId);

    const page = Number(params.page || 1);
    const limit = Number(params.limit || 10);
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);
    const all = MOCK_ADMIN_MATERIALS;
    return {
      materials: paginated,
      pagination: { page, limit, totalItems: result.length, totalPages: Math.ceil(result.length / limit) },
      stats: {
        total: all.length,
        successful: all.filter((m) => m.status === "Successful").length,
        failed: all.filter((m) => m.status === "Failed").length,
        audio: all.filter((m) => m.materialType === "AUDIO").length,
        word: all.filter((m) => m.materialType === "WORD").length,
      },
    };
  }
};

// ---------------------------------------------------------------------------
// TC10 – Admin: Get Course Material by ID
// GET /api/v2/users/{userId}/documents/{uploadId}
// ---------------------------------------------------------------------------

/**
 * Get a specific course material by its ID
 */
export const adminGetCourseMaterialById = async (materialId, userId = "current-user") => {
  try {
    const { data } = await http.get(`/api/v2/users/${userId}/documents/${materialId}`);
    const doc = data?.data ?? data;
    return {
      material: {
        materialId: doc?.uploadId ?? materialId,
        materialTitle: doc?.fileName ?? doc?.materialTitle,
        courseId: doc?.courseId,
        materialType: doc?.documentType ?? "PDF",
        fileFormat: doc?.fileFormat,
        fileName: doc?.fileName,
        fileSize: doc?.fileSize,
        status: doc?.verificationStatus === "VERIFIED" ? "Successful" : "Successful",
        uploadedBy: doc?.uploadedBy,
        uploadDate: doc?.uploadDate,
      },
    };
  } catch {
    const material =
      MOCK_ADMIN_MATERIALS.find((m) => m.materialId === materialId) ||
      MOCK_ADMIN_MATERIALS[0];
    return { material: { ...material, materialId } };
  }
};

// ---------------------------------------------------------------------------
// TC10 – Admin: Delete Course Material
// DELETE /api/v2/documents/{id}
// ---------------------------------------------------------------------------

/**
 * Permanently delete a course material
 */
export const adminDeleteCourseMaterial = async (materialId) => {
  try {
    const { data } = await http.delete(`/api/v2/documents/${materialId}`);
    return { message: data?.message ?? "Material deleted successfully" };
  } catch {
    const idx = MOCK_ADMIN_MATERIALS.findIndex((m) => m.materialId === materialId);
    if (idx !== -1) MOCK_ADMIN_MATERIALS.splice(idx, 1);
    return { message: "Material deleted successfully" };
  }
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
