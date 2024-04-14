import React from "react";
import { Paper, Typography, Box, useTheme } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { fShortenNumber } from "../../utils/formatNumber";
import { useColorMode } from "../../contexts/ColorModeContext";
const widgetStyle = {
  padding: "20px",
  borderRadius: "15px",
  background: "linear-gradient(135deg, ##bdc4c8, ##8a949d)", // Gradient background
  color: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "10px 10px 15px -8px rgba(0,0,0,0.2)",
};

const numberStyle = {
  background: "#fff",
  borderRadius: "10px",
  padding: "6px 12px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "5px 5px 10px 5px #bdc4c8",
};

const DashboardWidget = ({ title, value, trend }) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  return (
    <Paper style={widgetStyle}>
      <Box>
        <Typography variant="h5">{title}</Typography>
        <Box
          style={{ display: "flex", alignItems: "center", marginTop: "4px" }}
        >
          {trend >= 0 ? (
            <ArrowUpwardIcon style={{ color: "#4caf50" }} />
          ) : (
            <ArrowDownwardIcon style={{ color: "#f44336" }} />
          )}
          <Typography
            variant="h5"
            style={{
              marginLeft: "5px",
              color: trend >= 0 ? "#4caf50" : "#f44336",
            }}
          >
            {Math.abs(trend)}%
          </Typography>
        </Box>
      </Box>
      <Box style={numberStyle}>
        <Typography variant="h4">{fShortenNumber(value)}</Typography>
      </Box>
    </Paper>
  );
};

export default DashboardWidget;
