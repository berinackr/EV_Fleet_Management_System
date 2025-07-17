from AlnsObjects import Route, Solution
import xml.etree.ElementTree as ET
from sumoUtil import *
import traci 
import os 
import sys 
import json 
import sumolib


project_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_path)

cs_file = os.path.join(project_path, 'Tests', 'data', 'esogu_test_map_v3.2', 'cs.add.xml')
sumo_cfg = os.path.join(project_path, 'Tests',  'data', 'esogu_test_map_v3.2', 'dennn.sumocfg')
path_file = os.path.join(project_path, 'Tests',  'data', 'esogu_test_map_v3.2', 'path_v3.2.txt')
edge_file  = os.path.join(project_path, 'Tests',  'data', 'esogu_test_map_v3.2', 'path_edge_v3.2.txt')
osm_net_file = os.path.join(project_path, 'Tests', 'data', 'esogu_test_map_v3.2', 'osm.net.xml')

# cs_file = os.path.join(project_path, 'Tests', 'data', 'kalabak_test_map_v3', 'cs.add.xml')
# sumo_cfg = os.path.join(project_path, 'Tests', 'data', 'kalabak_test_map_v3', 'kalabak.sumocfg')
# # path_file = os.path.join(project_path, 'Tests', 'data', 'kalabak_test_map_v3', 'path_v3.2.txt')
# # edge_file = os.path.join(project_path, 'Tests', 'data', 'kalabak_test_map_v3', 'path_edge_v3.2.txt')
# osm_net_file = os.path.join(project_path, 'Tests', 'data', 'kalabak_test_map_v3', 'osm.net.xml')

def get_lane_centers(route_edges):
    lane_centers = []
    for edge in route_edges:
        lane_id = edge + "_0"  # "_0" assumes the use of the first lane; adjust as needed
        lane_shape = traci.lane.getShape(lane_id)  # Retrieves points along the lane center
        lane_centers.extend(lane_shape)  # Collect all points along the lane
    return lane_centers

def get_geographic_route(lane_centers):
    geo_route = []
    for coord in lane_centers:
        lon, lat = traci.simulation.convertGeo(coord[0], coord[1])
        geo_route.append((lat, lon))
    return geo_route

def get_waypoints_with_traci(fromNode, toNode):
    waypoints = []
    stop_ids = []
    combined_coords = []
    previous_edge_last_point = None
    stop_ids.append(fromNode.id)
    stop_ids.append(toNode.id)
    try :
        stop_positions = get_stop_positions(cs_file, stop_ids)
        traci.start(["sumo", "-c", sumo_cfg])
        full_route_edges = create_full_route(stop_positions)
        print("Full Route Edges: ", full_route_edges)
        net = sumolib.net.readNet(osm_net_file)
        for edge_id in full_route_edges:
            edge = net.getEdge(edge_id)
            if edge:
                shape = edge.getShape()
                edge_coords = []
                for x, y in shape:
                    try:
                        lon, lat = net.convertXY2LonLat(x, y)
                        edge_coords.append((lat, lon))
                    except Exception as e:
                        print(f"Failed to convert coordinates for edge '{edge_id}': {e}")
                if edge_coords:
                    if (
                        previous_edge_last_point
                        and edge_coords[0] == previous_edge_last_point
                    ):
                        # İlk noktayı atlayarak tekrar etmeyi önlüyoruz
                        combined_coords.extend(edge_coords[1:])
                    else:
                        combined_coords.extend(edge_coords)
                    previous_edge_last_point = edge_coords[-1]
            else:
                print(f"Edge '{edge_id}' ağda bulunamadı.")
    except:
        print("Error occurred while creating route.")
    finally:
        traci.close()
        
    # avg_lat = sum(lat for lat, lon in combined_coords) / len(combined_coords)
    # avg_lon = sum(lon for lat, lon in combined_coords) / len(combined_coords)
    
    
    results = [
        {
            "location": {
                "latitude": coords[0],
                "longitude": coords[1]
            }
        }
        for coords in combined_coords
    ]
    
    return results[:-2]

def solution_to_Route4VehicleXML(solution: Solution):
    root_elem = ET.Element("Route4Vehicle")
    
    name = solution.problemFile.fileName
    locations = []
    output_data = {
        "routes": []  # Rotaları tutacak liste
    }
    result = []
    for route_id, route in enumerate(solution.routes):
                
        route_data = {
            "id": route_id,
            "name": f"test_{name}",
        }
        locations = []
        last_waypoints = None
        for ind, node in enumerate(route.route):
            latitude, longitude = node.lat, node.lon
            obj = {
                "id": node.id,
                "location": {
                    "latitude": latitude,
                    "longitude": longitude
                }
            }
            # Waypoints ekleme
            if ind < len(route.route) - 1:  # Son elemandan önceki noktalar
                waypoints = get_waypoints_with_traci(route.route[ind], route.route[ind + 1])
                # waypoints = get_waypoints_with_pathtxt(route.route[ind], route.route[ind + 1])
                obj["waypoints"] = waypoints
                if ind == len(route.route) - 2:
                    last_waypoints = waypoints  # Son waypoint'i sakla
            else:
                obj["waypoints"] = []  # Son nokta için waypoint boş

            # Start, End ve Delivery Points'i ayır
            if ind == 0:
                route_data["start_point"] = obj
            elif ind == len(route.route) - 2:
                # Son elemandan bir önceki nokta
                locations.append(obj)  # Teslimat noktası olarak eklenir
                route_data["end_point"] = {
                    "id": route.route[ind + 1].id,
                    "location": {
                        "latitude": route.route[ind + 1].lat,
                        "longitude": route.route[ind + 1].lon
                    },
                    "waypoints": last_waypoints
                }
            elif ind == len(route.route) - 1:
                pass  # End Point zaten yukarıda eklendi
            else:
                # Delivery Points
                locations.append(obj)

        route_data["delivery_points"] = locations
        output_data["routes"].append(route_data)

    # JSON çıktısı
    return output_data