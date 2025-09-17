import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Storage,
  InsertDriveFile,
  Assessment,
} from '@mui/icons-material';

const FileStatsCard = ({ stats, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading statistics...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1">
            No statistics available
          </Typography>
        </CardContent>
      </Card>
    );
  }

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

  const formatTableName = (table) => {
    return table
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const sortedTables = Object.entries(stats.filesByTable || {})
    .sort(([,a], [,b]) => b - a);

  const maxFiles = Math.max(...Object.values(stats.filesByTable || {}));

  return (
    <Box sx={{ space: 3 }}>
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <InsertDriveFile sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div" gutterBottom>
                {stats.totalFiles || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Files
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Storage sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" component="div" gutterBottom>
                {stats.tables?.length || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tables with Files
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div" gutterBottom>
                {maxFiles}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Max Files per Table
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Files by Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            <Storage sx={{ mr: 1, verticalAlign: 'middle' }} />
            Files by Table
          </Typography>

          {sortedTables.length > 0 ? (
            <Grid container spacing={2}>
              {sortedTables.map(([table, count]) => (
                <Grid item xs={12} key={table}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={formatTableName(table)}
                          size="small"
                          sx={{
                            backgroundColor: getTableColor(table),
                            color: 'white',
                            mr: 2,
                            minWidth: 120,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {count} files
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        {((count / stats.totalFiles) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / stats.totalFiles) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getTableColor(table),
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No file data available
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FileStatsCard;
