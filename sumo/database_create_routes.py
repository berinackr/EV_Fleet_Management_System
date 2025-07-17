import MySQLdb
import datetime
import pandas as pd
import xml.etree.ElementTree as ET
import filepath_constants


def create_routes_in_db():
    db_connection = MySQLdb.connect(host = "127.0.0.1", user="root", password = "123456", database = "fleetmanagementdb")
    cursor = db_connection.cursor()


    SUMO_ROU_FILE = filepath_constants.SUMO_ROU_FILE

    class RoutePoint:
        def __init__(self):      
            self.RouteID = '' #
            self.PointID = '' #
            self.index = 0
            self.order_id = ''
    
    class Route:
        def __init__(self):
            self.RouteID = '' #
            self.vehicleID = '' #
            self.DriverID = '' #
            self.StartWarehouse = ''
            self.EndWarehouse = ''
            self.status = 0
    
    class Current:
        def __init__(self):
            self.PointType = []
            self.Demands = []
            self.PointIDs = []
            self.OrderIDs = []

    rou_xml = ET.parse(SUMO_ROU_FILE)
    rou_xml_root = rou_xml.getroot()     

    RoutePoints_List = []
    Route_List = [] 


    for vehicle in rou_xml_root:
        if vehicle.tag == "vehicle":
            route = Route()
            route.vehicleID = vehicle.attrib['id']

            get_drivers_query =  """SELECT sürücü_id
                                    FROM sürücü
                                    WHERE durum = 0
                                    ORDER BY RAND()
                                    LIMIT 1;""" 
            cursor.execute(get_drivers_query)
            driver_id = cursor.fetchone()
            route.DriverID = driver_id[0]
            current_points = Current()
            new_route_query ="""INSERT INTO rota (sürücü_id, araç_id, başlangıç_depo_id, bitiş_depo_id, durum) VALUES (%s, %s, NULL, NULL, 0);
                             """
            record = (route.DriverID, route.vehicleID)
            cursor.execute(new_route_query, record)

            new_route_id_query = """SELECT LAST_INSERT_ID();"""
            cursor.execute(new_route_id_query)
            new_route_id = cursor.fetchone()
            route.RouteID = int(new_route_id[0])
            
            update_driver_status = """UPDATE sürücü SET durum = 1 WHERE sürücü_id = %s"""
            record = (str(route.DriverID),)
            cursor.execute(update_driver_status, record)
            db_connection.commit()

            update_vehicle_status = """UPDATE araç SET durum = 1 WHERE araç_id = %s"""
            record = (str(route.vehicleID),)
            cursor.execute(update_vehicle_status, record)
            db_connection.commit()


            for param in vehicle:
                if param.tag == 'param':
                    val = param.attrib['value']
                    key = param.attrib['key']
                    
                    if key == 'PointIDs':
                        current_points.PointIDs = (val.split(' '))
                    elif key == 'PointType':
                        current_points.PointType = (val.split(' '))
                    elif key == 'Demands':
                        current_points.Demands = (val.split(' '))
                    elif key == 'OrderIDs':
                        current_points.OrderIDs = (val.split(' '))


            route.StartWarehouse = current_points.PointIDs[0]
            route.EndWarehouse = current_points.PointIDs[-1]
            for i in range(len(current_points.PointIDs)):
                curr_point = RoutePoint()
                
                curr_point.RouteID = route.RouteID
                curr_point.PointID = current_points.PointIDs[i]
                curr_point.index = i
                

                if current_points.PointType[i] == 'dp':
                    curr_point.order_id = current_points.OrderIDs[i]
                else:
                    curr_point.order_id = -1            
        
                #send route_point to db 
                if curr_point.order_id != -1:
                    route_point_query = """INSERT INTO rota_nokta (rota_id, nokta_id, sıra, sipariş_id) VALUES (%s, %s,%s,%s)"""
                    record = (curr_point.RouteID, curr_point.PointID, curr_point.index, curr_point.order_id)
                else:
                    route_point_query = """INSERT INTO rota_nokta (rota_id, nokta_id, sıra, sipariş_id) VALUES (%s, %s, %s, NULL)"""
                    record = (curr_point.RouteID, curr_point.PointID, curr_point.index)

                cursor.execute(route_point_query, record)

            # Send prd to database
            update_route_query = """UPDATE rota SET başlangıç_depo_id = %s, bitiş_depo_id = %s WHERE rota_id = %s"""
            record = (route.StartWarehouse, route.EndWarehouse, route.RouteID)
            cursor.execute(update_route_query, record)
            db_connection.commit()
    
    db_connection.commit()
    db_connection.close()




