from AlnsObjects import Route, Solution
from DataObjects.ChargeStation import ChargeStation
from DataObjects.Customer import Customer
from DataObjects.Target import Target
import xml.etree.ElementTree as ET
import xml.dom.minidom as minidom
import pandas as pd
import re
import json
import datetime
import sys 
import os

def get_objective_function_option(_objective_function : str)->str:
    
    if _objective_function == "total_distance":
        return "MinDistance"
    elif _objective_function == "total_time":
        return "MinTime"
    elif _objective_function == "total_energy":
        return "MinEnergy"
    elif _objective_function == "total_tardiness":
        return "MinTardiness"

def get_charging_strategy_option(_charging_strategy : str)->str:
    
    if _charging_strategy == "full":
        return "FullCharge"
    elif _charging_strategy == "partial":
        return "PartialCharge"
    elif _charging_strategy == "20-80":
        return "20-80"

def solution_to_Route4PlanXML(solution: Solution, performanceMeasure):
        
    # Solution metrikleri 
    filename=solution.problemFile.fileName
    problem_type = "CEVRP"
    
    runtime = solution.runtime

    
    total_distance = performanceMeasure["total_distance"]
    total_energy =  performanceMeasure["total_energy"]
    total_time = performanceMeasure["total_time"]
    total_tardiness = performanceMeasure["total_tardiness"]
    charging_time = performanceMeasure["total_charging_time"]
    
    
    _objective_function = solution.requirements_dict["obj_function_option"]
    objective_function = get_objective_function_option(_objective_function)
    _charging_strategy = solution.requirements_dict["charge_option"]
    charging_strategy = get_charging_strategy_option(_charging_strategy)
    
    number_of_customers = len(solution.problemFile.customers)
    battery_capacity = solution.requirements_dict["tank_capacity"]
    max_speed = solution.requirements_dict["vmax"]
    vehicle_mass = 1000
    maximum_load_volume = 0 
    maximum_load_kg = solution.requirements_dict["load_capacity"]
    battery_recharging_rate = solution.requirements_dict["charging_rate"]
    energy_consumption_rate = solution.requirements_dict["fuel_consumption_rate"]
    
    number_of_charge_station = solution.getNumberOfStation()
    number_of_nodes = solution.getNumberOfNodes()
    number_of_served_customers = len(solution.served_customers)
    start_time = 0
    # total_tardiness = 
    
    # for route in solution.routes:
    #     total_tardiness += route.calculate_total_tardiness()
        
    # total_distance, total_energy, total_time, charging_time, tw_result = calculate_objectives(solution)
    # ROOT
    root = ET.Element("Route4Plan", attrib={
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"
    })
    # SOLUTION KISMI 
    solution_elem = ET.SubElement(root, "Solution")
    solution_elem.set("Name", filename)
    solution_elem.set("ProblemType", problem_type)
    solution_elem.set("ObjectiveFunction", objective_function)
    solution_elem.set("ChargingStrategy", charging_strategy)
    solution_elem.set("NumberOfCustomers", str(number_of_customers))
    solution_elem.set("BatteryCapacity", str(battery_capacity))
    solution_elem.set("MaxSpeed", str(max_speed))
    solution_elem.set("VehicleMass", str(vehicle_mass))
    solution_elem.set("MaximumLoadCapacityVolume", str(maximum_load_volume))
    solution_elem.set("MaximumLoadCapacityKg", str(maximum_load_kg))
    solution_elem.set("BatteryRechargingRate", str(battery_recharging_rate))
    solution_elem.set("EnergyConsumptionRate", str(energy_consumption_rate))
    
    perf_measure = ET.SubElement(solution_elem, "PerformanceMeasure")
    ET.SubElement(perf_measure, "Runtime").text = str(runtime)
    ET.SubElement(perf_measure, "StartTime").text = str(start_time)
    ET.SubElement(perf_measure, "TotalDistance").text = str(total_distance)
    ET.SubElement(perf_measure, "TotalDuration").text = str(total_time)
    ET.SubElement(perf_measure, "TotalEnergyConsumption").text = str(total_energy)
    ET.SubElement(perf_measure, "TotalTardiness").text = str(total_tardiness)
    # ET.SubElement(perf_measure, "TotalCost").text = 
    ET.SubElement(perf_measure, "TotalChargingTime").text = str(charging_time)
    ET.SubElement(perf_measure, "NumberOfNodes").text = str(number_of_nodes)
    ET.SubElement(perf_measure, "NumberOfServedCustomers").text = str(number_of_served_customers)
    ET.SubElement(perf_measure, "NumberOfChargeStation").text = str(number_of_charge_station)

    # ROUTES KISMI 
    routes_elem = ET.SubElement(solution_elem, "Routes")

    for idx, route in enumerate(solution.routes):
        
        route_distance = route.calculate_total_distance()
        route_duration = route.calculate_total_time()
        route_energy = route.calculate_total_energy()
        route_tardiness = route.calculate_total_tardiness()
        # route_cost = route.calculate_total_cost()
        route_charging_time = route.calculate_charging_time()
        number_of_nodes = len(route.route)
        number_of_charge_station = route.number_of_charge_stations()
        # ROUTE bilgileri 
        route_elem = ET.SubElement(routes_elem, "Route")
        route_elem.set("RouteId", f"Route {idx+1}")
        route_elem.set("VehicleId", f"Vehicle {idx+1}")
        route_elem.set("DriverId", f"Driver {idx+1}")

        route_performance = ET.SubElement(route_elem, "PerformanceMeasure")
        ET.SubElement(route_performance, "StartTime").text = str(start_time)
        start_time = start_time + route_duration
        # PerformanceMeasure metrics
        ET.SubElement(route_performance, "RouteDistance").text = str(route_distance)
        ET.SubElement(route_performance, "RouteDuration").text = str(route_duration)
        ET.SubElement(route_performance, "RouteEnergyConsumption").text = str(route_energy)
        ET.SubElement(route_performance, "RouteTardiness").text = str(route_tardiness)
        # ET.SubElement(performance_measure_elem, "TotalCost").text = str(route_cost)
        ET.SubElement(route_performance, "RouteChargingTime").text = str(route_charging_time)
        ET.SubElement(route_performance, "NumberOfNodes").text = str(number_of_nodes)
        ET.SubElement(route_performance, "NumberOfChargeStation").text = str(number_of_charge_station)

        # Nodes element
        nodes_elem = ET.SubElement(route_elem, "Nodes")
        
        for i in range(0, len(route.route)):
            node = route.route[i]
            
            node_distance = route.calculate_total_distance(node) if i!= 0 else 0
            node_duration = route.calculate_total_time(node) if i!= 0 else 0
            node_energy = route.calculate_total_energy(node) if i!= 0 else 0
            node_tardiness = route.calculate_total_tardiness(node) if i!= 0 else 0
            node_cost = -1
            node_remaining_charge = route.calculate_remaining_tank_capacity(node) if i!= 0 else 0
            node_remaining_payload = route.calculate_remaining_payload_capacity(node)
            node_remaining_capacity = float(maximum_load_kg) - node_remaining_payload
            
            

            if type(node) == ChargeStation:
                node_type = "ChargeStation"
                ready_time, waiting_time, service_time, due_date, arrival_time = "0", "0", str(node.service_time), "0", "0"
                weight, volume, units = "0", "0", "0"
            elif type(node) == Customer:
                node_type = "Customer"
                ready_time = str(node.ready_time)
                waiting_time = str(route.calculate_waiting_time(node))
                service_time = str(node.service_time)
                due_date = str(node.due_date)
                arrival_time = str(route.calculate_arrival_time(node))
                weight = str(node.demand)
                volume = "0"
                units = str(node.quantity)
            elif type(node) == Target:
                if i == 0 : 
                    node_type = "Depot"
                    ready_time, waiting_time, service_time, due_date, arrival_time = "0", "0", "0", "0", "0"
                    weight, volume, units = "0", "0", "0"
                    node_remaining_charge = battery_capacity
                    node_remaining_payload = maximum_load_kg
                    node_remaining_capacity = 0
                else:
                    node_type = "Depot"
                    ready_time, waiting_time, service_time, due_date = "0", "0", "0", "0"
                    weight, volume, units = "0", "0", "0"
                    arrival_time = str(route.calculate_arrival_time(node)) 
                    # node_remaining_charge = battery_capacity
                    # node_remaining_payload = maximum_load_kg
                    # node_remaining_capacity = 0    
            else:
                node_type = "Unknown"
                ready_time, waiting_time, service_time, due_date, arrival_time = "Unknown", "Unknown", "Unknown", "Unknown", "Unknown"
                weight, volume, units = "Unknown", "Unknown", "Unknown"
            

                
            node_elem = ET.SubElement(nodes_elem, "Node")
            node_elem.set("NodeId", str(node.id))
            node_elem.set("NodeType", str(node_type))
            
            location_elem = ET.SubElement(node_elem, "Location")
            ET.SubElement(location_elem, "Latitude").text = str(node.lat)
            ET.SubElement(location_elem, "Longitude").text = str(node.lon)
            ET.SubElement(location_elem, "Elevation").text = "0"
            # Time-related information
            time_info_elem = ET.SubElement(node_elem, "ServiceInformation")
            ET.SubElement(time_info_elem, "ReadyTime").text = ready_time
            ET.SubElement(time_info_elem, "WaitingTime").text = waiting_time
            ET.SubElement(time_info_elem, "ServiceTime").text = service_time
            ET.SubElement(time_info_elem, "DueDate").text = due_date
            ET.SubElement(time_info_elem, "ArrivalTime").text = arrival_time
            # Delivery information
            delivery_elem = ET.SubElement(node_elem, "LoadInformation")
            ET.SubElement(delivery_elem, "Weight").text = weight
            ET.SubElement(delivery_elem, "Volume").text = volume
            ET.SubElement(delivery_elem, "Units").text = units
            node_performance = ET.SubElement(node_elem, "PerformanceMeasure")
            ET.SubElement(node_performance, "AccDistance").text = str(node_distance)
            ET.SubElement(node_performance, "AccDuration").text = str(node_duration)
            ET.SubElement(node_performance, "AccEnergy").text = str(node_energy)
            ET.SubElement(node_performance, "AccTardiness").text = str(node_tardiness)
            # ET.SubElement(node_elem, "NodeCost").text = str(node_cost)
            ET.SubElement(node_performance, "RemainingCharge").text = str(node_remaining_charge)
            remaining_capacity = ET.SubElement(node_performance, "RemainingCapacity")
            ET.SubElement(remaining_capacity, "Volume").text = "0"
            ET.SubElement(remaining_capacity, "Weight").text = str(node_remaining_capacity)
            remaining_payload = ET.SubElement(node_performance, "RemainingPayload")
            ET.SubElement(remaining_payload, "Volume").text = "0"
            ET.SubElement(remaining_payload, "Weight").text = str(node_remaining_payload)

            
            
    xml_string = ET.tostring(root, encoding="UTF-8")
    xml_result = minidom.parseString(xml_string).toprettyxml(indent="    ")
    
    return xml_result
