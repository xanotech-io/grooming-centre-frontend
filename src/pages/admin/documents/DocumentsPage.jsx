import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  makeStyles,
} from "@material-ui/core";
import {
  FolderOpen,
  InsertDriveFile,
  Image,
  Movie as VideoFile,
  PictureAsPdf,
  Description,
  GetApp as Download,
  Visibility,
  Storage,
  Error as ErrorIcon,
} from "@material-ui/icons";
import { BreadcrumbItem, Flex } from "@chakra-ui/react";
import { Breadcrumb, Link } from "../../../components";
import { AdminMainAreaWrapper } from "../../../layouts/admin/MainArea/Wrapper";
import { useFileManagement } from "./hooks/useFileManagement";
import FileDetailsModal from "./components/FileDetailsModal";
import FileStatsCard from "./components/FileStatsCard";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  tabsContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(3),
  },
  filtersCard: {
    marginBottom: theme.spacing(3),
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
  fileCard: {
    height: "100%",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[4],
    },
  },
  fileCardContent: {
    padding: theme.spacing(2),
  },
  fileIcon: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  fileName: {
    marginLeft: theme.spacing(1),
    flexGrow: 1,
  },
  tableBadge: {
    marginBottom: theme.spacing(2),
  },
  fieldName: {
    marginBottom: theme.spacing(2),
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(4),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(8),
  },
  emptyIcon: {
    fontSize: 80,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  totalFiles: {
    color: theme.palette.text.secondary,
  },
  // Custom Alert styles
  alert: {
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "#f44336",
    color: "white",
    display: "flex",
    alignItems: "center",
  },
  alertIcon: {
    marginRight: theme.spacing(1),
  },
  // Custom Pagination styles
  pagination: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  paginationButton: {
    minWidth: 32,
    height: 32,
  },
  paginationInfo: {
    margin: `0 ${theme.spacing(2)}px`,
    color: theme.palette.text.secondary,
  },
}));

const DocumentsPage = () => {
  const classes = useStyles();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedTable, setSelectedTable] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(0); // 0: All Files, 1: Statistics

  const {
    files,
    stats,
    loading,
    error,
    pagination,
    availableTables,
    fetchFiles,
    fetchStats,
    downloadFile,
  } = useFileManagement();

  useEffect(() => {
    if (viewMode === 0) {
      fetchFiles({
        page: currentPage,
        limit: pageSize,
        table: selectedTable === "all" ? "" : selectedTable,
        search: searchQuery,
      });
    } else {
      fetchStats();
    }
  }, [
    currentPage,
    pageSize,
    selectedTable,
    searchQuery,
    viewMode,
    fetchFiles,
    fetchStats,
  ]);

  const getFileIcon = (fileName, table) => {
    if (!fileName) return <Description />;

    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return <PictureAsPdf style={{ color: "#d32f2f" }} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <Image style={{ color: "#2e7d32" }} />;
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
        return <VideoFile style={{ color: "#1976d2" }} />;
      default:
        return <InsertDriveFile style={{ color: "#757575" }} />;
    }
  };

  const getTableColor = (table) => {
    const colors = {
      course: "#1976d2",
      users: "#2e7d32",
      lesson: "#ed6c02",
      library: "#9c27b0",
      events: "#d32f2f",
      assessmentQuestions: "#0288d1",
      examinationQuestions: "#7b1fa2",
      chatMessages: "#689f38",
      chatRooms: "#f57c00",
      standAloneExaminationQuestion: "#5d4037",
    };
    return colors[table] || "#616161";
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const handleDownload = async (file) => {
    try {
      await downloadFile(file.fileUrl, file.recordTitle || "document");
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleTableFilter = (event) => {
    setSelectedTable(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  if (error) {
    return (
      <Container maxWidth="lg" className={classes.container}>
        <Box className={classes.alert}>
          <ErrorIcon className={classes.alertIcon} />
          {error}
        </Box>
      </Container>
    );
  }

  return (
    <AdminMainAreaWrapper>
      <Flex justify="space-between" align="center" mb={6}>
        <Breadcrumb
          item2={
            <BreadcrumbItem isCurrentPage>
              <Link href="#">Documents</Link>
            </BreadcrumbItem>
          }
        />
      </Flex>
      <Container maxWidth="lg" className={classes.container}>
      {/* Header */}
      <Box className={classes.header}>
        <Typography variant="h4" component="h1" gutterBottom>
          <FolderOpen style={{ marginRight: 16, verticalAlign: "middle" }} />
          Documents Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View, manage, and download all files stored in the system
        </Typography>
      </Box>

      {/* View Mode Tabs */}
      <Box className={classes.tabsContainer}>
        <Tabs value={viewMode} onChange={handleViewModeChange}>
          <Tab label="All Files" icon={<InsertDriveFile />} />
          <Tab label="Statistics" icon={<Storage />} />
        </Tabs>
      </Box>

      {viewMode === 0 ? (
        <>
          {/* Filters */}
          <Card className={classes.filtersCard}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Search files..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by filename or title"
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel>Filter by Table</InputLabel>
                    <Select
                      value={selectedTable}
                      label="Filter by Table"
                      onChange={handleTableFilter}
                    >
                      <MenuItem value="all">All Tables</MenuItem>
                      {availableTables.map((table) => (
                        <MenuItem key={table} value={table}>
                          {table.charAt(0).toUpperCase() + table.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel>Files per page</InputLabel>
                    <Select
                      value={pageSize}
                      label="Files per page"
                      onChange={(e) => {
                        setPageSize(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={20}>20</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2" className={classes.totalFiles}>
                    {pagination?.totalFiles || 0} files total
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <Box className={classes.loadingContainer}>
              <CircularProgress />
            </Box>
          )}

          {/* Files Grid */}
          {!loading && files && files.length > 0 && (
            <>
              <Grid container spacing={2}>
                {files.map((file) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={`${file.table}-${file.recordId}-${file.fieldName}`}
                  >
                    <Card
                      className={classes.fileCard}
                      onClick={() => handleFileClick(file)}
                    >
                      <CardContent className={classes.fileCardContent}>
                        {/* File Icon and Preview */}
                        <Box className={classes.fileIcon}>
                          {getFileIcon(file.fileUrl, file.table)}
                          <Typography
                            variant="h6"
                            className={classes.fileName}
                            noWrap
                          >
                            {file.recordTitle || "Untitled"}
                          </Typography>
                        </Box>

                        {/* Table Badge */}
                        <Box className={classes.tableBadge}>
                          <Chip
                            label={file.table}
                            size="small"
                            style={{
                              backgroundColor: getTableColor(file.table),
                              color: "white",
                              fontSize: "0.75rem",
                            }}
                          />
                        </Box>

                        {/* Field Name */}
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          className={classes.fieldName}
                        >
                          Field: {file.fieldName}
                        </Typography>

                        {/* Action Buttons */}
                        <Box className={classes.actionButtons}>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileClick(file);
                            }}
                            variant="outlined"
                            style={{ flex: 1 }}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Download />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file);
                            }}
                            variant="contained"
                            color="primary"
                            style={{ flex: 1 }}
                          >
                            Download
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <Box className={classes.paginationContainer}>
                  <Box className={classes.pagination}>
                    <Button
                      className={classes.paginationButton}
                      variant="outlined"
                      size="small"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                    >
                      First
                    </Button>
                    <Button
                      className={classes.paginationButton}
                      variant="outlined"
                      size="small"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Prev
                    </Button>

                    <Typography
                      variant="body2"
                      className={classes.paginationInfo}
                    >
                      Page {currentPage} of {pagination.totalPages}
                    </Typography>

                    <Button
                      className={classes.paginationButton}
                      variant="outlined"
                      size="small"
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                    <Button
                      className={classes.paginationButton}
                      variant="outlined"
                      size="small"
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => setCurrentPage(pagination.totalPages)}
                    >
                      Last
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}

          {/* No Files State */}
          {!loading && (!files || files.length === 0) && (
            <Card>
              <CardContent className={classes.emptyState}>
                <FolderOpen className={classes.emptyIcon} />
                <Typography variant="h5" gutterBottom>
                  No files found
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {searchQuery || selectedTable !== "all"
                    ? "Try adjusting your filters or search terms"
                    : "No files have been uploaded to the system yet"}
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Statistics View */
        <FileStatsCard stats={stats} loading={loading} />
      )}

      {/* File Details Modal */}
      <FileDetailsModal
        file={selectedFile}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFile(null);
        }}
        onDownload={handleDownload}
      />
    </Container>
    </AdminMainAreaWrapper>
  );
};

export default DocumentsPage;
