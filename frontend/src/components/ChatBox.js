// ChatBox.js

import React, { useState, useEffect, useMemo } from 'react';
import { Typography, CircularProgress } from '@mui/material';
import { getSocColor, getBatteryStatus } from '../utils/batteryUtils';

export default function ChatBox() {
    const [vehicles, setVehicles] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // ✅ İlk yükleme için

    const fetchVehicleStatus = async (retryCount = 0) => {
        try {
            const response = await fetch('http://localhost/api/chatbox/vehicles-status', {
                cache: 'no-store', 
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const data = await response.json();

            if (Array.isArray(data)) {
                const uniqueVehicles = [];
                const seen = new Set();

                data.forEach(vehicle => {
                    if (!vehicle.vehicle_id || seen.has(vehicle.vehicle_id)) return;
                    seen.add(vehicle.vehicle_id);
                    uniqueVehicles.push(vehicle);
                });

                setVehicles(uniqueVehicles);
                setError(null);
            } else {
                console.warn('Unexpected response structure:', data);
                // Veri beklenmeyen formatta gelirse eskiyi koru, sadece hata göster
                setError('Unexpected response structure');
            }
        } catch (err) {
            console.error('ChatBox fetch error:', err);
            setError(err.message);

            // 🔁 Retry mekanizması: 3 defa dene, sonra bırak
            if (retryCount < 3) {
                console.log(`Retrying fetch... attempt ${retryCount + 1}`);
                setTimeout(() => fetchVehicleStatus(retryCount + 1), 5000 * (retryCount + 1)); // 5s, 10s, 15s bekle
            }
        } finally {
            setLoading(false); // İlk fetch sonrası spinner kalkar
        }
    };

    useEffect(() => {
        let interval;
        let attempt = 0;

        const fetchAndAdjust = async () => {
            await fetchVehicleStatus();
            attempt += 1;
            // 3 deneme sonra interval hızını düşür
            if (attempt === 3) {
                clearInterval(interval);
                interval = setInterval(() => fetchVehicleStatus(), 20000);
            }
        };

        fetchAndAdjust(); // İlk çağrı hemen başlasın
        interval = setInterval(fetchAndAdjust, 5000); // İlk etapta 5 saniyede bir 3 defa dene

        return () => clearInterval(interval);
    }, []);

    const processedVehicles = useMemo(() =>
        vehicles.map((v, index) => ({
            ...v,
            speed: parseFloat(v.speed) || 0,
            state_of_charge: parseFloat(v.state_of_charge) || 0,
            last_updated: v.last_updated ? new Date(v.last_updated).toLocaleString('en-GB') : 'N/A',
            uniqueKey: `vehicle-${v.vehicle_id || 'unknown'}-${index}`
        })).sort((a, b) => a.state_of_charge - b.state_of_charge), [vehicles]);

    const getBorderColor = (speed, soc) => {
        if (soc < 60 || speed >= 30) return '#dc3545'; // Tehlike
        if (speed > 0) return '#33ff00'; // Hareket halinde
        return '#198754'; // Duran, şarj iyi
    };

    return (
        <div style={{
            position: 'fixed', top: '80px', right: '20px',
            width: '380px', height: '72vh',
            backgroundColor: '#f9f9f9', borderRadius: '10px',
            border: '1px solid #ccc', overflowY: 'auto',
            zIndex: 999, boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                backgroundColor: '#0d6efd', color: '#fff',
                padding: '10px', fontSize: '15px', fontWeight: 'bold',
                textAlign: 'center', borderTopLeftRadius: '10px', borderTopRightRadius: '10px'
            }}>
                Vehicle Monitoring ({processedVehicles.length})
            </div>
            <div style={{ padding: '10px' }}>
                {/* ✅ Loading durumu */}
                {loading && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px' }}>
                            Loading vehicle data...
                        </Typography>
                    </div>
                )}

                {/* ✅ Hata durumu */}
                {error && !loading && (
                    <Typography variant="body2" color="error" align="center" style={{ marginTop: '10px' }}>
                        Error: {error}
                    </Typography>
                )}

                {/* ✅ Hiç veri yoksa */}
                {!processedVehicles.length && !loading && !error && (
                    <Typography variant="body2" color="textSecondary" align="center" style={{ marginTop: '10px' }}>
                        No vehicle data available
                    </Typography>
                )}

                {/* ✅ Liste */}
                {processedVehicles.map(vehicle => (
                    <div key={vehicle.uniqueKey} style={{
                        padding: '10px', marginBottom: '8px', borderRadius: '6px',
                        backgroundColor: '#fff', border: `1px solid ${getBorderColor(vehicle.speed, vehicle.state_of_charge)}`
                    }}>
                        <Typography variant="h6" style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>
                            {vehicle.state_of_charge < 60 ? '🚨' : '🔋'} {vehicle.vehicle_id}
                        </Typography>
                        <Typography variant="body2" style={{ marginTop: '5px', fontSize: '13px', color: '#000' }}>
                            Speed: {vehicle.speed.toFixed(1)} km/h
                        </Typography>
                        <Typography variant="body2" style={{
                            marginTop: '5px', fontSize: '13px',
                            color: getSocColor(vehicle.state_of_charge)
                        }}>
                            Battery: {vehicle.state_of_charge.toFixed(1)}% ({getBatteryStatus(vehicle.state_of_charge)})
                        </Typography>
                        <Typography variant="caption" style={{ color: '#777', display: 'block', marginTop: '5px' }}>
                            Last Updated: {vehicle.last_updated}
                        </Typography>
                    </div>
                ))}
            </div>
        </div>
    );
}
