import React, { useState, useEffect } from 'react';
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
  Pagination,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  FolderOpen,
  InsertDriveFile,
  Image,
  VideoFile,
  PictureAsPdf,
  Description,
  Download,
  Visibility,
  CloudDownload,
  Storage,
  FilterList,
} from '@mui/icons-material';
import { useFileManagement } from './hooks/useFileManagement';
import FileDetailsModal from './components/FileDetailsModal';
import FileStatsCard from './components/FileStatsCard';

const DocumentsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedTable, setSelectedTable] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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
        table: selectedTable === 'all' ? '' : selectedTable,
        search: searchQuery,
      });
    } else {
      fetchStats();
    }
  }, [currentPage, pageSize, selectedTable, searchQuery, viewMode, fetchFiles, fetchStats]);

  const getFileIcon = (fileName, table) => {
    if (!fileName) return <Description />;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <PictureAsPdf sx={{ color: '#d32f2f' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <Image sx={{ color: '#2e7d32' }} />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return <VideoFile sx={{ color: '#1976d2' }} />;
      default:
        return <InsertDriveFile sx={{ color: '#757575' }} />;
    }
  };

  const getTableColor = (table) => {
    const colors = {
      course: '#1976d2',
      users: '#2e7d32',
      lesson: '#ed6c02',
      library: '#9c27b0',
      events: '#d32f2f',
      assessmentQuestions: '#0288d1',
      examinationQuestions: '#7b1fa2',
      chatMessages: '#689f38',
      chatRooms: '#f57c00',
      standAloneExaminationQuestion: '#5d4037',
    };
    return colors[table] || '#616161';
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const handleDownload = async (file) => {
    try {
      await downloadFile(file.fileUrl, file.recordTitle || 'document');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <FolderOpen sx={{ mr: 2, verticalAlign: 'middle' }} />
          Documents Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View, manage, and download all files stored in the system
        </Typography>
      </Box>

      {/* View Mode Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={viewMode} onChange={handleViewModeChange}>
          <Tab label="All Files" icon={<InsertDriveFile />} />
          <Tab label="Statistics" icon={<Storage />} />
        </Tabs>
      </Box>

      {viewMode === 0 ? (
        <>
          {/* Filters */}
          <Card sx={{ mb: 3 }}>
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
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
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
                  <FormControl fullWidth size="small">
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
                  <Typography variant="body2" color="text.secondary">
                    {pagination?.totalFiles || 0} files total
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Files Grid */}
          {!loading && files && files.length > 0 && (
            <>
              <Grid container spacing={2}>
                {files.map((file) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`${file.table}-${file.recordId}-${file.fieldName}`}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        }
                      }}
                      onClick={() => handleFileClick(file)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        {/* File Icon and Preview */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {getFileIcon(file.fileUrl, file.table)}
                          <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }} noWrap>
                            {file.recordTitle || 'Untitled'}
                          </Typography>
                        </Box>

                        {/* Table Badge */}
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={file.table}
                            size="small"
                            sx={{
                              backgroundColor: getTableColor(file.table),
                              color: 'white',
                              fontSize: '0.75rem',
                            }}
                          />
                        </Box>

                        {/* Field Name */}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Field: {file.fieldName}
                        </Typography>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileClick(file);
                            }}
                            variant="outlined"
                            sx={{ flex: 1 }}
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
                            sx={{ flex: 1 }}
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
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}

          {/* No Files State */}
          {!loading && (!files || files.length === 0) && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <FolderOpen sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  No files found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {searchQuery || selectedTable !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'No files have been uploaded to the system yet'}
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
  );
};

export default DocumentsPage;
