import traci 
import xml.etree.ElementTree as ET


def get_stop_positions(cs_file, stop_ids):
    # Load and parse the XML file
    tree = ET.parse(cs_file)
    root = tree.getroot()

    stop_positions = []
    
    for stop_id in stop_ids:
        stop_data = {}
        if stop_id.startswith("cs"):
            for container_stop in root.findall("chargingStation"):
                if container_stop.get('id') == stop_id:
                    # Get end position
                    lane_id = container_stop.get('lane')
                    end_pos = (float(container_stop.get('endPos')) + float(container_stop.get('startPos'))) / 2
                    edge_id = lane_id.split('_')[0]
                    stop_data[stop_id] = (edge_id, end_pos)
                    stop_positions.append(stop_data)
                    break
        else:
            # Look for each containerStop
            for container_stop in root.findall("containerStop"):
                if container_stop.get('id') == stop_id:
                    # Get end position
                    lane_id = container_stop.get('lane')
                    end_pos = (float(container_stop.get('endPos')) + float(container_stop.get('startPos'))) / 2
                    edge_id = lane_id.split('_')[0]  # Delete the lane ID from the edge ID
                    stop_data[stop_id] = (edge_id, end_pos)
                    stop_positions.append(stop_data)
                    break
    return stop_positions

import traci

def find_route_between_stops(start_edge, end_edge):
    
    """ NOT :  FA 31.10.2024 : 
    
    Eğer start_edge ve end_edge aynı ise aynı edge olarak alınabilir. (Ya da hata da alabilir?)
    Serhatın attığı yöntem olan path/edge okuyup yaparak sorun çözülebilir. 
    
    """
    route = traci.simulation.findRoute(fromEdge=start_edge, toEdge=end_edge)
    return route.edges

def create_full_route(stop_positions: list[dict]):
    # [{'cs5': ('669466787#2', 21.38)}, {'9': ('-642121509#0', 154.94)}, {'22A': ('-212712099#1', 86.55)}, {'cs5': ('669466787#2', 21.38)}]
    full_route = []
    previous_edge = None

    # Create a list of stop edges from stop positions
    stop_edges_seq = [list(position.values())[0][0] for position in stop_positions]
    
    for i in range(len(stop_edges_seq) - 1):
        # Use a function to find route between two stops
        segment_route = find_route_between_stops(stop_edges_seq[i], stop_edges_seq[i+1])
        if len(segment_route) == 0:
            print(f"Warning: No route found between {stop_edges_seq[i]} and {stop_edges_seq[i+1]}")
        else:
            # If the same edge comes in a row, filter them to prevent issues in SUMO
            filtered_segment_route = []
            for edge in segment_route:
                if edge != previous_edge:
                    filtered_segment_route.append(edge)
                    previous_edge = edge
            
            full_route.extend(filtered_segment_route)
    
    return full_route