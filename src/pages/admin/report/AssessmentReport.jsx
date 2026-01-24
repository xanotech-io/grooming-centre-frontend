import React from 'react'
import { Box } from '@chakra-ui/layout';
import { DashboardMetricCard} from "../../../components"

const AssessmentReport = () => {
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
          title="Average Assessment Score"
          value="82%"
          change="+5% vs last month"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Highest vs. Lowest Score"
          value="95% / 45%"
          change="per course"
          changeColor="#1A8F3A"
        />
        <DashboardMetricCard
          title="Pass Rate"
          value="82%"
          change="+5% vs last period"
          changeColor="#1A8F3A"
        />

        <DashboardMetricCard
          title="Question Difficulty Impact"
          value="Medium"
          change=""
          changeColor="#1A8F3A"
        />
      </Box>
      {/* <Table
          {...tableProps}
          placeholder="Search by name, email, department..."
          rows={rows}
          setRows={setRows}
          handleFetch={fetchRowItems}
          onSelectionChange={handleSelectionChange}
          selectionButtonText="Add Selected Users"
        /> */}
    </>
  )
}

export default AssessmentReport