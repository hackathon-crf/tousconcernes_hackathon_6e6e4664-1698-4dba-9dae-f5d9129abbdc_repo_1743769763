import React from "react";
import { Box, Typography, Button, Paper, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface RiskAssessmentSceneProps {
  userLocation: { lat: number; lng: number } | null;
  riskData: any;
}

const RiskAssessmentScene: React.FC<RiskAssessmentSceneProps> = ({
  userLocation,
  riskData,
}) => {
  const navigate = useNavigate();

  // Redirect if no location or risk data
  if (!userLocation || !riskData) {
    React.useEffect(() => {
      navigate("/");
    }, [navigate]);
    return null;
  }

  // Transform risk data for the radar chart
  const chartData = Object.entries(riskData).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    risk: value,
    fullMark: 100,
  }));

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom align="center">
        Risk Assessment for Your Location
      </Typography>

      <Typography variant="body1" gutterBottom>
        Based on coordinates: {userLocation.lat.toFixed(4)},{" "}
        {userLocation.lng.toFixed(4)}
      </Typography>

      <Box sx={{ height: 400, width: "100%", my: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Risks"
              dataKey="risk"
              stroke="#e53935"
              fill="#e53935"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Box>

      <Grid container spacing={2}>
        {Object.entries(riskData).map(([key, value]) => (
          <Grid key={key}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor:
                  value > 70 ? "#ffebee" : value > 40 ? "#fff8e1" : "#e8f5e9",
                border: 1,
                borderColor:
                  value > 70 ? "#ef5350" : value > 40 ? "#ffc107" : "#66bb6a",
              }}
            >
              <Typography variant="subtitle1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Typography>
              <Typography
                variant="h6"
                color={
                  value > 70 ? "error" : value > 40 ? "warning" : "success"
                }
              >
                {value}%
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/interactive-guide")}
        >
          View Preparation Guide
        </Button>
      </Box>
    </Paper>
  );
};

export default RiskAssessmentScene;
