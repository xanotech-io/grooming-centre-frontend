import React from 'react'
import { Box } from '@chakra-ui/layout';
import { DashboardMetricCard } from "../../../components"

const AttendanceReport = () => {
  return (
      <>
      <Box
        display={"flex"}
        // width={'100%'}
        justifyContent="space-between"
        gridGap={4}
        mb={10}
      >
        <DashboardMetricCard
          title="Attendance Percentage"
          value="82%"
          change="+5% vs last month"
          changeColor="#1A8F3A"
        />

     
        <DashboardMetricCard
          title="Number of Sessions Missed"
          value="4.51"
          change="+5% vs last semester"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Average Attendance Duration"
          value="80%"
          change="per course"
          changeColor="#1A8F3A"
        />
      </Box>
     
    </>
  )
}

export default AttendanceReport

