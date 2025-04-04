import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Modal,
  Grid,
} from "@mui/material";

interface InfoCard {
  id: number;
  title: string;
  description: string;
  image?: string;
}

const InteractiveImageScene: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  // Mock data for interactive points on the image
  const interactivePoints = [
    { id: 1, x: 20, y: 30, title: "Emergency Kit" },
    { id: 2, x: 50, y: 60, title: "Safe Zone" },
    { id: 3, x: 70, y: 25, title: "Evacuation Route" },
    { id: 4, x: 30, y: 70, title: "Communication Plan" },
  ];

  const infoCards: InfoCard[] = [
    {
      id: 1,
      title: "Emergency Kit",
      description:
        "Prepare a kit with essentials: water, food, first aid supplies, medications, flashlight, and important documents.",
      image: "https://via.placeholder.com/150/FF5733/FFFFFF?text=Emergency+Kit",
    },
    {
      id: 2,
      title: "Safe Zone",
      description:
        "Identify areas in your home that are safest during different types of disasters.",
      image: "https://via.placeholder.com/150/33FF57/FFFFFF?text=Safe+Zone",
    },
    {
      id: 3,
      title: "Evacuation Route",
      description:
        "Plan multiple evacuation routes from your home and neighborhood.",
      image: "https://via.placeholder.com/150/3357FF/FFFFFF?text=Evacuation",
    },
    {
      id: 4,
      title: "Communication Plan",
      description:
        "Create a plan for how family members will contact each other during an emergency.",
      image: "https://via.placeholder.com/150/FF33A8/FFFFFF?text=Communication",
    },
  ];

  const handlePointClick = (id: number) => {
    setSelectedPoint(id);
  };

  const handleCloseModal = () => {
    setSelectedPoint(null);
  };

  const selectedCard = infoCards.find((card) => card.id === selectedPoint);

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom align="center">
        Disaster Preparation Guide
      </Typography>

      <Box sx={{ position: "relative", my: 4 }}>
        {/* Background image */}
        <Box
          component="img"
          src="https://via.placeholder.com/800x500/EEEEEE/AAAAAA?text=Home+Safety+Diagram"
          alt="Interactive Home Safety Diagram"
          sx={{ width: "100%", borderRadius: 2 }}
        />

        {/* Interactive points */}
        {interactivePoints.map((point) => (
          <Box
            key={point.id}
            sx={{
              position: "absolute",
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: 20,
              height: 20,
              borderRadius: "50%",
              bgcolor: "primary.main",
              cursor: "pointer",
              transform: "translate(-50%, -50%)",
              transition: "all 0.2s",
              "&:hover": {
                width: 24,
                height: 24,
                boxShadow: 3,
              },
            }}
            onClick={() => handlePointClick(point.id)}
          />
        ))}
      </Box>

      <Typography variant="h6" gutterBottom>
        Preparation Cards
      </Typography>

      <Grid container spacing={2}>
        {infoCards.map((card) => (
          <Grid key={card.id}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.03)" },
              }}
              onClick={() => handlePointClick(card.id)}
            >
              <CardMedia
                component="img"
                height="140"
                image={card.image}
                alt={card.title}
              />
              <CardContent>
                <Typography variant="subtitle1">{card.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal for displaying card details */}
      <Modal
        open={selectedPoint !== null}
        onClose={handleCloseModal}
        aria-labelledby="card-details-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          {selectedCard && (
            <>
              <Typography variant="h6" component="h2" gutterBottom>
                {selectedCard.title}
              </Typography>
              {selectedCard.image && (
                <Box
                  component="img"
                  src={selectedCard.image}
                  alt={selectedCard.title}
                  sx={{ width: "100%", borderRadius: 1, mb: 2 }}
                />
              )}
              <Typography variant="body1">
                {selectedCard.description}
              </Typography>
            </>
          )}
        </Box>
      </Modal>
    </Paper>
  );
};

export default InteractiveImageScene;
