import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import carIcon from '../../assets/icons/order8.png';
import depotIconimg from '../../assets/icons/warehouse.png';
import deliveryIconimg from '../../assets/icons/delivery-box.png';

const formatToIstanbulTime = (utcTime) => {
    if (!utcTime) return "N/A";
    let date;
    if (typeof utcTime === "string") {
        date = new Date(utcTime.replace(" ", "T"));
    } else {
        date = new Date(utcTime);
    }
    if (isNaN(date.getTime())) return "Invalid Date";
    const utcOffset = date.getTimezoneOffset() / 60;
    const istOffset = 3;
    const istTime = new Date(date.getTime() + (istOffset - utcOffset) * 60 * 60 * 1000);
    return istTime.toISOString().replace('T', ' ').split('.')[0];
};

const vehicleIcon = L.divIcon({
    className: '',
    html: `<div style="position: relative; width: 50px; height: 50px;">
            <img src='${carIcon}' alt='vehicle' style="width: 90%; height: 90%; border-radius: 50%; box-shadow: 0 4px 8px rgba(113, 113, 113, 0.76);" />
        </div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50],
});

const depotIcon = L.divIcon({
    className: '',
    html: `<div style="position: relative; width: 45px; height: 45px;">
            <img src='${depotIconimg}' alt='depot' style="width: 90%; height: 90%; border-radius: 50%; box-shadow: 0 4px 8px rgba(113, 113, 113, 0.76);" />
        </div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50],
});

const deliveryIcon = L.divIcon({
    className: '',
    html: `<div style="position: relative; width: 45px; height: 45px;">
            <img src='${deliveryIconimg}' alt='delivery' style="width: 90%; height: 90%; border-radius: 50%; box-shadow: 0 4px 8px rgba(113, 113, 113, 0.76);" />
        </div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50],
});

const MapFiware = ({ height = '100vh' }) => {
    const [fiwareVehicles, setFiwareVehicles] = useState([]);
    const [vehiclePaths, setVehiclePaths] = useState({});
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const instanceIdRef = useRef(`mapfiware-${Math.random().toString(36).substring(2, 15)}`);
    const [renderTimestamp, setRenderTimestamp] = useState(Date.now());

    useEffect(() => {
        const fetchFiwareVehicles = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/vehicles/locations/fiware');
                const data = await response.json();
                
                // Use a Map to deduplicate vehicles by vehicle_id
                const vehicleMap = new Map();
                if (Array.isArray(data)) {
                    data.forEach(vehicle => {
                        if (!vehicle.vehicle_id || !vehicle.latitude || !vehicle.longitude) return;
                        
                        // Keep the most recent one if there are duplicates
                        const existingVehicle = vehicleMap.get(vehicle.vehicle_id);
                        if (!existingVehicle || 
                            (vehicle.last_updated && existingVehicle.last_updated && 
                             new Date(vehicle.last_updated) > new Date(existingVehicle.last_updated))) {
                            
                            // Add a truly unique stable key with component instance ID
                            const stableKey = `${instanceIdRef.current}-vehicle-${vehicle.vehicle_id}`;
                            vehicleMap.set(vehicle.vehicle_id, {
                                ...vehicle,
                                stable_key: stableKey
                            });
                        }
                    });
                }
                
                // Convert map to array
                const processedData = Array.from(vehicleMap.values());
                setFiwareVehicles(processedData);
                setRenderTimestamp(Date.now());
                
                // Update vehicle paths
                setVehiclePaths(prevPaths => {
                    const newPaths = { ...prevPaths };
                    processedData.forEach(vehicle => {
                        if (!vehicle.latitude || !vehicle.longitude) return;
                        const vehicleId = vehicle.vehicle_id;
                        if (!newPaths[vehicleId]) {
                            newPaths[vehicleId] = [];
                        }
                        const lastPoint = newPaths[vehicleId].slice(-1)[0];
                        if (!lastPoint || lastPoint[0] !== vehicle.latitude || lastPoint[1] !== vehicle.longitude) {
                            newPaths[vehicleId] = [...newPaths[vehicleId], [parseFloat(vehicle.latitude), parseFloat(vehicle.longitude)]];
                        }
                    });
                    return newPaths;
                });
            } catch (error) {
                console.error('❌ FIWARE araç verileri alınamadı:', error);
            }
        };

        const fetchRoutes = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/routes');
                const data = await response.json();
                setRoutes(data);
            } catch (error) {
                console.error('❌ MongoDB rotaları alınamadı:', error);
            }
        };

        fetchFiwareVehicles();
        fetchRoutes();
        const interval = setInterval(fetchFiwareVehicles, 1000);
        return () => clearInterval(interval);
    }, []);

    const extractPath = (point) => {
        if (!point) return [];
        const waypoints = point.waypoints?.map(wp => wp.location) || [];
        return [point.location, ...waypoints].filter(Boolean).map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]);
    };

    // Generate keys that include the component instance ID to ensure uniqueness
    const generateRouteKey = (route, routeIndex, prefix) => {
        return `${instanceIdRef.current}-${prefix}-${route.id || 'unknown'}-${routeIndex}-${renderTimestamp}`;
    };

    const generatePathKey = (vehicleId, pathIndex) => {
        return `${instanceIdRef.current}-path-${vehicleId || 'unknown'}-${pathIndex}`;
    };

    // Additional check to ensure no duplicates in the rendered list
    const uniqueVehicleMap = new Map();
    fiwareVehicles.forEach(vehicle => {
        if (!uniqueVehicleMap.has(vehicle.vehicle_id)) {
            uniqueVehicleMap.set(vehicle.vehicle_id, vehicle);
        }
    });
    const dedupedVehicles = Array.from(uniqueVehicleMap.values());

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '50px',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                zIndex: 1000,
                minWidth: '300px'
            }}>
                <label><strong>Choose Route:</strong></label>
                <select onChange={(e) => setSelectedRoute(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px' }}>
                    <option value="">Choose</option>
                    {routes.map((route, index) => (
                        <option 
                            key={`${instanceIdRef.current}-route-option-${route.id}-${index}`} 
                            value={route.id}
                        >
                            {route.name}
                        </option>
                    ))}
                </select>
            </div>
            <MapContainer center={[39.749745, 30.479999]} zoom={15} style={{ height }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap Contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {selectedRoute && routes.map((route, routeIndex) => {
                    if (route.id === selectedRoute && route.start_point && route.end_point) {
                        const routePath = [
                            ...extractPath(route.start_point),
                            ...route.delivery_points?.flatMap(extractPath) || [],
                        ];
                        const depotPosition = [
                            parseFloat(route.start_point.location.latitude),
                            parseFloat(route.start_point.location.longitude)
                        ];
                        return (
                            <React.Fragment key={generateRouteKey(route, routeIndex, 'route-fragment')}>
                                <Polyline
                                    positions={routePath}
                                    pathOptions={{
                                        color: "#007bff",
                                        weight: 5,
                                        opacity: 0.9
                                    }}
                                />
                                <Marker
                                    position={depotPosition}
                                    icon={depotIcon}
                                >
                                    <Popup>Depot (Start Point)</Popup>
                                </Marker>
                                {route.delivery_points?.map((dp, i) => (
                                    <Marker
                                        key={`delivery-${route.id}-${i}`}
                                        position={[parseFloat(dp.location.latitude), parseFloat(dp.location.longitude)]}
                                        icon={deliveryIcon}
                                    >
                                        <Popup>Delivery Point {dp.id}</Popup>
                                    </Marker>
                                ))}
                            </React.Fragment>
                        );
                    }
                    return null;
                })}

                {/* Use the deduplicated vehicles array */}
                {dedupedVehicles.map((vehicle) => (
                    <Marker
                        key={vehicle.stable_key}
                        position={[parseFloat(vehicle.latitude), parseFloat(vehicle.longitude)]}
                        icon={vehicleIcon}
                        eventHandlers={{
                            click: () => {
                                console.log(`Clicked on ${vehicle.vehicle_id}`);
                            }
                        }}
                    >
                        <Popup>
                            <strong>{vehicle.vehicle_id} - FIWARE</strong><br />
                            Speed: {vehicle.speed ? `${vehicle.speed.toFixed(2)} km/h` : "N/A"}<br />
                            Charge: %{vehicle.charge || "N/A"}<br />
                            Last Updated: {formatToIstanbulTime(vehicle.last_updated ?? vehicle.timestamp)}
                        </Popup>
                    </Marker>
                ))}

                {Object.keys(vehiclePaths).map((vehicleId, pathIndex) => (
                    vehiclePaths[vehicleId].length > 1 && (
                        <Polyline
                            key={generatePathKey(vehicleId, pathIndex)}
                            positions={vehiclePaths[vehicleId]}
                            pathOptions={{
                                color: "#007bff",
                                weight: 4,
                                opacity: 0.7,
                                dashArray: "5, 5"
                            }}
                        />
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default MapFiware;
