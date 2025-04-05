import React, { useState, useEffect } from "react";
import { Box, Button, CircularProgress, Alert, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/**
 * API Georisque
 * https://www.data.gouv.fr/fr/dataservices/api-georisques/
 * carte: https://www.georisques.gouv.fr/cartes-interactives#/
 * risk: https://www.georisques.gouv.fr/doc-api#/Risques/rechercheRisques_4
 *
 * endpoint: https://georisques.gouv.fr/api/v1/gaspar/risques
 * parameters:
 * - latlon: string (latitude, longitude)
 * - rayon: number (in meters)
 * - page: number (default 1)
 * - page_size: number (default 10)
 *
 * Example location (Baie de Saint-Malo):
 * 48.630185,1.939086
 */

// Interface for Georisque API parameters
interface GeorisqueApiParams {
  /**
   * Search radius in meters (max 10,000 meters, default 1,000)
   */
  rayon?: number;

  /**
   * Coordinates in format "longitude,latitude" (e.g., "48.630185,1.939086")
   */
  latlon?: string;

  /**
   * INSEE code(s) of communes, comma-separated for multiple (max 10)
   * Cannot be combined with radius search
   */
  code_insee?: string;

  /**
   * Page number for pagination
   */
  page?: number;

  /**
   * Number of items per page
   */
  page_size?: number;
}

// URL for Georisque API
const GEORISQUE_API_URL = "https://georisques.gouv.fr/api/v1/gaspar/risques";

/**
 * Builds the Georisque API URL with query parameters
 */
const buildGeorisqueUrl = (params: GeorisqueApiParams): string => {
  const searchParams = new URLSearchParams();

  if (params.rayon !== undefined)
    searchParams.append("rayon", params.rayon.toString());
  if (params.latlon) searchParams.append("latlon", params.latlon);
  if (params.code_insee) searchParams.append("code_insee", params.code_insee);
  if (params.page !== undefined)
    searchParams.append("page", params.page.toString());
  if (params.page_size !== undefined)
    searchParams.append("page_size", params.page_size.toString());

  return `${GEORISQUE_API_URL}?${searchParams.toString()}`;
};

// Fix for Leaflet default marker icons
// You'll need to add marker-icon.png and marker-shadow.png to your public folder
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "/marker-icon-2x.png",
//   iconUrl: "/marker.png",
//   shadowUrl: "/marker-shadow.png",
// });

interface MapSceneProps {
  setUserLocation: (location: { lat: number; lng: number }) => void;
  setRiskData: (data: any) => void;
}

const MapScene: React.FC<MapSceneProps> = ({
  setUserLocation,
  setRiskData,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<{
    lat: number;
    lng: number;
  } | null>({ lat: 48.630185, lng: -1.939086 });
  const navigate = useNavigate();

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (navigator.geolocation) {
      // navigator.geolocation.getCurrentPosition(
      //   (position) => {
      //     const userPos = {
      //       lat: position.coords.latitude,
      //       lng: position.coords.longitude,
      //     };
      //     setPosition(userPos);
      //     setUserLocation(userPos);
      //     fetchRiskData(userPos);
      //   },
      //   (error) => {
      //     setLoading(false);
      //     setError(
      //       "Unable to retrieve your location. Please enable location services."
      //     );
      //     console.error("Geolocation error:", error);
      //   }
      // );

      // Mocking the geolocation for demonstration purposes
      const mockPosition = {
        coords: {
          latitude: 48.630185,
          longitude: -1.939086,
        },
      };
      const userPos = {
        lat: mockPosition.coords.latitude,
        lng: mockPosition.coords.longitude,
      };
      setPosition(userPos);
      setUserLocation(userPos);
      fetchRiskData(userPos);
    } else {
      setLoading(false);
      setError("Geolocation is not supported by your browser.");
    }
  };

  const fetchRiskData = async (location: { lat: number; lng: number }) => {
    try {
      // Replace with actual API call to georisque service
      const url = buildGeorisqueUrl({
        latlon: `${location.lat},${location.lng}`,
        rayon: 1000,
        page: 1,
        page_size: 10,
      });
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // Parse the JSON response
      const data = await response.json();
      // Transform the data to the desired format
      // Extract relevant information from the response and make a risk by percentage for each main risk
      // setRiskData(data);

      // Mock data for demonstration
      const mockData = {
        flood: 80,
        earthquake: 25,
        fire: 10,
        storm: 60,
        landslide: 5,
      };
      setRiskData(mockData);
      setLoading(false);
      navigate("/risk-assessment");
    } catch (error) {
      setLoading(false);
      setError("Failed to fetch risk data. Please try again.");
      console.error("API error:", error);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ height: 600, width: "100%" }}>
          {position ? (
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={8}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[position.lat, position.lng]}>
                <Popup>Vous êtes ici</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <Box
              sx={{
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f5f5f5",
                borderRadius: 1,
              }}
            >
              Please click "Locate Me" to display the map
            </Box>
          )}
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={getCurrentLocation}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? "Evaluation..." : "Evalue mes risques"}
        </Button>
      </Box>
    </Paper>
  );
};

export default MapScene;
