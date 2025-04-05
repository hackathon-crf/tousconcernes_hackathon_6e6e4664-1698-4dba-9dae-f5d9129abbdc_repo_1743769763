import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface AnswerChoice {
  id: number;
  text: string;
  isTextField?: boolean;
}

interface Question {
  id: number;
  text: string;
  choices: AnswerChoice[];
}

const InteractiveImageScene: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [customAnswer, setCustomAnswer] = useState<string>("");

  // Mock data for questions
  const questions: Question[] = [
    {
      id: 1,
      text: "What should you include in your emergency kit?",
      choices: [
        { id: 1, text: "Only non-perishable food" },
        { id: 2, text: "Only water and first aid supplies" },
        {
          id: 3,
          text: "Water, food, first aid supplies, flashlight, and important documents",
        },
        { id: 4, text: "", isTextField: true },
      ],
    },
    {
      id: 2,
      text: "What is the recommended amount of water to store per person per day?",
      choices: [
        { id: 1, text: "1 liter" },
        { id: 2, text: "2 liters" },
        { id: 3, text: "4 liters" },
        { id: 4, text: "", isTextField: true },
      ],
    },
    {
      id: 3,
      text: "Where is the safest place during an earthquake?",
      choices: [
        { id: 1, text: "Under a sturdy table" },
        { id: 2, text: "Near windows" },
        { id: 3, text: "Outside the building if possible" },
        { id: 4, text: "", isTextField: true },
      ],
    },
    {
      id: 4,
      text: "What should you do if you are trapped under debris?",
      choices: [
        { id: 1, text: "Stay quiet and wait for help" },
        { id: 2, text: "Try to move as much as possible" },
        { id: 3, text: "Make noise to attract attention" },
        { id: 4, text: "", isTextField: true },
      ],
    },
    {
      id: 5,
      text: "What is the best way to stay informed during a disaster?",
      choices: [
        { id: 1, text: "Social media" },
        { id: 2, text: "Local news channels" },
        { id: 3, text: "Emergency alert systems" },
        { id: 4, text: "", isTextField: true },
      ],
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: number, answerText: string) => {
    setAnswers({
      ...answers,
      [questionId]: answerText,
    });

    // Move to next question if not at the end
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCustomAnswer("");
      }, 500);
    }
  };

  const handleCustomAnswerSubmit = () => {
    if (customAnswer.trim()) {
      handleAnswerSelect(currentQuestion.id, customAnswer);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = () => {
    // Navigate to a results page with both answers and questions in the state
    navigate("/results", {
      state: {
        answers,
        questions: questions.map((q) => ({ id: q.id, text: q.text })), // Only send necessary data
      },
    });
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 3, borderRadius: 2, maxWidth: 800, mx: "auto" }}
    >
      {/* Question Stepper/Timeline */}
      <Stepper
        activeStep={currentQuestionIndex}
        alternativeLabel
        sx={{ mb: 4 }}
      >
        {questions.map((question, index) => (
          <Step key={question.id}>
            <StepLabel>Question {index + 1}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Current Question */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          {currentQuestion.text}
        </Typography>
      </Box>

      {/* Answer Choices */}
      <Grid container spacing={2} justifyContent="center">
        {currentQuestion.choices.map((choice) => (
          <Grid key={choice.id}>
            {choice.isTextField ? (
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  p: 2,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Your own answer:
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Type your answer here..."
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                  />
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleCustomAnswerSubmit}
                    disabled={!customAnswer.trim()}
                  >
                    Submit
                  </Button>
                </Box>
              </Card>
            ) : (
              <Card
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { transform: "scale(1.02)", boxShadow: 3 },
                  bgcolor:
                    answers[currentQuestion.id] === choice.text
                      ? "primary.light"
                      : "background.paper",
                }}
                onClick={() =>
                  handleAnswerSelect(currentQuestion.id, choice.text)
                }
              >
                <CardContent>
                  <Typography variant="body1" align="center" sx={{ p: 2 }}>
                    {choice.text}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        ))}
      </Grid>

      {/* Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="outlined"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <Typography variant="body2" sx={{ alignSelf: "center" }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Typography>

        {currentQuestionIndex === questions.length - 1 && (
          <Button variant="contained" color="success" onClick={handleFinish}>
            Finish
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default InteractiveImageScene;
