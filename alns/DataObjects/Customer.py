import math as m
from DataObjects.Target import Target


class Customer(Target):
    """ 
    Bu sınıf veri setinde StringID değerleri "C" olan verileri içermektedir. Bunlar müşteri düğümlerini temsil eder.
    Target Sınıfından farklı olarak müşterilerin talep ettikleri yük miktarını (demand) da sınıf özelliği olarak içerir.
    """

    def __init__(self, id, idx, x, y, lat, lon, demand, quantity, ready_time, due_date, service_time, distance_matrix, energy_matrix):
        super(Customer, self).__init__(id, idx, x, y, lat, lon, ready_time, due_date, service_time, distance_matrix, energy_matrix)
        self.demand = demand
        self.quantity = quantity
        
    def getCustomer(self):
        return self

    
    # Yasin Ünal 16.09.2024
    # Sinem hocanın önerisi üzerine burada closest_charge_station her bir müşteride tutulabilir.
    # İlk oluşturmada hesaplama maliyeti oluşturacaktır fakat iterasyonlar sırasında hızlanma sağlayacaktır. 
    # Ayrıca : 
    # - Kullanıcıya özgü isim, adres, . . . bilgileri 
    # - Kullanıcının ne kadar değerli bir müşteri olduğu 
    # gibi bilgiler de bulunarak rotalamada hesaba dahil ediliebilir. 
