// csv_simulator.js
const fs = require("fs");
const mqtt = require("mqtt");
const csv = require("csv-parser");

const client = mqtt.connect("mqtt://159.146.83.30:18883");
const topic = "json/secret/musoshi003/attrs";
const csvFilePath = "./vehicleData_t_0_table_with_load.csv"; 

let rows = [];
let currentIndex = 0;

function streamCSV() {
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (data) => rows.push(data))
    .on("end", () => {
      console.log(`CSV yüklendi. Toplam ${rows.length} satır var.`);
      startPublishing();
    });
}

function transformRow(row) {
  return {
    driver_id: "User1",
    route_id: "5",
    vehicle_id: "musoshi003",
    vehicle_speed: parseFloat(row.vehicle_speed),
    Odometer: parseFloat(row.Odometer),
    charging_status: "OFF",
    SoC: parseFloat(row.SoC),
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    altitude: parseFloat(row.altitude),
    cabin_temperature: parseFloat(row.cabin_temperature),
    outdoor_temperature: parseFloat(row.outdoor_temperature),
    slope: parseFloat(row.slope),
    driver_behavior: parseInt(row.driver_behavior),
    soc_estimation: parseFloat(row.soc_estimation),
    Time_Stamp: row.Time_Stamp,
    PACK_Q_SOC_INTERNAL: parseFloat(row.PACK_Q_SOC_INTERNAL),
    PACK_V_SUM_OF_CELLS: parseFloat(row.PACK_V_SUM_OF_CELLS),
    PACK_I_HALL: parseFloat(row.PACK_I_HALL),
    CELL_T_MIN_VAL: parseFloat(row.CELL_T_MIN_VAL),
    CELL_T_MAX_VAL: parseFloat(row.CELL_T_MAX_VAL),
    power_bar: parseInt(row.power_bar),
    brake_malfunction: row.brake_malfunction,
    system_failure: row.system_failure,
    FaultCode: row.FaultCode,
    DC_Link_Voltage: parseFloat(row.DC_Link_Voltage),
    Mode_Control: row.Mode_Control,
    MotorTemperature: parseFloat(row.MotorTemperature),
    Temperature_Remaining: parseFloat(row.Temperature_Remaining),
    range: parseInt(row.range),
    DC_Link_Current: parseFloat(row.DC_Link_Current),
    Total_Number_Errors: parseInt(row.Total_Number_Errors),
    CMU1_Cell_6: parseFloat(row.CMU1_Cell_6),
    CMU1_Cell_2: parseFloat(row.CMU1_Cell_2),
    CMU1_Cell_12: parseFloat(row.CMU1_Cell_12),
    CMU1_Cell_4: parseFloat(row.CMU1_Cell_4),
    CMU1_Cell_9: parseFloat(row.CMU1_Cell_9),
    CMU1_Cell_10: parseFloat(row.CMU1_Cell_10),
    CMU1_Cell_7: parseFloat(row.CMU1_Cell_7),
    CMU1_Cell_8: parseFloat(row.CMU1_Cell_8),
    CMU1_Cell_11: parseFloat(row.CMU1_Cell_11),
    CMU1_Cell_1: parseFloat(row.CMU1_Cell_1),
    CMU1_Cell_5: parseFloat(row.CMU1_Cell_5),
    CMU1_Cell_3: parseFloat(row.CMU1_Cell_3),
    CMU2_Cell_6: parseFloat(row.CMU2_Cell_6),
    CMU2_Cell_2: parseFloat(row.CMU2_Cell_2),
    CMU2_Cell_12: parseFloat(row.CMU2_Cell_12),
    CMU2_Cell_4: parseFloat(row.CMU2_Cell_4),
    current_load_kg: parseFloat(row.current_load_kg)
  };
}

function startPublishing() {
  setInterval(() => {
    if (rows.length === 0) return;

    const row = rows[currentIndex];
    const payload = transformRow(row);

    client.publish(topic, JSON.stringify(payload), { qos: 1, retain: true });
    console.log("Gönderildi:", payload);

    currentIndex = (currentIndex + 1) % rows.length; // döngü
  }, 1000);
}

client.on("connect", () => {
  console.log("MQTT bağlantısı sağlandı. CSV verisi gönderilmeye başlanıyor...");
  streamCSV();
});