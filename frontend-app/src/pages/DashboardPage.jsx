import React from "react";
import { Grid, Box } from "@mui/material";
import { DashboardWidget } from "../components";

const DashboardPage = () => {
  return (
    <div>
      <Grid container spacing={4} style={{ padding: "2px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget title="Total Revenue" value="1200000" trend={5} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget title="Total Sales" value="3400" trend={-2} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget title="Number of Sales" value="1233" trend={3} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget title="New Customers" value="800" trend={-1} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ p: 1 }}>
        <Grid item xs={12} sm={6} md={6}>
          <Box>Hello</Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardPage;
