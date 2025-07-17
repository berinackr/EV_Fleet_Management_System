from AlnsObjects import Route, Solution
from DataObjects.ChargeStation import ChargeStation
from DataObjects.Customer import Customer
from DataObjects.Target import Target
import xml.etree.ElementTree as ET
import xml.dom.minidom as minidom
import pandas as pd
import os
import sys

project_path = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_path)
util_path = os.path.join(project_path, "Util")
sys.path.append(util_path)

from Util.sumoUtil import *
import sys 

def solution_to_Route4SimXML(solution):
    
    
    main_path = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

    path = os.path.join(main_path, "Tests", "data", "esogu_test_map_v3.2")
    cs_file = os.path.join(path, "cs.add.xml")
    sumocfg_file = os.path.join(path, "dennn.sumocfg")
    # path = os.path.join(main_path, "Tests", "data", "kalabak_test_map_v3")
    # cs_file = os.path.join(path, "cs.add.xml")
    # sumocfg_file = os.path.join(path, "kalabak.sumocfg")
        
    
    # Routes element
    routes_elem = ET.Element(
        "routes", 
        attrib={
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:noNamespaceSchemaLocation": "http://sumo.dlr.de/xsd/routes_file.xsd"
        }
    )
    
    max_speed = solution.requirements_dict["vmax"]
    vType = ET.SubElement(routes_elem, "vType", attrib={
        "id": "evehicle",
        "length": "2.88",
        "minGap": "2.50",
        "maxSpeed": str(max_speed),
        "vClass": "evehicle",
        "emissionClass": "Energy/default",
        "accel": "1.0",
        "decel": "1.0",
        "sigma": "0.0"
    })
    
    # <Robot Capacity="200" Vmax="12,5" Vmin="12,5" 
    # NumberOfRobots="200" 
    # vehicleMass="2100" 
    # rollDragCoefficient="0,01" 
    # airDragCoefficient="0,29" 
    # frontSurfaceArea="3,23" 
    # gravity="9,81" 
    # airDensity="1,225" 
    # drivetrainEfficiency="0,8" />
    battery_capacity = solution.requirements_dict["tank_capacity"]
    print("requirements_dict: ", solution.requirements_dict)
    frontSurfaceArea = solution.requirements_dict["front_surface_area"]
    mass = solution.requirements_dict["vehicle_mass"]
    
    params = {
        "airDragCoefficient": 0.48,                      # Sürüklenme katsayısı
        "constantPowerIntake": 100,                      # Sabit güç tüketimi (kW)
        "device.battery.capacity": battery_capacity,                 # Gerçek pil kapasitesi (kWh)
        "device.battery.chargeLevel": battery_capacity,                    # Pilin mevcut kapasitesi (kWh)
        "device.battery.stoppingThreshold": 0.1,        # Araç kütlesi (kg)
        "engine.efficiency": 0.8,                        # Motor verimliliği (0-1 arası)
        "frontSurfaceArea": frontSurfaceArea,                        # Araç ön yüzey alanı (m²)
        "engine.power.max": 1000,                        # Maksimum motor gücü (kW)
        "has.battery.device": "true",                       # Pil cihazının varlığı (True/False)
        "mass" : mass,
        "propulsionEfficiency": 0.9,                     # İtme verimliliği (0-1 arası)
        "radialDragCoefficient": 0.5,                    # Radial sürüklenme katsayısı
        "recuperationEfficiency": 0.9,                   # Geri kazanım verimliliği (0-1 arası)
        "rollDragCoefficient": 0.01,                     # Yuvarlanma sürüklenme katsayısı
        "rotatingMass": 0.01                     
    }

    
    for key, value in params.items():
        # Convert boolean values to string for XML representation
        ET.SubElement(vType, "param", key=key, value=str(value))

   
    # vehicle elements
    for idx, route in enumerate(solution.routes):
        
        nodes_list = []
        # for node in route.route:
        #     if node.id == "58/2":
        #         nodes_list.append("58/1")
        #     elif node.id == "61A/2":
        #         nodes_list.append("61A/1")
        #     else:
        #         nodes_list.append(str(node.id))
        
        for node in route.route:
            nodes_list.append(str(node.id))
        
        
        print("----------------------------------------------------------------")
        print("stop positions: ", nodes_list)
        print("cs_file: ", cs_file)
        
        try :
            stop_positions = get_stop_positions(cs_file, nodes_list)
            print("----------------------------------------------------------------")
            print("stop positions: ", stop_positions)
            print("cs_file: ", cs_file)
            print("----------------------------------------------------------------")
            traci.start(["sumo", "-c", sumocfg_file])
            full_route_edges = create_full_route(stop_positions)
        except:
            print("Error occurred while creating route.")
            continue
        finally:
            traci.close()
        
        vehicle_elem = ET.SubElement(routes_elem, "vehicle")
        vehicle_elem.set("id", "veh"+str(idx))
        vehicle_elem.set("type", "evehicle")
        vehicle_elem.set("depart", "5.11")
        vehicle_elem.set("color", "red")
        
        charging_time = route.calculate_charging_time()
        
        ET.SubElement(vehicle_elem, "param", key="device.battery.chargeLevel", value=str(battery_capacity))
        route_elem = ET.SubElement(vehicle_elem, "route")
        route_elem.set("edges", " ".join(full_route_edges))
        for node in route.route:
            if type(node) == ChargeStation:
                stop_elem = ET.SubElement(vehicle_elem, "stop")
                stop_elem.set("chargingStation", str(node.id))
                duration = node.service_time
                stop_elem.set("duration", str(duration))
            elif type(node) == Target:
                stop_elem = ET.SubElement(vehicle_elem, "stop")
                stop_elem.set("chargingStation", str(node.id))
                duration = node.service_time
                stop_elem.set("duration", "0")
            elif type(node) == Customer:
                stop_elem = ET.SubElement(vehicle_elem, "stop")
                stop_elem.set("containerStop", str(node.id))
                duration = node.service_time
                stop_elem.set("duration", str(duration))


    xml_string = ET.tostring(routes_elem, encoding="UTF-8")
    xml_result = minidom.parseString(xml_string).toprettyxml(indent="    ")

    return xml_result
