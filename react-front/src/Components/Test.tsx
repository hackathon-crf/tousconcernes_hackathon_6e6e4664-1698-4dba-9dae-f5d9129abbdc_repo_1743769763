import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Button,
} from "@mui/material";
import axios from "axios";

interface ApiResponse {
  status?: number;
  message?: any;
  data?: {
    title: string;
    genAI_info: {
      use_cases: string[];
      key_features: Record<string, string>;
      user_examples: Array<{
        name: string;
        use_case: string;
        result: string;
      }>;
    };
    additional_metrics: {
      response_time_ms: number;
      api_version: string;
    };
  };
}

const Test: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse>("/api/test/");
      setData(response.data);
      console.log("API Response:", response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data from the backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data when component mounts
    fetchData();
  }, []);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchData}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: "#ffebee" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {data && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Backend Message
            </Typography>
            <Typography>
              {typeof data.message === "object"
                ? JSON.stringify(data.message)
                : data.message}
            </Typography>
          </Paper>

          {data.data && (
            <>
              <Typography variant="h6" gutterBottom>
                {data.data.title}
              </Typography>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  GenAI Use Cases
                </Typography>
                <List>
                  {data.data.genAI_info.use_cases.map((useCase, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={useCase} />
                    </ListItem>
                  ))}
                </List>
              </Paper>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Key Features
                </Typography>
                <List>
                  {Object.entries(data.data.genAI_info.key_features).map(
                    ([key, value], index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={key.replace(/_/g, " ")}
                            secondary={value}
                            primaryTypographyProps={{ fontWeight: "bold" }}
                          />
                        </ListItem>
                        {index <
                          Object.keys(data.data.genAI_info.key_features)
                            .length -
                            1 && <Divider />}
                      </React.Fragment>
                    )
                  )}
                </List>
              </Paper>

              <Typography variant="h6" gutterBottom>
                User Examples
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
                {data.data.genAI_info.user_examples.map((example, index) => (
                  <Card key={index} sx={{ flex: "1 0 45%", minWidth: 275 }}>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {example.name}
                      </Typography>
                      <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        {example.use_case}
                      </Typography>
                      <Typography variant="body2">{example.result}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle2">
                  API Version: {data.data.additional_metrics.api_version}
                </Typography>
                <Typography variant="subtitle2">
                  Response Time: {data.data.additional_metrics.response_time_ms}
                  ms
                </Typography>
              </Paper>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Test;
