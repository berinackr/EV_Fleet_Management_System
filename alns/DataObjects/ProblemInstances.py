import numpy as np
from DataObjects.ChargeStation import ChargeStation
from DataObjects.Customer import Customer

class RoutingProblemConfiguration:
    """
    Bir rota problemi için yapılandırma bilgilerini içeren sınıf.

    Attributes:
        tank_capacity (float): Araç yakıt tankı kapasitesi.
        payload_capacity (float): Araç taşıma kapasitesi.
        fuel_consumption_rate (float): Yakıt tüketim oranı.
        charging_rate (float): Şarj hızı.
        velocity (float): Ortalama hız.
    """
    def __init__(self, tank_capacity, payload_capacity, fuel_consumption_rate, charging_rate, velocity, requirements_dict):
        self.tank_capacity = tank_capacity
        self.payload_capacity = payload_capacity
        self.fuel_consumption_rate = fuel_consumption_rate
        self.charging_rate = charging_rate
        self.velocity = velocity
        self.requirements_dict = requirements_dict
        
class RoutingProblemInstance:
    """
    Bir rota problemi örneğini temsil eden sınıf.

    Attributes:
        config (RoutingProblemConfiguration): Örnek için yapılandırma nesnesi.
        depot (Depot): Başlangıç noktasını temsil eden Depot nesnesi.
        customers (list): Müşteri nesnelerinin bulunduğu liste.
        charging_stations (list): Şarj istasyonu nesnelerinin bulunduğu liste.
        # cust_cust_dist (numpy.ndarray): Müşteriler arasındaki mesafe matrisi.
        # cust_cs_dist (numpy.ndarray): Müşteriler ile şarj istasyonları arasındaki mesafe matrisi.
        vertices (dict): Noktaları ID'leri üzerinden hızlıca bulmak için kullanılan sözlük.
    """
    def __init__(self, config: RoutingProblemConfiguration, depot, customers, charging_stations,fileName):
        self.config = config
        self.depot = depot
        self.customers = customers
        self.charging_stations = charging_stations

        # self.cust_cust_dist = np.zeros((len(self.customers), len(self.customers)))
        # self.cust_cs_dist = np.zeros((len(self.customers), len(self.charging_stations)))
        self.fileName=fileName



       