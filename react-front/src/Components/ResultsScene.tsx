import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";

const ResultsScene: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers } = location.state || { answers: {} };

  // Reference to the questions - you might want to move this to a shared location
  const questions = [
    {
      id: 1,
      text: "What should you include in your emergency kit?",
    },
    {
      id: 2,
      text: "What is the recommended amount of water to store per person per day?",
    },
    {
      id: 3,
      text: "Where is the safest place during an earthquake?",
    },
  ];

  return (
    <Paper
      elevation={3}
      sx={{ p: 3, borderRadius: 2, maxWidth: 800, mx: "auto" }}
    >
      <Typography variant="h5" gutterBottom align="center">
        Your Preparation Summary
      </Typography>

      <List sx={{ mb: 4 }}>
        {questions.map((question) => (
          <ListItem key={question.id} divider>
            <ListItemText
              primary={question.text}
              secondary={answers[question.id] || "Not answered"}
              primaryTypographyProps={{ fontWeight: "bold" }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/interactive-guide")}
        >
          Back to Questions
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          Return Home
        </Button>
      </Box>
    </Paper>
  );
};

export default ResultsScene;
