import React, { useState } from "react";
import {
  Container,
  Typography,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Scene components
import MapScene from "./Components/MapScene";
import RiskAssessmentScene from "./Components/RiskAssessmentScene";
import InteractiveImageScene from "./Components/InteractiveImageScene";
import ResultsScene from "./Components/ResultsScene";

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#e53935", // Red color for Croix-Rouge theme
    },
    secondary: {
      main: "#424242",
    },
  },
});

const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [riskData, setRiskData] = useState(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            TousConcernés - POC
          </Typography>

          <Routes>
            <Route
              path="/"
              element={
                <MapScene
                  setUserLocation={setUserLocation}
                  setRiskData={setRiskData}
                />
              }
            />
            <Route
              path="/risk-assessment"
              element={
                <RiskAssessmentScene
                  userLocation={userLocation}
                  riskData={riskData}
                />
              }
            />
            <Route
              path="/interactive-guide"
              element={<InteractiveImageScene />}
            />
            <Route path="/results" element={<ResultsScene />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;
