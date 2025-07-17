import React, { useState, useEffect } from "react";
import "../assets/styles/global.css";
import "leaflet/dist/leaflet.css";
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FleetMonitoringMap from "../components/FleetMonitoring/FleetMonitoringMap";
import Alert from "../components/FleetMonitoring/FM_AlertPanel";
import { vehicles } from "../data/vehicles";
import { chargingStations } from "../data/chargingStations";
import { orders } from "../data/orders";
import { routes } from "../data/routes";
import OrderStatusPieChart from "../components/FleetMonitoring/OrderStatusPieChart";
import RouteEnergyConsumptionChart from "../components/FleetMonitoring/RouteEnergyConsumptionChart";
import MapFiware from "../components/FleetMonitoring/MapFiware";
import { ENDPOINTS } from "../services/api";
import TaskCompletionChart from "../components/FleetMonitoring/TaskCompletionChart"; // import ekle
import DeliveryProgressPanel from "../components/FleetMonitoring/DeliveryProgressPanel";
import { parseRouteXmlFile } from "../utils/parseRoutexml"; // Dosya yolunu kontrol edin


// Use centralized API endpoints from the service
const API_URL = ENDPOINTS.ALERTS;
const API_PERFORMANCE = ENDPOINTS.PERFORMANCE;
const API_PREDICT = ENDPOINTS.ENERGY_PREDICT;

export default function FleetMonitoring() {
    const [alerts, setAlerts] = useState([]);
    const [activeTab, setActiveTab] = useState("route"); // Default to route tab
    const [showInfo, setShowInfo] = useState(true);
    const [showWarning, setShowWarning] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState("");
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);
    const [routeOptions, setRouteOptions] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [shapContributions, setShapContributions] = useState([]);
    const [shapLabels, setShapLabels] = useState([]);
    const [shapPrediction, setShapPrediction] = useState(null);
    const [showFiwareMap, setShowFiwareMap] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [vehicleSegments, setVehicleSegments] = useState([]);
    const [remainingRange, setRemainingRange] = useState(null);
    // Add isResetting state
    const [isResetting, setIsResetting] = useState(false);
    const [ordersFromDb, setOrdersFromDb] = useState([]);
    const [selectedVehicleForOrders, setSelectedVehicleForOrders] = useState("");
    const [showOrderDetailDialog, setShowOrderDetailDialog] = useState(false);
    const [showDeliveryPanel, setShowDeliveryPanel] = useState(false);
    const [deliveryStops, setDeliveryStops] = useState([]);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [chargingStationsDb, setChargingStationsDb] = useState([]);
    const [completionPercentages, setCompletionPercentages] = useState({});

        useEffect(() => {
      fetch('http://localhost:3001/api/charging-stations')
        .then(res => res.json())
        .then(setChargingStationsDb)
        .catch(console.error);
    }, []);

    // Rota tıklanınca çağrılır
    const handleRouteClick = (vehicleId) => {
        // O araca ait siparişleri sırayla bul
        const stops = ordersFromDb
            .filter(order => order.vehicleId === vehicleId)
            .sort((a, b) => a.stopIndex - b.stopIndex); // stopIndex yoksa başka bir sıralama kullan
        // Sıradaki müşteri indexini bul
        const currentIdx = stops.findIndex(s => s.status !== "Delivered");
        setDeliveryStops(stops);
        setCurrentStopIndex(currentIdx === -1 ? stops.length - 1 : currentIdx);
        setShowDeliveryPanel(true);
    };

    // fetchOrders fonksiyonunu üstte tanımla
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/orders');
        const data = await res.json();
        setOrdersFromDb(data);
      } catch (err) {
        console.error("Siparişler çekilemedi:", err);
      }
    };

    const getVehicleOrderCompletion = (vehicleId) => {
      const vehicleOrders = ordersFromDb.filter(order => order.vehicleId === vehicleId);
      if (vehicleOrders.length === 0) return 0;
      const deliveredCount = vehicleOrders.filter(order => order.status === "Delivered").length;
      return (deliveredCount / vehicleOrders.length) * 100;
    };

    useEffect(() => {
      fetchOrders();
    }, []);
    
    //ekledim
    // useEffect(() => {
    //   const fetchRoutes = async () => {
    //     try {
    //       console.log("📥 Fetching and parsing routes...");
    //       const parsedRoutes = await parseRouteXmlFile();
    //       console.log("✅ Parsed Routes:", parsedRoutes);
    //       setParsedRoutes(parsedRoutes); // State'e kaydedin
    //     } catch (error) {
    //       console.error("❌ Error parsing routes:", error);
    //     }
    //   };
    
    //   fetchRoutes();
    // }, []);

    const checkStopCompletion = async (vehicleId, currentPosition, orders) => {
      let completedStops = 0;

      for (const order of orders) {
        const lat = order.location?.latitude;
        const lon = order.location?.longitude;
        if (lat == null || lon == null) continue;

        const distance = Math.sqrt(
          Math.pow(currentPosition.lat - lat, 2) +
          Math.pow(currentPosition.lon - lon, 2)
        );

        if (distance < 0.0001 && order.status !== "Delivered") {
          try {
            await fetch(`http://localhost:3001/api/customers/${order.nodeId}/delivered`, {
              method: "PATCH"
            });
            completedStops++;
            await fetchOrders(); // PATCH sonrası hemen güncelle
          } catch (err) {
            console.error("Status güncellenemedi:", err);
          }
        } else if (order.status === "Delivered") {
          completedStops++;
        }
      }

      const completionPercentage = (completedStops / orders.length) * 100;
      setCompletionPercentages((prev) => ({
        ...prev,
        [vehicleId]: completionPercentage,
      }));
    };
    
    useEffect(() => {
      const interval = setInterval(async () => {
        try {
          const response = await fetch("http://localhost:3001/api/vehicles/locations");
          const vehicleData = await response.json();

          vehicleData.forEach((vehicle) => {
            // O araca ait siparişleri bul
            const vehicleOrders = ordersFromDb.filter(order => order.vehicleId === vehicle.vehicle_id);
            checkStopCompletion(vehicle.vehicle_id, { lat: vehicle.latitude, lon: vehicle.longitude }, vehicleOrders);
          });
        } catch (error) {
          console.error("❌ Error fetching vehicle data:", error);
        }
      }, 3000);

      return () => clearInterval(interval);
    }, [ordersFromDb]);



    useEffect(() => {
      let interval;
  
      const fetchVehicleSegments = async () => {
          try {
              // Fiware'den araç ID'lerini al
              const response = await fetch("http://localhost:3001/api/vehicles/locations/fiware");
              const vehicles = await response.json();
  
              if (!Array.isArray(vehicles)) {
                  console.error("Unexpected response format:", vehicles);
                  return;
              }
  
              // Her araç için full segment verisini çek
              const segmentPromises = vehicles.map(vehicle =>
                  fetch(`http://localhost:3001/api/vehicles/${vehicle.vehicle_id}/full-segment`)
                      .then(res => res.json())
                      .catch(err => console.error(`Error fetching segment for ${vehicle.vehicle_id}:`, err))
              );
  
              const segments = await Promise.all(segmentPromises);
              setVehicleSegments(segments);
              console.log("Fetched vehicle segments:", segments);
          } catch (error) {
              console.error("Error fetching vehicle segments:", error);
          }
      };
  
      // İlk veri çekme işlemi
      fetchVehicleSegments();
  
      // 5 saniyede bir tekrar et
      interval = setInterval(fetchVehicleSegments, 10000);
  
      // Cleanup: Interval'ı temizle
      return () => clearInterval(interval);
    }, []);

    // Fetch alerts and performance data
    useEffect(() => {
      // Uyarıları çek
      fetch(API_URL)
        .then((res) => res.json())
        .then((data) => setAlerts(data))
        .catch((err) => console.error(err));
    
      // Performans verilerini çek
      const fetchData = () => {
        setIsLoading(true);
      
        fetch(API_PERFORMANCE)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            console.log('Fetched performance data:', data); // Gelen veriyi logla
            if (data && Array.isArray(data)) {
              // vehicle_id ve route_id'yi birleştirerek gösterim için hazırlayın
              const routeOptionsFormatted = data.map(item => ({
                label: `${item.vehicle_id} - ${item.route_id}`,
                value: `${item.vehicle_id}_${item.route_id}`, // Kombinasyon
                fullData: item,
              }));
              setRouteOptions(routeOptionsFormatted);
              if (!selectedRoute && routeOptionsFormatted.length > 0) {
                setSelectedRoute(routeOptionsFormatted[0].value); // İlk route_id'yi seç
              }
              setPerformanceData(data); // Tüm performans verilerini sakla
            } else {
              console.error('Unexpected data format:', data);
            }
            setIsLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching performance data:", err);
            setIsLoading(false);
          });
      };
    
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }, [selectedRoute]);

    // Filter data when either performanceData or selectedRoute changes
    useEffect(() => {
      console.log("Selected Route:", selectedRoute); // Seçilen rotayı logla
      console.log("Route Options:", routeOptions); // Rota seçeneklerini logla

      if (selectedRoute) {
        const filtered = performanceData.filter(item => item.route_id === selectedRoute);
        setFilteredData(filtered);
      } else {
        setFilteredData([]);
      }
    }, [performanceData, selectedRoute]);

    // Fetch SHAP data
    useEffect(() => {
      const fetchSHAP = async () => {
        if (!selectedRoute) return;

        const [vehicleId, routeId] = selectedRoute.split("_");
        const selectedData = routeOptions.find(
          option => option.fullData.vehicle_id === vehicleId && option.fullData.route_id === routeId
        )?.fullData;

        if (!selectedData) {
          console.error("Selected route data not found");
          return;
        }

        const transformedData = {
          avg_vehicle_speed: selectedData.avg_vehicle_speed,
          segment_length: selectedData.segment_length,
          avg_Acceleration: selectedData.avg_acceleration,
          avg_Total_Mass: selectedData.avg_total_mass,
          slope: selectedData.slope,
          soc: selectedData.soc,
        };

        try {
          // MongoDB'den remaining_energy, nonlinear_energy ve segment_count değerlerini al
          const energyResponse = await fetch(`http://localhost:3001/api/vehicles/${vehicleId}/energy`);
          let remainingEnergy = null;
          let nonlinearEnergy = null;
          let segmentCount = 0;

          if (energyResponse.ok) {
            const energyData = await energyResponse.json();
            remainingEnergy = energyData.remaining_energy ?? 0; // Varsayılan olarak 0
            nonlinearEnergy = energyData.nonlinear_energy ?? 0; // Varsayılan olarak 0
            segmentCount = energyData.segment_count ?? 0; // Varsayılan olarak 0
          }

          // Eğer remaining_energy yoksa SOC üzerinden hesapla
          if (remainingEnergy === null && transformedData.soc != null) {
            const batteryCapacity = 15.6; // kWh
            remainingEnergy = (transformedData.soc / 100) * batteryCapacity * 1000; // Wh
          }

          // Flask API'ye remaining_energy, nonlinear_energy ve segment_count ekleyerek gönder
          const response = await fetch(API_PREDICT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...transformedData,
              remaining_energy: remainingEnergy,
              nonlinear_energy: nonlinearEnergy,
              segment_count: segmentCount,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error from /predict:", errorData);
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Model Prediction Response:", data); // Modelden dönen sonucu logla

          setShapContributions(data.shap_values || []);
          setShapLabels(["segment_length", "slope", "avg_vehicle_speed", "avg_Acceleration", "avg_Total_Mass"]);
          setShapPrediction(data.prediction || null);
          setRemainingRange(data.remaining_range || null);

          // MongoDB'de remaining_energy, nonlinear_energy ve segment_count değerlerini güncelle
          if (data.remaining_energy !== null) {
            const patchResponse = await fetch(`http://localhost:3001/api/vehicles/${vehicleId}/energy`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                remaining_energy: data.remaining_energy,
                nonlinear_energy: data.nonlinear_energy,
                segment_count: data.segment_count,
              }),
            });

            if (!patchResponse.ok) {
              console.error("Error updating energy data:", await patchResponse.json());
            } else {
              console.log("Energy data successfully updated in MongoDB:", {
                remaining_energy: data.remaining_energy,
                nonlinear_energy: data.nonlinear_energy,
                segment_count: data.segment_count,
              });
            }
          }
        } catch (error) {
          console.error("Error fetching SHAP data:", error);
        }
      };

      fetchSHAP();
    }, [selectedRoute, routeOptions]);

    // Resolve alert
    const handleResolve = async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolved: true }),
        });
  
        if (!response.ok) throw new Error("Sunucu hatası");
  
        await response.json();
  
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert._id === id ? { ...alert, resolved: true } : alert
          )
        );
      } catch (error) {
        console.error("Çözümleme hatası:", error);
      }
    };
  
    // Delete alert
    const handleDelete = async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  
        if (!response.ok) {
          throw new Error(`Sunucu hatası: ${response.status}`);
        }
  
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert._id !== id));
      } catch (error) {
        console.error("Silme hatası:", error);
      }
    };

    // Start SUMO simulation
    const startSumoSimulation = async () => {
      try {
        alert("Starting SUMO simulation... Please wait.");
        const response2 = await fetch('http://localhost:3001/api/customers/import-from-xml', { method: 'POST' });
        
        const serverUrl = `http://${window.location.hostname}:8000/sumo`;
        
        const response = await fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === "started" || data.status === "running") {
          setIsSimulationRunning(true);
          alert("SUMO GUI has been started successfully.");
        } else {
          alert(`Failed to start simulation: ${data.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error starting SUMO simulation:", error);
        alert(`Error starting simulation: ${error.message}`);
      }
    };

    // Add SUMO reset functionality
    const resetSumoSimulation = async () => {
      try {
        // Set resetting flag to show loading state in UI
        setIsResetting(true);
        
        const serverUrl = `http://${window.location.hostname}:8000/sumo_reset`;
        
        const response = await fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error}`);
        }
        
        const data = await response.json();
        
        if (data.message === "SUMO reset successfully") {
          setIsSimulationRunning(false);
          alert("SUMO simulation has been reset successfully.");
        } else {
          alert(`Reset had some issues: ${data.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error resetting SUMO simulation:", error);
        alert("Failed to reset SUMO simulation. Please check the backend logs.");
      } finally {
        // Always reset the flag when done
        setIsResetting(false);
      }
    };

    // Group alerts by category
    const categorizedAlerts = alerts.reduce((acc, alert) => {
      acc[alert.type] = acc[alert.type] ? [...acc[alert.type], alert] : [alert];
      return acc;
    }, {});
  
    // Render alerts by category
    const renderAlertsByCategory = (type) => {
      if (type === "Info" && !showInfo) return null;
      if (type === "Warning" && !showWarning) return null;
      const alertsOfType = categorizedAlerts[type] || [];
      return alertsOfType.map((alert) => (
        <Alert
          key={alert._id}
          detail={alert.detail}
          type={alert.type}
          message={alert.message}
          source={alert.source}
          timestamp={alert.timestamp}
          resolved={alert.resolved}
          onResolve={() => handleResolve(alert._id)}
          onDelete={() => handleDelete(alert._id)}
        />
      ));    
    };
  
    // Route colors
    const routeColors = {
      "Simulated Annealing": "blue",
      "Tabu Search": "green",
      "OR-Tools": "red",
      "Completed": "green",
    };
  
    // Routes data preparation for map
    const plannedRoutes = routes["Simulated Annealing"]?.map((r) => ({ positions: r.path || [] })) || [];
    const completedRoutes = routes["Completed"]?.map((r) => ({ positions: r.path || [] })) || [];
  
    // Styles for the UI components
    const styles = {
      container: {
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#f5f5f7" // Apple-like light background
      },
      sidebar: {
        flex: "0 0 550px", // Even wider sidebar for better visibility
        padding: "20px",
        backgroundColor: "#f5f5f7",
        height: "100vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      },
      panel: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      },
      panelTitle: {
        fontSize: "18px",
        fontWeight: "600",
        marginBottom: "16px",
        color: "#1d1d1f" // Apple's dark text color
      },
      tabContainer: {
        display: "flex",
        gap: "10px",
        marginBottom: "16px"
      },
      checkbox: {
        display: "inline-flex",
        alignItems: "center",
        marginRight: "16px",
        cursor: "pointer"
      },
      checkboxInput: {
        marginRight: "8px"
      },
      categoryTitle: {
        fontSize: "16px",
        fontWeight: "500",
        marginBottom: "10px",
        color: "#1d1d1f"
      },
      chartContainer: {
        width: "100%",
        height: "280px",
        marginBottom: "16px"
      },
      detailButton: {
        width: "100%",
        marginTop: "12px",
        padding: "10px",
        backgroundColor: "#0071e3", // Apple blue
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "background-color 0.2s"
      },
      simulationButton: {
        padding: "12px", 
        backgroundColor: isSimulationRunning ? "#cccccc" : "#0071e3",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: isSimulationRunning ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontSize: "15px",
        fontWeight: "500",
        transition: "background-color 0.2s, transform 0.1s"
      },
      mapButton: {
        padding: "12px",
        backgroundColor: showFiwareMap ? "#0071e3" : "#6e6e73",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        transition: "background-color 0.2s, transform 0.1s"
      },
      mapContainer: {
        flex: "1 1 auto",
        display: "flex", 
        flexDirection: "column", 
        height: "100vh",
        position: "relative",
        backgroundColor: "#f8f9fa",
        padding: "20px",
        overflow: "auto"
      },
      mapSection: {
        marginBottom: "24px",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      },
      mapTitle: {
        margin: 0,
        padding: "16px 20px",
        backgroundColor: "#f0f0f0",
        borderBottom: "1px solid #e0e0e0",
        fontSize: "16px",
        fontWeight: "500",
        color: "#1d1d1f"
      },
      spinner: {
        display: "inline-block",
        width: "14px",
        height: "14px",
        border: "2px solid #ffffff",
        borderRadius: "50%",
        borderTopColor: "transparent",
        animation: "spin 1s linear infinite"
      }
    };

    return (
      <div style={styles.container}>
        {/* Left sidebar with improved design - SIMULATION CONTROL REMOVED */}
        <div style={styles.sidebar}>
          {/* Alerts panel */}
          <div style={{...styles.panel, flex: "1 0 auto"}}>
            <h2 style={styles.panelTitle}>Alerts</h2>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={styles.checkbox}>
                <input 
                  type="checkbox" 
                  checked={showInfo} 
                  onChange={() => setShowInfo(!showInfo)} 
                  style={styles.checkboxInput} 
                />
                <span>Info</span>
              </label>
              <label style={styles.checkbox}>
                <input 
                  type="checkbox" 
                  checked={showWarning} 
                  onChange={() => setShowWarning(!showWarning)} 
                  style={styles.checkboxInput} 
                />
                <span>Warning</span>
              </label>
            </div>
            
            <div style={{ overflowY: "auto", flex: 1 }}>
              <div style={{ marginBottom: "16px" }}>
                <h3 style={styles.categoryTitle}>Error</h3>
                {renderAlertsByCategory("Error")}
              </div>
              
              {showWarning && (
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={styles.categoryTitle}>Warning</h3>
                  {renderAlertsByCategory("Warning")}
                </div>
              )}
              
              {showInfo && (
                <div>
                  <h3 style={styles.categoryTitle}>Info</h3>
                  {renderAlertsByCategory("Info")}
                </div>
              )}
            </div>
          </div>
          
          {/* Performance monitoring panel */}
          <div style={{...styles.panel, flex: "1 0 auto", minHeight: "550px"}}>
            <h2 style={styles.panelTitle}>Performance Monitoring</h2>
            
            <div style={styles.tabContainer}>
              <Button 
                variant={activeTab === "route" ? "contained" : "outlined"} 
                startIcon={<DirectionsCarIcon />} 
                onClick={() => setActiveTab("route")}
                size="small"
                fullWidth
                color="primary"
                style={{textTransform: "none", borderRadius: "8px", fontWeight: "500"}}
              >
                Route
              </Button>
              <Button 
                variant={activeTab === "order" ? "contained" : "outlined"} 
                startIcon={<ShoppingCartIcon />} 
                onClick={() => setActiveTab("order")}
                size="small"
                fullWidth
                color="primary"
                style={{textTransform: "none", borderRadius: "8px", fontWeight: "500"}}
              >
                Order
              </Button>
            </div>
            
            <div style={{ overflowY: "auto", flex: 1, width: "100%" }}>
              {activeTab === "route" && (
                <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                  <FormControl fullWidth size="small" style={{ marginBottom: 16 }}>
                    <InputLabel>Select Route</InputLabel>
                    <Select
                      value={selectedRoute}
                      onChange={(e) => setSelectedRoute(e.target.value)}
                      label="Select Route"
                    >
                      {routeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {shapPrediction !== null && (
                    <>
                      <Typography style={{ fontWeight: "600", marginBottom: 16, fontSize: "15px", color: "#1d1d1f" }}>
                        Predicted Energy Consumption: {shapPrediction.toFixed(3)} kWh
                      </Typography>
                      {remainingRange !== null ? (
                        <Typography style={{ fontWeight: "600", marginBottom: 16, fontSize: "15px", color: "#1d1d1f" }}>
                          Estimated Range: {remainingRange.toFixed(3)} km
                        </Typography>
                      ) : (
                        <Typography style={{ fontWeight: "600", marginBottom: 16, fontSize: "15px", color: "#ff0000" }}>
                          Estimated Range Data Not Found
                        </Typography>
                      )}
                    </>
                  )}

                  <div style={styles.chartContainer}>
                    <RouteEnergyConsumptionChart shapData={shapContributions} labels={shapLabels} />
                  </div>
                  
                  <button 
                    onClick={() => setShowDetailDialog(true)} 
                    style={styles.detailButton}
                  >
                    Show Details
                  </button>
                  
                  <Dialog open={showDetailDialog} onClose={() => setShowDetailDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Route Details</DialogTitle>
                    <DialogContent>
                      <FormControl fullWidth size="small" style={{ marginBottom: 12 }}>
                        <InputLabel>Select Route</InputLabel>
                        <Select
                          value={selectedRoute}
                          onChange={(e) => setSelectedRoute(e.target.value)}
                          label="Select Route"
                        >
                          {routeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <RouteEnergyConsumptionChart shapData={shapContributions} labels={shapLabels} />
                      
                      {filteredData.length > 0 ? (
                        <>
                          <Typography variant="body2" style={{margin: "8px 0"}}>Average Energy Consumption: {filteredData.at(-1).avg_energy_consumption_kwh_km} kWh/km</Typography>
                          <Typography variant="body2" style={{margin: "8px 0"}}>Total Estimated Energy: {filteredData.at(-1).estimated_total_energy_kwh} kWh</Typography>
                          <Typography variant="body2" style={{margin: "8px 0"}}>Range Effect: {filteredData.at(-1).range_effect_percent}%</Typography>
                          
                          <Typography variant="subtitle1" style={{ margin: "16px 0 8px", fontWeight: "600" }}>Route Information</Typography>
                          <Typography variant="body2" style={{margin: "8px 0"}}>Total Distance: {filteredData.at(-1).total_distance_km} km</Typography>
                          <Typography variant="body2" style={{margin: "8px 0"}}>Estimated Duration: {Math.floor(filteredData.at(-1).estimated_duration_min / 60)} hours {filteredData.at(-1).estimated_duration_min % 60} minutes</Typography>
                          <Typography variant="body2" style={{margin: "8px 0"}}>Average Speed: {filteredData.at(-1).speed_kmh} km/h</Typography>
                          <Typography variant="body2" style={{margin: "8px 0"}}>Total Stops: {filteredData.at(-1).stop_count}</Typography>
                          <Typography variant="body2" style={{margin: "8px 0"}}>Traffic Level: {filteredData.at(-1).traffic_level}</Typography>
                          <Typography variant="body2" style={{margin: "8px 0"}}>Slope Profile: {filteredData.at(-1).slope_profile}</Typography>
                          <Typography variant="body2" style={{margin: "8px 0"}}>Energy Efficiency Score: {filteredData.at(-1).efficiency_score}/100</Typography>
                        </>
                      ) : (
                        <Typography>Data not found.</Typography>
                      )}
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setShowDetailDialog(false)} color="primary">Close</Button>
                    </DialogActions>
                  </Dialog>
                </div>
              )}
              
              {activeTab === "order" && (
                <div style={{ width: "100%", height: "300px", padding: "8px 0" }}>
                  <OrderStatusPieChart orders={ordersFromDb} />

                  {/* Araç seçme dropdown'u */}
                  <FormControl fullWidth size="small" style={{ marginTop: 10 }}>
                    <InputLabel>Select Vehicle</InputLabel>
                    <Select
                      value={selectedVehicleForOrders || ""}
                      onChange={(e) => setSelectedVehicleForOrders(e.target.value)}
                      label="Select Vehicle"
                    >
                      {[...new Set(ordersFromDb.map(order => order.vehicleId))]
                        .filter(Boolean)
                        .map(vehicleId => (
                          <MenuItem key={vehicleId} value={vehicleId}>{vehicleId}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  {/* Tamamlama yüzdesi barı */}
                  {selectedVehicleForOrders && (
                    <div style={{ marginTop: 5 }}>
                      <TaskCompletionChart
                        completionData={[
                          {
                            name: selectedVehicleForOrders,
                            completion: getVehicleOrderCompletion(selectedVehicleForOrders),
                            delivered: ordersFromDb.filter(o => o.vehicleId === selectedVehicleForOrders && o.status === "Delivered").length,
                            total: ordersFromDb.filter(o => o.vehicleId === selectedVehicleForOrders).length
                          }
                        ]}
                      />
                    </div>
                  )}

                  {/* Detay butonu */}
                  <button
                    style={styles.detailButton}
                    onClick={() => setShowOrderDetailDialog(true)}
                  >
                    Show Order Details
                  </button>

                  <Dialog open={showOrderDetailDialog} onClose={() => setShowOrderDetailDialog(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogContent>
                      {/* Pie Chart */}
                      <OrderStatusPieChart orders={ordersFromDb} />

                      {/* Araç bazında iş tamamlama yüzdeleri ve dağılım */}
                      <div style={{ marginTop: 24 }}>
                        <h4>Vehicle-Based Order Status</h4>
                        {Array.from(new Set(ordersFromDb.map(order => order.vehicleId)).values())
                          .filter(Boolean)
                          .map(vehicleId => {
                            const vehicleOrders = ordersFromDb.filter(order => order.vehicleId === vehicleId);
                            const delivered = vehicleOrders.filter(o => o.status === "Delivered").length;
                            const cancelled = vehicleOrders.filter(o => o.status === "Cancelled").length;
                            const onTheWay = vehicleOrders.filter(o => o.status === "On the way").length;
                            const requested = vehicleOrders.filter(o => o.status === "Requested").length;
                            const total = vehicleOrders.length;
                            const completion = total ? (delivered / total) * 100 : 0;
                            return (
                              <div key={vehicleId} style={{ marginBottom: 18, padding: 12, background: "#f8f9fa", borderRadius: 8 }}>
                                <strong>{vehicleId}</strong> - Total Orders: {total}
                                <div style={{ margin: "6px 0" }}>
                                  <TaskCompletionChart
                                    completionData={[{ name: vehicleId, completion, delivered, total }]}
                                  />
                                </div>
                                <div>
                                  <span style={{ marginRight: 12 }}>Delivered: <b>{delivered}</b></span>
                                  <span style={{ marginRight: 12 }}>On the Way: <b>{onTheWay}</b></span>
                                  <span style={{ marginRight: 12 }}>Requested: <b>{requested}</b></span>
                                  <span style={{ marginRight: 12 }}>Cancelled: <b>{cancelled}</b></span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setShowOrderDetailDialog(false)} color="primary">Close</Button>
                    </DialogActions>
                  </Dialog>


                </div>
              )}
            </div>
          </div>
          
          {/* Simulation control panel has been removed from here */}
        </div>
        
        {/* Right content area - maps container */}
        <div style={styles.mapContainer}>
          {/* NEW: Horizontal Simulation Control Panel */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            padding: "1px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1d1d1f",
              marginRight: "20px"
            }}>Simulation Control</h2>
            
            <div style={{
              display: "flex",
              gap: "8px",
              flex: "1"
            }}>
              <button
                onClick={startSumoSimulation}
                disabled={isSimulationRunning}
                style={{
                  padding: "10px 16px",
                  flex: "1",
                  backgroundColor: isSimulationRunning ? "#cccccc" : "#0071e3",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isSimulationRunning ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "15px",
                  fontWeight: "500"
                }}
              >
                {isSimulationRunning ? (
                  <>
                    <span style={styles.spinner}></span>
                    Simulation Running...
                  </>
                ) : (
                  <>
                    <PlayArrowIcon />
                    Start Simulation
                  </>
                )}
              </button>
              
              {/* Add SUMO Reset Button */}
              <button
                onClick={resetSumoSimulation}
                disabled={isResetting}
                style={{
                  padding: "10px 16px",
                  flex: "1",
                  backgroundColor: isResetting ? "#cccccc" : "#e34700",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isResetting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "15px",
                  fontWeight: "500"
                }}
              >
                {isResetting ? (
                  <>
                    <span style={styles.spinner}></span>
                    Resetting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="white">
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                    Reset SUMO
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowFiwareMap(!showFiwareMap)}
                style={{
                  padding: "10px 16px",
                  flex: "1",
                  backgroundColor: showFiwareMap ? "#0071e3" : "#6e6e73",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {showFiwareMap ? (
                  <>
                    <VisibilityOffIcon />
                    Hide Real-Time Map
                  </>
                ) : (
                  <>
                    <VisibilityIcon />
                    Show Real-Time Map
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Standard API Vehicle Tracking */}
          <div style={styles.mapSection}>
            <h4 style={styles.mapTitle}>Vehicle Tracking</h4>
            <div style={{ height: "500px", position: "relative" }}>
              <FleetMonitoringMap
                vehicles={vehicles}
                chargingStations={chargingStationsDb}
                orders={ordersFromDb}
                plannedRoutes={plannedRoutes}
                completedRoutes={completedRoutes}
                routeColors={routeColors}
                height="100%"
                onRouteClick={handleRouteClick}
              />
              {showDeliveryPanel && (
                  <DeliveryProgressPanel
                      stops={deliveryStops}
                      currentIndex={currentStopIndex}
                      onClose={() => setShowDeliveryPanel(false)}
                  />
              )}
            </div>
          </div>

          {/* FIWARE MQTT Vehicle Tracking */}
          {showFiwareMap && (
            <div style={styles.mapSection}>
              <h4 style={styles.mapTitle}>Real-Time Vehicle Tracking (FIWARE)</h4>
              <div style={{ height: "500px", position: "relative" }}>
                <MapFiware height="100%" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
}