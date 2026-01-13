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
  makeStyles,
} from '@material-ui/core';
import {
  Storage,
  InsertDriveFile,
  Assessment,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  overviewContainer: {
    marginBottom: theme.spacing(4),
  },
  cardContent: {
    textAlign: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: theme.spacing(1),
  },
  primaryIcon: {
    color: theme.palette.primary.main,
  },
  secondaryIcon: {
    color: theme.palette.secondary.main,
  },
  successIcon: {
    color: theme.palette.success?.main || '#4caf50',
  },
  sectionTitle: {
    marginBottom: theme.spacing(3),
  },
  sectionIcon: {
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
  },
  tableRow: {
    marginBottom: theme.spacing(2),
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  tableInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  tableChip: {
    marginRight: theme.spacing(2),
    minWidth: 120,
  },
  percentage: {
    fontWeight: 500,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.grey[200],
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

const FileStatsCard = ({ stats, loading }) => {
  const classes = useStyles();
  if (loading) {
    return (
      <Card>
        <CardContent className={classes.emptyState}>
          <CircularProgress />
          <Typography variant="body1" style={{ marginTop: 16 }}>
            Loading statistics...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className={classes.emptyState}>
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
    <Box>
      {/* Overview Cards */}
      <Grid container spacing={3} className={classes.overviewContainer}>
        <Grid item xs={12} sm={6} md={4}>
          <Card style={{ height: '100%' }}>
            <CardContent className={classes.cardContent}>
              <InsertDriveFile className={`${classes.icon} ${classes.primaryIcon}`} />
              <Typography variant="h4" component="div" gutterBottom>
                {stats.totalFiles || 0}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Total Files
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card style={{ height: '100%' }}>
            <CardContent className={classes.cardContent}>
              <Storage className={`${classes.icon} ${classes.secondaryIcon}`} />
              <Typography variant="h4" component="div" gutterBottom>
                {stats.tables?.length || 0}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Tables with Files
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card style={{ height: '100%' }}>
            <CardContent className={classes.cardContent}>
              <Assessment className={`${classes.icon} ${classes.successIcon}`} />
              <Typography variant="h4" component="div" gutterBottom>
                {maxFiles}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Max Files per Table
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Files by Table */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" marginBottom={3}>
            <Storage className={classes.sectionIcon} />
            <Typography variant="h6" gutterBottom>
              Files by Table
            </Typography>
          </Box>

          {sortedTables.length > 0 ? (
            <Grid container spacing={2}>
              {sortedTables.map(([table, count]) => (
                <Grid item xs={12} key={table}>
                  <Box className={classes.tableRow}>
                    <Box className={classes.tableHeader}>
                      <Box className={classes.tableInfo}>
                        <Chip
                          label={formatTableName(table)}
                          size="small"
                          className={classes.tableChip}
                          style={{
                            backgroundColor: getTableColor(table),
                            color: 'white',
                          }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          {count} files
                        </Typography>
                      </Box>
                      <Typography variant="body2" className={classes.percentage}>
                        {((count / stats.totalFiles) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / stats.totalFiles) * 100}
                      className={classes.progressBar}
                      style={{
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getTableColor(table),
                        },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="textSecondary" className={classes.emptyState}>
              No file data available
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FileStatsCard;
