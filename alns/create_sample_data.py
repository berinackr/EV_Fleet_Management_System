import os
import xml.dom.minidom
from xml.etree import ElementTree as ET

def create_directory():
    """Create the SampleData directory if it doesn't exist"""
    sample_dir = os.path.join(os.path.dirname(__file__), "SampleData")
    os.makedirs(sample_dir, exist_ok=True)
    return sample_dir

def create_sample_info4task(directory):
    """Create a sample Info4Task XML file"""
    root = ET.Element("Info4Task")
    root.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    root.set("xsi:noNamespaceSchemaLocation", "Info4Task.xsd")
    
    # Add TaskList
    task_list = ET.SubElement(root, "TaskList")
    
    for i in range(1, 6):  # 5 sample tasks
        task = ET.SubElement(task_list, "Task")
        task.set("id", f"task{i}")
        task.set("name", f"Task {i}")
        
        # Location
        location = ET.SubElement(task, "Location")
        location.set("id", f"loc{i}")
        location.set("lat", f"{39.75 + (i * 0.001)}")
        location.set("lon", f"{30.48 + (i * 0.001)}")
        
        # Time window
        time_window = ET.SubElement(task, "TimeWindow")
        time_window.set("earliestTime", f"{100 + (i * 50)}")
        time_window.set("latestTime", f"{200 + (i * 50)}")
        
        # Duration
        duration = ET.SubElement(task, "Duration")
        duration.text = f"{i * 10}"
        
        # Demand
        demand = ET.SubElement(task, "Demand")
        demand.text = f"{i * 5}"
    
    # Format and save
    xml_string = ET.tostring(root, encoding="utf-8")
    xml_pretty = xml.dom.minidom.parseString(xml_string).toprettyxml(indent="  ")
    
    file_path = os.path.join(directory, "sample_info4task.xml")
    with open(file_path, "w") as f:
        f.write(xml_pretty)
    
    return file_path

def create_sample_info4vehicle(directory):
    """Create a sample Info4Vehicle XML file"""
    root = ET.Element("Info4Vehicle")
    root.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    root.set("xsi:noNamespaceSchemaLocation", "Info4Vehicle.xsd")
    
    # Add VehicleList
    vehicle_list = ET.SubElement(root, "VehicleList")
    
    for i in range(1, 3):  # 2 sample vehicles
        vehicle = ET.SubElement(vehicle_list, "Vehicle")
        vehicle.set("id", f"vehicle{i}")
        vehicle.set("name", f"Vehicle {i}")
        
        # Capacity
        capacity = ET.SubElement(vehicle, "Capacity")
        capacity.text = f"{100 + (i * 50)}"
        
        # Battery capacity
        battery = ET.SubElement(vehicle, "BatteryCapacity")
        battery.text = f"{200 + (i * 100)}"
        
        # Energy consumption
        energy = ET.SubElement(vehicle, "EnergyConsumption")
        energy.text = f"{0.1 + (i * 0.05)}"
        
        # Speed
        speed = ET.SubElement(vehicle, "Speed")
        speed.text = f"{30 + (i * 5)}"
    
    # Format and save
    xml_string = ET.tostring(root, encoding="utf-8")
    xml_pretty = xml.dom.minidom.parseString(xml_string).toprettyxml(indent="  ")
    
    file_path = os.path.join(directory, "sample_info4vehicle.xml")
    with open(file_path, "w") as f:
        f.write(xml_pretty)
    
    return file_path

def create_sample_info4environment(directory):
    """Create a sample Info4Environment XML file"""
    root = ET.Element("Info4Environment")
    root.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    root.set("xsi:noNamespaceSchemaLocation", "Info4Environment.xsd")
    
    # Add depot
    depot = ET.SubElement(root, "Depot")
    depot.set("id", "depot1")
    depot.set("lat", "39.750")
    depot.set("lon", "30.480")
    
    # Add charging stations
    station_list = ET.SubElement(root, "ChargingStations")
    
    for i in range(1, 4):  # 3 sample charging stations
        station = ET.SubElement(station_list, "ChargingStation")
        station.set("id", f"cs{i}")
        station.set("lat", f"{39.752 + (i * 0.001)}")
        station.set("lon", f"{30.485 + (i * 0.001)}")
        station.set("chargingRate", f"{50 + (i * 10)}")
    
    # Format and save
    xml_string = ET.tostring(root, encoding="utf-8")
    xml_pretty = xml.dom.minidom.parseString(xml_string).toprettyxml(indent="  ")
    
    file_path = os.path.join(directory, "sample_info4environment.xml")
    with open(file_path, "w") as f:
        f.write(xml_pretty)
    
    return file_path

def create_sample_input(directory):
    """Create a sample Input XML file"""
    root = ET.Element("Input")
    root.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    root.set("xsi:noNamespaceSchemaLocation", "Input.xsd")
    
    # ALNS parameters
    params = ET.SubElement(root, "Parameters")
    
    iterations = ET.SubElement(params, "MaxIterations")
    iterations.text = "500"
    
    cooling = ET.SubElement(params, "CoolingRate")
    cooling.text = "0.9995"
    
    temperature = ET.SubElement(params, "InitialTemperature")
    temperature.text = "100"
    
    omega = ET.SubElement(params, "Omega")
    omega.text = "0.5"
    
    op_percent = ET.SubElement(params, "OperatorPercentage")
    op_percent.text = "0.1"
    
    z_param = ET.SubElement(params, "Z")
    z_param.text = "3"
    
    k_param = ET.SubElement(params, "K")
    k_param.text = "5"
    
    n_param = ET.SubElement(params, "N")
    n_param.text = "20"
    
    # Objective function
    obj_function = ET.SubElement(root, "ObjectiveFunction")
    obj_function.text = "TOTAL_DISTANCE"
    
    # Format and save
    xml_string = ET.tostring(root, encoding="utf-8")
    xml_pretty = xml.dom.minidom.parseString(xml_string).toprettyxml(indent="  ")
    
    file_path = os.path.join(directory, "sample_input.xml")
    with open(file_path, "w") as f:
        f.write(xml_pretty)
    
    return file_path

def main():
    """Create all sample data files"""
    directory = create_directory()
    print(f"Created directory: {directory}")
    
    info4task = create_sample_info4task(directory)
    print(f"Created sample Info4Task: {info4task}")
    
    info4vehicle = create_sample_info4vehicle(directory)
    print(f"Created sample Info4Vehicle: {info4vehicle}")
    
    info4environment = create_sample_info4environment(directory)
    print(f"Created sample Info4Environment: {info4environment}")
    
    input_xml = create_sample_input(directory)
    print(f"Created sample Input XML: {input_xml}")
    
    print("All sample files created successfully.")

if __name__ == "__main__":
    main()
