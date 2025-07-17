import traci
import datetime
import os
import json
import paho.mqtt.client as mqtt
import MySQLdb
import time  
# MQTT Ayarları
MQTT_BROKER = "159.146.83.30"
MQTT_PORT = 18883

# MQTT İstemcisi Oluştur ve Bağlan
mqtt_client = mqtt.Client()
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)



# Her araç için gönderim zamanını izlemek üzere bir dictionary
last_sent_times = {}

def send_to_mqtt(broker, port, vehicle_id, data):
    """
    MQTT broker'a JSON formatında veri gönderir.
    Args:
        broker (str): MQTT broker adresi.
        port (int): MQTT broker portu.
        vehicle_id (str): Araç ID'si.
        data (dict): Gönderilecek veri.
    """
    global last_sent_times
    current_time = time.time()  # Epoch zamanını alalım

    # Son gönderim zamanı kontrolü
    if vehicle_id in last_sent_times:
        time_since_last_send = current_time - last_sent_times[vehicle_id]
        if time_since_last_send < 1:  # Saniyede 1 gönderim sınırlaması
            return

    last_sent_times[vehicle_id] = current_time  # Zaman damgasını güncelle

    topic = f"json/secret/{vehicle_id}/attrs"  # Dinamik topic oluşturuluyor
    try:
        payload = json.dumps(data)
        mqtt_client.publish(topic, payload, retain=True)
        print(f"MQTT Mesajı Gönderildi: {payload}")
    except Exception as e:
        print(f"MQTT Gönderim Hatası: {e}")




def write_routes_to_json(vehicle_id, edges):
    """
    Writes vehicle routes and lane positions to a JSON file.
    Args:
        vehicle_id (str): Vehicle ID.
        edges (list): List of edge IDs for the route.
    """
    coordinates = []
    for edge in edges:
        try:
            # Get the number of lanes for the edge
            num_lanes = traci.edge.getLaneNumber(edge)
            if num_lanes > 0:
                # Get lane shape (coordinates)
                lane_id = f"{edge}_0"  # Use the first lane (index 0)
                lane_shape = traci.lane.getShape(lane_id)
                geo_coords = [
                    [lat, lon] for lon, lat in [
                        traci.simulation.convertGeo(x, y) for x, y in lane_shape
                    ]
                ]
                coordinates.extend(geo_coords)
        except Exception as e:
            print(f"Error processing edge {edge}: {e}")

    return coordinates


def sumo_close():
    """
    SUMO simülasyonunu kapatır.
    """
    try:
        if traci.isRunning():
            traci.close()
            print("SUMO simulation closed successfully.")
    except Exception as e:
        print(f"Error closing SUMO: {str(e)}")


 

def sumo():
    # SUMO Konfigürasyon Dosyası
    SUMOCFG_PATH = 'ESOGU_SUMO/buyukdere_v5.sumocfg'
    try:
        # SUMO komutunu başlat
        sumo_binary = os.path.join(os.getenv("SUMO_HOME"), "bin", "sumo-gui")
        print(f"Starting SUMO with binary: {sumo_binary} and config: {SUMOCFG_PATH}")
        traci.start([sumo_binary, "-c", SUMOCFG_PATH, "--start", "--quit-on-end", "--no-step-log", "--step-length", "0.5"])
        print("SUMO started successfully!")
    except Exception as e:
        print(f"Error starting SUMO: {e}")
        raise


    db_connection = MySQLdb.connect(
    host="127.0.0.1",  # Changed from Docker config to standard localhost
    user="root",
    password="123456",
    database="fleetmanagementdb",
    connect_timeout=20
    )
    cursor = db_connection.cursor()


    class Order:
        def __init__(self, order_id, customer_id, customer_name, delivery_start, delivery_end, priority, load_weight, delivery_lat, delivery_long):
            self.order_id = order_id
            self.customer_id = customer_id
            self.customer_name = customer_name
            self.delivery_start = delivery_start
            self.delivery_end = delivery_end
            self.priority = priority
            self.load_weight = load_weight
            self.delivery_lat = delivery_lat
            self.delivery_long = delivery_long

    class Vehicle:
        def __init__(self, vehicle_id, route_id, driver_id):
            self.vehicle_id = vehicle_id
            self.route_id = route_id
            self.driver_id = driver_id
            self.type = traci.vehicle.getTypeID(self.vehicle_id)
            self.max_capacity = float(traci.vehicletype.getParameter(self.type, "maximumBatteryCapacity"))
            self.vehicle_mass = float(traci.vehicletype.getParameter(self.type, "vehicleMass"))
            self.current_latitude = None
            self.current_longitude = None
            self.total_distance_traveled = 0
            self.total_energy_consumption = 0
            self.route_complete_time = datetime.datetime.now().time()
            self.last_battery_status = 0.0

            # Araç ile ilgili siparişleri al
            demands = traci.vehicle.getParameterWithKey(self.vehicle_id, "Demands")[1].split(' ')
            order_ids = traci.vehicle.getParameterWithKey(self.vehicle_id, "OrderIDs")[1].split(' ')
            self.orders = []
            for order_id in order_ids:
                if order_id != '-1':
                    cursor.execute(
                        """SELECT OrderID, CustomerID, CustomerName, DeliveryWindowStart, DeliveryWindowFinish, Priority, LoadWeight, DeliveryLat, DeliveryLong 
                        FROM active_orders WHERE OrderID = %s""",
                        (order_id,)
                    )
                    order = cursor.fetchone()
                    if order:
                        self.orders.append(Order(*order))

    vehicle_dict = {}

    def ManageVehicles():
        vehicle_ids = traci.vehicle.getIDList()
        for vehID in vehicle_ids:
            if vehID not in vehicle_dict:
                cursor.execute(
                    """SELECT route_id, driver_id FROM route_planned WHERE vehicle_id = %s AND status = 0""",
                    (vehID,)
                )
                vehicle_info = cursor.fetchone()
                if vehicle_info:
                    vehicle_dict[vehID] = Vehicle(vehID, vehicle_info[0], vehicle_info[1])
                    print(f"Araç Eklendi: {vehID} (Rota ID: {vehicle_info[0]})")
        for keyID in list(vehicle_dict.keys()):
            if keyID not in vehicle_ids:
                curr_veh = vehicle_dict[keyID]
                cursor.execute(
                    """INSERT INTO route_history (route_id, driver_id, vehicle_id, report_date, covered_distance, energy_consumption) 
                    VALUES (%s, %s, %s, %s, %s, %s)""",
                    (curr_veh.route_id, curr_veh.driver_id, curr_veh.vehicle_id, datetime.date.today(),
                     curr_veh.total_distance_traveled, curr_veh.total_energy_consumption)
                )
                cursor.execute("UPDATE route_planned SET status = 1 WHERE route_id = %s", (curr_veh.route_id,))
                del vehicle_dict[keyID]
                db_connection.commit()

    try:
    # Her simülasyon adımında araçları takip et
        while traci.simulation.getMinExpectedNumber() > 0:
            traci.simulationStep()
            current_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            for vehID in traci.vehicle.getIDList():
                # Araç konumu
                position = traci.vehicle.getPosition(vehID)
                latitude, longitude = traci.simulation.convertGeo(position[0], position[1])
                speed = traci.vehicle.getSpeed(vehID)
                battery_status = float(traci.vehicle.getParameter(vehID, "device.battery.actualBatteryCapacity"))
                max_battery = float(traci.vehicle.getParameter(vehID, "device.battery.maximumBatteryCapacity"))
                state_of_charge = (battery_status / max_battery * 100) if max_battery > 0 else None

                # Planlanan rota
                route_edges = traci.vehicle.getRoute(vehID)
                full_route_coordinates = write_routes_to_json(vehID, route_edges)

                # Gerçekleşen rota (veritabanından önceki rota bilgisi alınır ve yeni konum eklenir)
                cursor.execute(
                    "SELECT actual_path FROM vehicle_tracking WHERE vehicle_id = %s", (vehID,)
                )
                result = cursor.fetchone()
                if result and result[0]:  # Önceden bir actual_path varsa
                    actual_path = json.loads(result[0])
                else:
                    actual_path = []  # Eğer yoksa yeni bir liste başlatılır

                # Yeni konumu gerçekleşen rotaya ekle
                actual_path.append([latitude, longitude])

                # JSON formatında veri hazırla
                data = {
                    "vehicle_id": vehID,
                    "latitude": longitude,
                    "longitude": latitude,
                    "speed": speed,
                    "battery_status": battery_status,
                    "state_of_charge": state_of_charge,
                    "last_updated": current_time
                }

                # MQTT'ye gönder
                send_to_mqtt(MQTT_BROKER, MQTT_PORT, vehID, data)

                # Veritabanına kaydet
                cursor.execute(
                    """INSERT INTO vehicle_tracking (vehicle_id, latitude, longitude, speed, battery_status, state_of_charge, last_updated, planned_path, actual_path)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE 
                        latitude = VALUES(latitude), 
                        longitude = VALUES(longitude),
                        speed = VALUES(speed), 
                        battery_status = VALUES(battery_status), 
                        state_of_charge = VALUES(state_of_charge), 
                        last_updated = VALUES(last_updated)
                        """,
                    (vehID, longitude, latitude, speed, battery_status, state_of_charge, current_time,
                    json.dumps(full_route_coordinates), json.dumps(actual_path))
                )

                db_connection.commit()



                # Rotayı JSON'a yaz
               # Write route to JSON
                route_edges = traci.vehicle.getRoute(vehID)
                write_routes_to_json(vehID, route_edges)


    except Exception as e:
        print(f"Simülasyon Hatası: {e}")
    finally:
        traci.close()
        mqtt_client.disconnect()
        cursor.close()
        db_connection.close()
        print("Simülasyon Tamamlandı ve Bağlantılar Kapatıldı.")

# def check_and_alert_delivery(node, vehicle_id):
#     service_info = node.find("ServiceInformation")
#     perf = node.find("PerformanceMeasure")
#     if service_info is not None and perf is not None:
#         arrival = float(service_info.findtext("ArrivalTime", "0"))
#         due = float(service_info.findtext("DueDate", "0"))
#         tardiness = float(perf.findtext("AccTardiness", "0"))
#         node_id = node.attrib.get("NodeId")
#         if arrival > due or tardiness > 0:
#             alert = {
#                 "type": "Warning",
#                 "message": f"{vehicle_id} aracı {node_id} teslimatında gecikti!",
#                 "detail": f"Varış: {arrival}, Son teslim: {due}, Gecikme: {tardiness}",
#                 "resolved": False
#             }
#             # Burada alert'i kaydet, logla veya frontend'e ilet
#             print("ALERT:", alert)

if __name__ == "__main__":
    sumo()
