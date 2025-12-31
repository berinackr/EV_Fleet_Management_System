import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import carIcon from '../../assets/icons/car.png';
import depotIconImg from '../../assets/icons/warehouse.png';
import customerIconImg from '../../assets/icons/delivery-box.png';
import deliveredIconImg from '../../assets/icons/delivered-box.png';
import cancelledIconImg from '../../assets/icons/cancelled-box.png';
import chargingStationIconImg from '../../assets/icons/station.png'; // uygun bir ikon ekle
import chargingStationIconImgRed from '../../assets/icons/station_red.png'; // uygun bir ikon ekle
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Box, Paper, Checkbox, FormControlLabel, Popover } from '@mui/material';

// Renk Setleri
const completedColor = "rgb(32, 158, 1)"; // Koyu Gri: Tamamlanan rota
const inProgressColor = "rgb(255, 165, 0)"; // Turuncu: Şu anda geçilen nokta
const remainingColor = "rgba(225, 255, 0, 0)"; // Parlak Mavi: Henüz gidilmeyen rota
const plannedColor = "rgb(37, 102, 254)"; // Sarı: Planlanan rota

const chargingStationIconActive = L.divIcon({
  className: '',
  html: `<div style="width:30px;height:30px;">
    <img src='${chargingStationIconImg}' alt='charging' style="width:100%;height:100%;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);" />
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const chargingStationIconInactive = L.divIcon({
  className: '',
  html: `<div style="width:30px;height:30px;">
    <img src='${chargingStationIconImgRed}' alt='charging-inactive' style="width:100%;height:100%;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);" />
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Depot Data
const depots = [
    { id: 'cs5', latitude: 39.751377, longitude: 30.481888 }
];

// Customer Data
const customers = [
    { id: '60A/1', type: 'c', latitude: 39.749362, longitude: 30.474844, demand: 19, serviceTime: 180, readyTime: 1313, dueDate: 1374 },
    { id: '32', type: 'c', latitude: 39.752539, longitude: 30.488116, demand: 76, serviceTime: 180, readyTime: 1322, dueDate: 1378 },
    { id: '19', type: 'c', latitude: 39.748356, longitude: 30.488971, demand: 57, serviceTime: 120, readyTime: 296, dueDate: 350 },
    { id: '31', type: 'c', latitude: 39.752950, longitude: 30.483109, demand: 57, serviceTime: 120, readyTime: 1372, dueDate: 1448 },
    { id: '75', type: 'c', latitude: 39.747236, longitude: 30.473853, demand: 38, serviceTime: 120, readyTime: 424, dueDate: 487 },
];

// İstanbul Saatine Çevirme Fonksiyonu
const formatToIstanbulTime = (utcTime) => {
    const date = new Date(utcTime);
    const istTime = new Date(date.getTime() + (3 * 60 * 60 * 1000)); // UTC+3
    return istTime.toISOString().replace('T', ' ').split('.')[0]; // Yalnızca tarih ve saat kısmı
};


// Custom Depot Icon
const depotIcon = L.divIcon({
    className: '',
    html: `<div style="position: relative; width: 30px; height: 30px;">
              <img src='${depotIconImg}' alt='depot' style="width: 100%; height: 100%; border-radius: 50%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);" />
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

const customerIcon = L.divIcon({
    className: '',
    html: `<div style="position: relative; width: 30px; height: 30px;">
              <img src='${customerIconImg}' alt='depot' style="width: 100%; height: 100%; border-radius: 50%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);" />
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});


// Aracın simgesi
const animatedIcon = L.divIcon({
    className: '',
    html: `
        <div style="position: relative; width: 39px; height: 36px;">
            <img src='${carIcon}' alt='location' style="width: 91%; height: 92%; border-radius: 50%; box-shadow: 0 4px 8px rgba(113, 113, 113, 0.76); animation: glow 2s infinite alternate;" />
        </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50],
});

const getCustomerIcon = (status) => {
    let iconImg = customerIconImg;
    if (status === "Delivered") iconImg = deliveredIconImg;
    else if (status === "Cancelled") iconImg = cancelledIconImg;

    return L.divIcon({
        className: '',
        html: `<div style="position: relative; width: 30px; height: 30px;">
                  <img src='${iconImg}' alt='customer' style="width: 100%; height: 100%; border-radius: 50%; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);" />
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
    });
};


const Map = ({ height = '83vh', orders = [], chargingStations = [], onRouteClick }) => {
    const [vehicleData, setVehicleData] = useState({});
    const [routes, setRoutes] = useState({});
    const [showDepots, setShowDepots] = useState(true);
    const [showCustomers, setShowCustomers] = useState(true);
    const [showVehicles, setShowVehicles] = useState(true);
    const [showStations, setShowStations] = useState(true);
        // Popover için state
    const [anchorEl, setAnchorEl] = useState(null);
    const handleLayerBtnClick = (event) => setAnchorEl(event.currentTarget);
    const handleLayerClose = () => setAnchorEl(null);
    const open = Boolean(anchorEl);
    const [showRoutes, setShowRoutes] = useState(true);

    useEffect(() => {
        const fetchVehicleData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/vehicles/locations');
                if (!response.ok) {
                    throw new Error(`API returned status ${response.status}`);
                }
                const data = await response.json();

                setVehicleData((prevData) => {
                    const updatedData = { ...prevData };
                    const updatedRoutes = { ...routes };

                    data.forEach((vehicle) => {
                        const vehicleId = vehicle.vehicle_id;
                        const newCoords = [parseFloat(vehicle.latitude), parseFloat(vehicle.longitude)];

                        updatedData[vehicleId] = {
                            ...vehicle,
                            planned_path: Array.isArray(vehicle.planned_path)
                                ? vehicle.planned_path
                                : [],
                        };

                        if (!updatedRoutes[vehicleId]) {
                            updatedRoutes[vehicleId] = [];
                        }
                        updatedRoutes[vehicleId].push(newCoords);
                    });

                    setRoutes(updatedRoutes);
                    return updatedData;
                });
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
            }
        };

        const interval = setInterval(fetchVehicleData, 3000);
        fetchVehicleData();

        return () => clearInterval(interval);
    }, [routes]);

    return (
        <Box data-testid="fleet-map-container" sx={{ position: "relative", height }}>
            {/* Sağ üst köşe butonu */}
            <IconButton
                sx={{ position: "absolute", top: 16, right: 16, zIndex: 3000, bgcolor: "#fff", boxShadow: 2 }}
                onClick={handleLayerBtnClick}
            >
                <MoreVertIcon />
            </IconButton>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleLayerClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { p: 2 } }}
            >
                <Box display="flex" flexDirection="column" gap={0}>
                    <FormControlLabel
                        control={<Checkbox checked={showDepots} onChange={e => setShowDepots(e.target.checked)} />}
                        label="Depolar"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={showCustomers} onChange={e => setShowCustomers(e.target.checked)} />}
                        label="Müşteriler"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={showVehicles} onChange={e => setShowVehicles(e.target.checked)} />}
                        label="Araçlar"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={showStations} onChange={e => setShowStations(e.target.checked)} />}
                        label="Şarj İstasyonları"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={showRoutes} onChange={e => setShowRoutes(e.target.checked)} />}
                        label="Rotalar"
                    />
                </Box>
            </Popover>

            <MapContainer center={[39.749745, 30.479999]} zoom={15} style={{ height: "100%" }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap Contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Planlanan Rota Çizimi */}
                {Object.entries(vehicleData).map(([vehicleId, vehicle]) => (
                    <React.Fragment key={`planned-path-${vehicleId}`}>
                        {vehicle.planned_path && vehicle.planned_path.length > 0 && (
                            <Polyline
                                positions={vehicle.planned_path}
                                color={plannedColor}
                                weight={3}
                                dashArray="5,5"
                            />
                        )}
                    </React.Fragment>
                ))}

                {/* Depolar */}
                {showDepots &&
                    depots.map((depot) => (
                        <Marker
                            key={depot.id}
                            position={[depot.latitude, depot.longitude]}
                            icon={depotIcon}
                        >
                            <Popup>
                                <strong>Depot ID:</strong> {depot.id}
                            </Popup>
                        </Marker>
                    ))
                }
                {/* Şarj İstasyonları */}
                {showStations && Array.isArray(chargingStations) && chargingStations.map(station => (
                    <Marker
                        key={station._id?.$oid || station.user_id}
                        position={[station.latitude, station.longitude]}
                        icon={station.is_active ? chargingStationIconActive : chargingStationIconInactive}
                    >
                        <Popup>
                            <strong>{station.full_name}</strong><br />
                            ID: {station.user_id}<br />
                            Adres: {station.address}<br />
                            Telefon: {station.phone_number}<br />
                            Durumu: {station.is_active ? 'Aktif' : 'Pasif'}
                        </Popup>
                    </Marker>
                ))}
                {/* Müşteriler */}
                {showCustomers &&
                    orders.map((order) => (
                        <Marker
                            key={order.nodeId || order._id}
                            position={[
                                order.location?.latitude,
                                order.location?.longitude
                            ]}
                            icon={getCustomerIcon(order.status)}
                        >
                            <Popup>
                                <strong>Order ID:</strong> {order.nodeId}<br />
                                Status: {order.status}<br />
                                Demand: {order.demand || '-'}<br />
                                Service Time: {order.serviceTime || '-'}<br />
                                Time Window: {order.readyTime} - {order.dueDate}
                            </Popup>
                        </Marker>
                    ))
                }
                {/* Araçlar */}
                {showVehicles &&
                    Object.entries(vehicleData).map(([vehicleId, vehicle]) => (
                        <Marker
                            key={vehicleId}
                            position={[parseFloat(vehicle.latitude), parseFloat(vehicle.longitude)]}
                            icon={animatedIcon}
                        >
                            <Popup>
                                <strong>{vehicleId}</strong><br />
                                Speed: {parseFloat(vehicle.speed).toFixed(2)} km/h<br />
                                Charge: %{parseFloat(vehicle.state_of_charge).toFixed(2)}<br />
                                Last Updated: {formatToIstanbulTime(vehicle.last_updated)}
                            </Popup>
                        </Marker>
                    ))
                }
                {/* Rotalar */}
                {showRoutes && Object.entries(routes).map(([vehicleId, coordinates]) => {
                    const fullRoute = vehicleData[vehicleId]?.planned_path || [];
                    const completedRoute = coordinates.slice(0, coordinates.length - 1);
                    const remainingRoute = fullRoute.filter(
                        ([lat, lon]) => !coordinates.some(
                            ([clat, clon]) => Math.abs(clat - lat) < 0.00001 && Math.abs(clon - lon) < 0.00001
                        )
                    );
                    const inProgressPoint = coordinates[coordinates.length - 1];

                    return (
                        <React.Fragment key={`route-${vehicleId}`}>
                            <Polyline
                                positions={completedRoute}
                                color={completedColor}
                                weight={4}
                                eventHandlers={{
                                    click: () => {
                                        if (typeof onRouteClick === "function") {
                                            onRouteClick(vehicleId);
                                        }
                                    }
                                }}
                            />
                            <Polyline
                                positions={[inProgressPoint]}
                                color={inProgressColor}
                                weight={6}
                            />
                            {remainingRoute.length > 0 && (
                                <Polyline
                                    positions={remainingRoute}
                                    color={remainingColor}
                                    weight={4}
                                    dashArray="5,10"
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </MapContainer>
        </Box>
    );
};

export default Map;


