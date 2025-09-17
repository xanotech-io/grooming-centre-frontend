import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  IconButton,
  Link,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Close,
  Download,
  OpenInNew,
  Info,
  DateRange,
  Storage,
  Fingerprint,
  Image,
  VideoFile,
  PictureAsPdf,
  Description,
  InsertDriveFile,
} from '@mui/icons-material';

const FileDetailsModal = ({ file, open, onClose, onDownload }) => {
  if (!file) return null;

  const getFileIcon = (fileName) => {
    if (!fileName) return <InsertDriveFile />;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <PictureAsPdf sx={{ color: '#d32f2f', fontSize: 40 }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <Image sx={{ color: '#2e7d32', fontSize: 40 }} />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return <VideoFile sx={{ color: '#1976d2', fontSize: 40 }} />;
      default:
        return <InsertDriveFile sx={{ color: '#757575', fontSize: 40 }} />;
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

  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const getFileName = (url) => {
    if (!url) return 'Unknown';
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      return decodeURIComponent(filename.split('?')[0]);
    } catch {
      return 'Unknown';
    }
  };

  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const extension = url.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <Info />
            </Avatar>
            <Typography variant="h6">
              File Details
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* File Preview */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {isImageFile(file.fileUrl) ? (
            <Box
              component="img"
              src={file.fileUrl}
              alt={file.recordTitle}
              sx={{
                maxWidth: '100%',
                maxHeight: 200,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : (
            <Box sx={{ py: 4 }}>
              {getFileIcon(file.fileUrl)}
            </Box>
          )}
          <Box sx={{ display: 'none', py: 4 }}>
            {getFileIcon(file.fileUrl)}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* File Information */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {file.recordTitle || 'Untitled File'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {getFileName(file.fileUrl)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Storage sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Table Source
              </Typography>
              <Chip
                label={file.table}
                sx={{
                  backgroundColor: getTableColor(file.table),
                  color: 'white',
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Description sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Field Name
              </Typography>
              <Typography variant="body1">
                {formatFieldName(file.fieldName)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Fingerprint sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Record ID
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace',
                  backgroundColor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  wordBreak: 'break-all'
                }}
              >
                {file.recordId}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Fingerprint sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                File ID
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace',
                  backgroundColor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  wordBreak: 'break-all'
                }}
              >
                {file.fileId || 'N/A'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                File URL
              </Typography>
              <Link
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'block',
                  p: 1,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  textDecoration: 'none',
                  wordBreak: 'break-all',
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: 'grey.200',
                  },
                }}
              >
                {file.fileUrl}
                <OpenInNew sx={{ fontSize: 14, ml: 1, verticalAlign: 'middle' }} />
              </Link>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          onClick={() => window.open(file.fileUrl, '_blank')}
          variant="outlined"
          startIcon={<OpenInNew />}
        >
          Open in New Tab
        </Button>
        <Button
          onClick={() => onDownload(file)}
          variant="contained"
          startIcon={<Download />}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileDetailsModal;
