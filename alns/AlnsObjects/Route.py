import colorsys
import numpy as np
from DataObjects.ChargeStation import ChargeStation
from DataObjects.Customer import Customer
import matplotlib.pyplot as plt
from DataObjects.Target import Target


class Route:
    """
    Represents a route in the EVRP problem.
    """

    def __init__(self, config, depot):
        """
        Initializes a Route object.

        Args:
            config (Config): The configuration object containing the parameters for the EVRP problem.
            depot (Node): The depot node where the route starts and ends.
        """
        e = 0.8 # motor verimliliği
        p = 1.2041 # hava yoğunluğu 
        g = 9.81 # yer çekimi 
        Cd = 0.48 # sürüklenme katsayısı 
        Cr = 0.01 # yuvarlanma direnci katsayısı 
        self.M = 1000 # araç kütlesi
        A = 2.33 # kesit alanı
        self.config = config
        self.route = [depot]
        self.depot = depot
        self.alpha = (0.5 * Cd * p * A * (self.config.velocity**3)) / (1000 * e) # sürüklenme kuvveti
        self.beta = (g * Cr * self.config.velocity) / (1000 * e) # yuvarlanma direnci


    def is_feasible_initialSolution(self):

        if self.payload_capacity_constraint_violated():
            return False
        else:
            return True

    def is_feasible_all_init_initialSolution(self):

        if self.tank_capacity_constraint_violated():
            return False
        elif self.payload_capacity_constraint_violated():
            return False
        else:
            return True

    def is_feasible(self):
        """
        Checks if the route satisfies all the constraints.

        Returns:
            bool: True if the route is feasible, False otherwise.
        """
        # if self.tw_constraint_violated():
        #     return False
        if self.payload_capacity_constraint_violated():
            return False
        else:
            return True

    def is_feasible_all(self):
        """
        Checks if the route satisfies all the constraints, including the tank capacity constraint.

        Returns:
            bool: True if the route is feasible, False otherwise.
        """
        # if self.tw_constraint_violated():
        #     # print("tw constraint violated")
        #     return False
        if self.tank_capacity_constraint_violated():
            return False
        elif self.payload_capacity_constraint_violated():
            return False
        elif self.is_complete()==False:
            return False
        elif self.cs_constraint_violated():
            return False
        else:
            return True
    def is_feasible_all_final(self):
        if self.tank_capacity_constraint_violated():
            return False
        elif self.payload_capacity_constraint_violated():
            return False
        elif not self.is_complete():
            return False
        elif self.cs_constraint_violated():
            return False
        # elif self.tw_constraint_violated():
        #     return False
        # elif self.tw_constraint_violated_with_Schneider():
        #     return False
        else:
            return True
    def is_feasible_all_init(self):
        """
        Checks if the route satisfies all the constraints, including the tank capacity constraint.

        Returns:
            bool: True if the route is feasible, False otherwise.
        """
        # if self.tw_constraint_violated():
        #     return False
        if self.tank_capacity_constraint_violated():
            return False
        elif self.payload_capacity_constraint_violated():
            return False
        else:
            return True

    def is_complete(self):
        """
        Checks if the route is complete, i.e., it starts and ends at the depot and the depot is not visited in between.

        Returns:
            bool: True if the route is complete, False otherwise.
        """
        return (
            self.route[0].id == self.depot.id
            and self.route[-1].id == self.depot.id
            and self.depot.id not in [node.id for node in self.route[1:-1]]
        )

    def tw_constraint_violated(self):
        """
        Checks if the time window constraints are violated in the route.

        Returns:
            bool: True if the time window constraints are violated, False otherwise.
        """
        current_time = 0
        """ 
        Burası rotanın feasible/infeasible olup olmadığına karar verir. Bu bakımdan sadece gecikme varsa return True yapılabilir 
        O halde müşteri operatörleri ile bu rotanın düzenlenmesi ve buradan feasible sonuç döndürmesi beklenebilir. 
        Burada total_tardiness hesabı solution içerisinde çapırılarak calculate_total_tardiness fonksiyonunda yapılmalı.
        
        """
        travel_time = 0
        total_cooldown = 0
        # müşteriye özel tardiness yapısı gerekiyor
        total_tardiness = 0
        penalty_coefficient = 1
        for i in range(1, len(self.route)):
            travel_time = self.calculate_time_between_nodes(
                self.route[i - 1], self.route[i]
            )
            current_time += travel_time

            if current_time < self.route[i].ready_time:
                cooldown = self.route[i].ready_time - current_time
                current_time = self.route[i].ready_time
            
            elif current_time > self.route[i].due_date:
                return True
            
            current_time += self.route[i].service_time
            if current_time > self.route[i].due_date:
                return True
            
        return False

    def cs_constraint_violated(self):
        """
        Checks if the same charge station is visited more then once in the route.

        Returns:
            bool: True if the charge station capacity constraints are violated, False otherwise.
        """
        visited_cs_ids = self.get_visited_cs_ids()

        for cs_id in visited_cs_ids:
            if visited_cs_ids.count(cs_id) > 1:
                return True

    def get_visited_cs_ids(self):
        visited_cs_ids = []
        for route in self.route:
            if type(route) is ChargeStation:
                visited_cs_ids.append(route.id)
        return visited_cs_ids

    def node_count_in_route(self):
        """
        Returns the number of nodes in the route.

        Returns:
            int: The number of nodes in the route.
        """
        return len(self.route)

    def tank_capacity_constraint_violated(self):
        """
        Checks if the tank capacity constraint is violated in the route.

        Returns:
            bool: True if the tank capacity constraint is violated, False otherwise.
        """
        option = self.config.requirements_dict["charge_option"]
        tank_capacity = self.config.tank_capacity

        last = None
        for node in self.route:
            if last is not None:
                # her node için tüketimi hesapla ve tank kapasitesinden düş : calculate_remaining_tank_capacity(node)
                remaining_capacity = self.calculate_remaining_tank_capacity(node)

                if option == "full" and remaining_capacity < 0:
                    return True
                elif option == "partial" and remaining_capacity < 0:
                    return True
                elif option == "20-80" and remaining_capacity < self.config.tank_capacity * 0.2:
                    return True

            last = node


    def payload_capacity_constraint_violated(self):
        total_demand = 0  # İlk olarak, "total_demand" adında bir değişken başlatılır ve başlangıçta sıfır (0) değeri ile başlar. Bu değişken, rota üzerindeki müşterilerin toplam taleplerini tutar.
        for t in self.route:  # Bir döngü, rota üzerindeki her bir noktayı sırayla gezerek çalışır.
            """
            Döngünün her adımında, "t" adlı bir nokta (müşteri veya diğer nokta) ele alınır ve tipi kontrol edilir (type(t)). Eğer "t" bir müşteriyse (Customer), o müşterinin talebi (demand) "total_demand" değişkenine eklenir.
            Döngü tamamlandığında, "total_demand", rota üzerindeki müşterilerin toplam talebini temsil eder.
            """
            if type(t) is Customer:
                total_demand += t.demand

        # Son olarak, "total_demand" ile aracın taşıma kapasitesi (self.config.payload_capacity) karşılaştırılır. Eğer toplam talep, aracın taşıma kapasitesini aşıyorsa, bu bir kısıtlama ihlali anlamına gelir ve metot "True" döner. Yani, aracın taşıma kapasitesi kısıtlamalarına uyulmamıştır.

        return total_demand > self.config.payload_capacity

    def get_last_customer(self):
        for t in reversed(self.route):
            if type(t) is Customer:
                return t

    def get_last_object(self):
        return self.route[-1]
  
    def calculate_obj_function(self):

        option = self.config.requirements_dict["obj_function_option"]
        if option == "total_distance":
            return self.calculate_total_distance()
        elif option == "total_tardiness":
            return self.calculate_total_tardiness()
        elif option == "total_time":
            return self.calculate_total_time()
        elif option == "total_energy":
            return self.calculate_total_energy()

    def calculate_total_distance(self, until=None, id=None):
        """
        Bu metodun temel amacı, bir rota üzerindeki toplam mesafeyi hesaplamaktır. Bu mesafe, belirli bir rotayı oluşturan noktalar arasındaki toplam yolculuk mesafesini verir.
        """
        last = None
        total_distance = 0

        for i in range(1, len(self.route)):
            before = self.route[i-1]
            node = self.route[i]
            total_distance += before.distance_to(node)
            if node == until:
                return total_distance
        return total_distance

    def calculate_total_time(self, until=None):
        """
        Bu kod parçası, bir rota üzerindeki toplam süreyi (duration) hesaplayan "calculate_total_time" adlı bir metodu içerir. Bu metot, rota üzerindeki her bir noktanın hizmet süresi, yolculuk süresi ve bekleme süresi dahil olmak üzere toplam süreyi hesaplar.
        """

        total_time = 0
        
        for i in range(1, len(self.route)):
            distance = self.route[i - 1].distance_to(self.route[i])
            total_time +=  distance / self.config.velocity

            if type(self.route[i]) is ChargeStation:
                if self.config.requirements_dict["charge_option"] == "full":
                    # ne kadar harcandıysa o kadar doldurması gerekir. 
                    missing_energy = (
                        self.config.tank_capacity
                        - self.calculate_remaining_tank_capacity(self.route[i])
                    )
                elif self.config.requirements_dict["charge_option"] == "partial":
                    # ne kadar doldurması gerektiğini hesaplamalı ve bu depodan büyük olamaz
                    missing_energy = self.calculate_required_charge(self.route[i]) 
                    if missing_energy > self.config.tank_capacity:
                        missing_energy = self.config.tank_capacity
                    
                elif self.config.requirements_dict["charge_option"] == "20-80":
                    # %80'inden ne kadar azaltmış hesaplamalı
                    if i == 1:
                        missing_energy = self.config.tank_capacity - self.calculate_remaining_tank_capacity(self.route[i])
                    else: 
                        missing_energy = (self.config.tank_capacity * 0.8) - self.calculate_remaining_tank_capacity(self.route[i])

                self.route[i].service_time = missing_energy * self.config.charging_rate
            
            waiting_time = max(self.route[i].ready_time - total_time, 0)
            # waiting_time = 0
            
            total_time += waiting_time
            total_time += self.route[i].service_time
            
            if self.route[i] == until:
                return total_time

        return total_time

    def calculate_total_tardiness(self, until=None):
        """
            Bu metod, bir rotadaki toplam gecikme süresini hesaplar.
            Üç durum ele alınmaktadır : 
            
            1 - Erken gelinmiş olabilir, beklenmesi gerekir (current_time = node.ready_time)
            2 - Geç kalınmıştır ve tardiness oluşur. Tardiness = (current_time + servis) - node._due_date ile hesaplanır 
            3 - Tam zamanında gelinmiş olabilir, beklenmesi gerekmez ama servis süresi eklendiğinde gecikme oluşabilir 
        """
       
        travel_time = 0
        total_cooldown = 0
        total_tardiness = 0
        current_time = 0 
        penalty_coefficient = 1
        _tardiness = 0 
        for i in range(1, len(self.route)):
            travel_time = self.calculate_time_between_nodes(
                self.route[i - 1], self.route[i]
            )
            current_time += travel_time
            if type(self.route[i]) == Customer:
                if current_time < self.route[i].ready_time:
                    # Erken gelinen (1.) durum , bekleme olduğu için current_time = self.route[i].ready_time olur. (veya += waiting_time da denilebilir.)
                    waiting_time = self.route[i].ready_time - current_time
                    current_time += waiting_time
                    # Bu durumda sevis süresi aşım yapmadığını düşünerek tekrar if kontrolü yapmıyorum. Aksi halde tw infeasible olur her durumda
                    self.route[i].tardiness = 0
                elif current_time > self.route[i].due_date:
                    # Geç kalındığı (2.) durumdur. Servis süresi eklenerek oluşan geç kalma süresi (tardiness) hgesaplanır.
                    _tardiness = current_time - self.route[i].due_date
                    self.route[i].tardiness = _tardiness
                    total_tardiness += _tardiness # total_tardiness += tardiness
                else:
                    self.route[i].tardiness = 0
                    
                
            elif type(self.route[i]) == ChargeStation:
                if self.config.requirements_dict["charge_option"] == "full":
                    missing_energy = (
                        self.config.tank_capacity
                        - self.calculate_remaining_tank_capacity(self.route[i])
                    )
                elif self.config.requirements_dict["charge_option"] == "partial":
                    missing_energy = self.calculate_required_charge(self.route[i])
                    
                elif self.config.requirements_dict["charge_option"] == "20-80":
                    missing_energy = (
                        self.config.tank_capacity * 0.8
                        - self.calculate_remaining_tank_capacity(self.route[i])
                    )
                self.route[i].service_time = missing_energy * self.config.charging_rate
            else:
                self.route[i].tardiness = 0
            
            current_time += self.route[i].service_time
            
            if self.route[i] == until:
                return total_tardiness
            
        return total_tardiness
        
    def calculate_total_energy(self, until=None):
        """ 
        Bu metod toplam enerjisi en küçükleme seçeneği seçildiğinde kullanılır. 
        Rotalardaki enerji maliyeti TARGET sınıfında tanımlı olan energy_to metodu ile hesaplanır ve toplam döndürülür. 
        """
        last = None
        total_energy = 0

        for i in range(1, len(self.route)):
            before = self.route[i-1]
            node = self.route[i]
                
            total_energy += before.energy_to(node)
            if node == until:
                return total_energy


        return total_energy
    # !
    def calculate_node_tardiness(self, node):
        """Bu metod, bir düğümün gecikme süresini hesaplar."""
        elapsed_time = 0
        arrival_time = self.calculate_arrival_time(node)

        return max(arrival_time - node.due_date, 0)
    # !
    def calculate_node_earlier(self, node):
        """Bu metod, bir düğümün erken varma süresini hesaplar."""
        elapsed_time = 0
        arrival_time = self.calculate_arrival_time(node)
        return max(node.ready_time - arrival_time, 0)
    # ! 
    def calculate_arrival_time(self, until=None):
        """
        Bu metod, bir düğüme varış süresini hesaplamalıdır. 
        """
        current_time = 0
        for i in range(1, len(self.route)):
            travel_time = self.calculate_time_between_nodes(
                self.route[i - 1], self.route[i]
            )
            current_time += travel_time  
            self.route[i].arrival_time = current_time
            
            if self.route[i] == until:
                return current_time
            
            if type(self.route[i]) is Customer:
                if current_time < self.route[i].ready_time:
                    waiting_time = self.route[i].ready_time - current_time
                else:
                    waiting_time = 0 
                current_time += waiting_time

            elif type(self.route[i]) is ChargeStation:
                if self.config.requirements_dict["charge_option"] == "full":
                    missing_energy = (
                        self.config.tank_capacity
                        - self.calculate_remaining_tank_capacity(self.route[i])
                    )
                elif self.config.requirements_dict["charge_option"] == "partial":
                    missing_energy = self.calculate_required_charge(self.route[i])
                    
                elif self.config.requirements_dict["charge_option"] == "20-80":
                    missing_energy = (
                        self.config.tank_capacity * 0.8
                        - self.calculate_remaining_tank_capacity(self.route[i])
                    )
                self.route[i].service_time = missing_energy * self.config.charging_rate
   
            current_time += self.route[i].service_time

        return current_time
    
    
    def calculate_waiting_time(self, until=None):
        # bu metod gözden geçirilmeli 
        current_time = 0
        total_waiting_time = 0
        for i in range(1, len(self.route)):      
            travel_time = self.calculate_time_between_nodes(
                self.route[i - 1], self.route[i]
            )      
            current_time += travel_time
                    
            if type(self.route[i]) is Customer:
                if current_time < self.route[i].ready_time:
                    waiting_time = self.route[i].ready_time - current_time
                    current_time += waiting_time 
                    total_waiting_time += waiting_time
                    self.route[i].waiting_time = waiting_time
                else:
                    waiting_time = 0 
                    self.route[i].waiting_time = waiting_time
                    
                current_time += self.route[i].service_time
            elif type(self.route[i]) is ChargeStation:
                if self.config.requirements_dict["charge_option"] == "full":
                    missing_energy = (
                        self.config.tank_capacity
                        - self.calculate_remaining_tank_capacity(self.route[i])
                    )
                elif self.config.requirements_dict["charge_option"] == "partial":
                    missing_energy = self.calculate_required_charge(self.route[i])
                    
                elif self.config.requirements_dict["charge_option"] == "20-80":
                    missing_energy = (
                        self.config.tank_capacity * 0.8
                        - self.calculate_remaining_tank_capacity(self.route[i])
                    )
                self.route[i].service_time = missing_energy * self.config.charging_rate
            else:
                self.route[i].service_time = 0
                self.route[i].waiting_time = 0    
            
            if self.route[i] == until:
                return total_waiting_time
            
        return total_waiting_time
    # !
    def calculate_load_carried_until_customer(self, customer):
        """
        Bu metot, bir müşteriye kadar olan toplam yükü hesaplamak için kullanılır. Bu yük, müşteriye kadar olan tüm müşterilerin taleplerinin toplamıdır.
        """
        total_demand = 0

        for t in self.route:

            if t == customer:
                break
            if type(t) == Customer:
                total_demand += t.demand

        return total_demand
    # !
    def calculate_remaining_payload_capacity(self, node):
        """
        Bu metot, bir müşteriye kadar olan kalan yük kapasitesini hesaplamak için kullanılır. 
        Bu yük kapasitesi, aracın taşıma kapasitesi ile müşteriye kadar olan toplam talep arasındaki farktır.
        """
        total_demand = 0
        for i, t in enumerate(self.route):
            if type(t) is Customer:
                total_demand += t.demand

            if t == node and i!=0:
                self.config.payload_capacity - total_demand
                break

        return self.config.payload_capacity - total_demand

    def calculate_remaining_tank_capacity(self, until=None):
        """
            Bu metod, verilen node'da kalan yakıt kapasitesini hesaplamak için kullanılır.
            Bu yakıt kapasitesi, aracın maksimum yakıt kapasitesi ile o noktaya kadar olan toplam yakıt tüketimi arasındaki farktır.
        """
        last = None
        tank_capacity = self.config.tank_capacity
        for index, t in enumerate(self.route):
            if last is not None:
                distance = last.distance_to(t)
                consumption = distance * self.config.fuel_consumption_rate
                tank_capacity -= consumption

                if until == t:
                    return tank_capacity

                if type(t) == ChargeStation:
                    if self.config.requirements_dict["charge_option"] == "full":
                        tank_capacity = self.config.tank_capacity

                    elif self.config.requirements_dict["charge_option"] == "partial":
                        # Şarj istasyonuna geldiğinde kısmi şarj ise ne kadar dolum yapmalı ?
                        # Rotanın devamında bize gerekli olacak enerji kadar dolum yapmalıyız.
                        # Bu yüzden gereken enerjiyi alırız 
                        required_energy = self.calculate_required_charge(t)
                        # Ardından bu gerekli olan şarjı tank capacity olarak alırız: 
                        #   eğer şarj sürelerini hesaplamak istersek daha sonrasında, bu şekilde yapmak yerine varolan enerji seviyesine ne kadar ekleme yaptığımızı hesaplamalıyız.
                        
                        if required_energy > self.config.tank_capacity:
                            tank_capacity = self.config.tank_capacity 
                        else:
                            tank_capacity = required_energy

                    elif self.config.requirements_dict["charge_option"] == "20-80":
                        tank_capacity = self.config.tank_capacity * 0.8

            last = t
        return tank_capacity
    # !
    def calculate_remaining_tank_capacity_below_20(self, until=None):
        last = None
        tank_capacity = self.config.tank_capacity
        for t in self.route:
            if last is not None:
                distance = last.distance_to(t)
                consumption = distance * self.config.fuel_consumption_rate
                tank_capacity -= consumption

                if until == t:
                    return tank_capacity

                if type(t) is ChargeStation:
                    tank_capacity = self.config.tank_capacity * 0.8
            last = t
        return tank_capacity
    # ! 
    def calculate_required_charge_between_nodes(self, from_node, to_node):
        """
        !! bu metod riskli. İki nokta arası yerine rota içerisinde from node to node şeklinde döngü ile gidilmesi gerekebilir.
        İki düğüm arasında seyahat etmek için gereken şarj miktarını hesaplar.

        Args:
            from_node (Node): Başlangıç düğümü.
            to_node (Node): Hedef düğüm.

        Returns:
            consumption: İki düğüm arasında seyahat etmek için gereken şarj miktarı.
        """
        distance = from_node.distance_to(to_node)
        consumption = distance * self.config.fuel_consumption_rate
        return consumption

    def calculate_required_charge(self, until=None):
        """ 
        Bu metod bir noktadan sonrası için gereken şarj miktarını hesaplar. 
        Not: Kod riskli olabilir, aşım olan durumlar için kontrol edilmeli. max(required-self.config.tank, 0) mantıklı bir yaklaşım olmayabilir.
        
        Args:
            until (Node): Başlangıç düğümü 
        Returns:
            required: Gereken şarj miktarı
        """
        tank_capacity = self.config.tank_capacity
        required = 0
    
        last = None
        until_index = self.route.index(until)
        for node in self.route[until_index:]:
            if last is not None:
                distance = last.distance_to(node)
                consumption = distance * self.config.fuel_consumption_rate
                required += consumption
                
                if type(node) == ChargeStation:
                    if self.config.requirements_dict["charge_option"] == "full":
                        required = max(required - self.config.tank_capacity, 0)
                        
                    elif self.config.requirements_dict["charge_option"] == "partial":
                        # Bu fonksiyon calculate_remaining_tank_capacity fonksiyonu içerisinden çağırılır. 
                        # Orada şarj istasyonuna gelindiğinde kalan şarj kadar doldurma yapoılacakken bu kofonksiyon kalanı hesaplamak üzere çağırılır
                        # Ama burada da şarj istasyonuna gelinirse döngü durdurulur ve aradaki iki şarj istasyonu gereksinimi olan required döndürülür.  
                        break
                                 
                    elif self.config.requirements_dict["charge_option"] == "20-80":
                        required = max(required - self.config.tank_capacity*0.8 , 0)

            last = node  
        return required
    
    def calculate_time_between_nodes(self, from_node, to_node):
        """
        İki düğüm arasında seyahat etmek için geçen süreyi hesaplar.

        Args:
            from_node (Node): Başlangıç düğümü.
            to_node (Node): Hedef düğüm.

        Returns:
            float: İki düğüm arasında seyahat etmek için geçen süre.
        """
        return from_node.distance_to(to_node) / self.config.velocity

    def calculate_charging_time(self, until=None):
        """Bu metod rotalardaki şarj istasyonlarında geçirilen toplam şarj süresini hesaplar."""

        """ 
        YÜ 16.10 : eğer ilk indiste şarj istasyonuna uğruyorsa 3000 şarj üzerinden tüketim hesaplanmalıdır (20-80 için)
        """
        charging_time = 0
        for i in range(1, len(self.route)):
            if type(self.route[i]) is ChargeStation:
                if self.config.requirements_dict["charge_option"] == "full":      
                    missing_energy = (
                        self.config.tank_capacity
                        - self.calculate_remaining_tank_capacity(self.route[i])
                    )
                elif self.config.requirements_dict["charge_option"] == "partial":
                    missing_energy = self.calculate_required_charge(self.route[i])
                    
                elif self.config.requirements_dict["charge_option"] == "20-80":
                    if i == 1:
                        missing_energy = (
                            self.config.tank_capacity
                            - self.calculate_remaining_tank_capacity(self.route[i])
                        )
                    else:  
                        missing_energy = (
                            self.config.tank_capacity * 0.8
                            - self.calculate_remaining_tank_capacity(self.route[i])
                        )
                    
                charging_time += missing_energy * self.config.charging_rate           
                if self.route[i] == until : 
                    return charging_time
            else:
                continue
        return charging_time

    def calculate_number_of_visit_station(self):
        count = 0
        for i in range(1, len(self.route)):
            if type(self.route[i]) is ChargeStation:
                count += 1
        return count

    def calculate_dist_to_first_customer(self, reverse=False):
        """
        Bu metot, "calculate_dist_to_first_customer", rotada bulunan ilk müşteriye olan mesafeyi hesaplamak için kullanılır. ?
        """
        dist = 0
        last = None

        if reverse:
            self.route.reverse()

        for t in self.route:
            if last is not None:
                dist += last.distance_to(t)
                if type(t) is Customer:
                    if reverse:
                        self.route.reverse()
                    return dist
            last = t

        return dist
 
    def get_first_customer(self, reverse=False):
        """
        Bu metot, bir rota üzerindeki ilk müşteriyi (Customer) bulmak için kullanılır.
        """
        if reverse:
            self.route.reverse()

        for t in self.route:
            if type(t) is Customer:
                if reverse:
                    self.route.reverse()
                return t

    def get_charge_stations(self):
        return [t for t in self.route if type(t) is ChargeStation]

    def get_customers(self):
        return [t for t in self.route if type(t) is Customer]
    
    def get_targets(self):
        return [t for t in self.route if type(t) is Target]

    def get_first_customer_where_battery_is_negative(self):
        for t in self.route:
            if type(t) is Customer:
                if self.calculate_remaining_tank_capacity(t) < 0:
                    return t

    def get_node_before_where_battery_is_negative(self):
        """Bataryanın negatif olduğu node döndürülür. Bir önceki değil"""
        """ NOT : BU KOD DÜZELTİLEBİLİR """
        last = None
        tank_capacity = self.config.tank_capacity
        if self.config.requirements_dict["charge_option"] == "full":
            for index, t in enumerate(self.route):
                if last is not None:
                    distance = last.distance_to(t)
                    consumption = distance * self.config.fuel_consumption_rate
                    tank_capacity -= consumption

                    if tank_capacity < 0:
                        break

                    if type(t) == ChargeStation:
                        tank_capacity = self.config.tank_capacity

                        
                last = t
                
            return t
        
        elif self.config.requirements_dict["charge_option"] == "partial":
            for index, t in enumerate(self.route):
                if last is not None:
                    distance = last.distance_to(t)
                    consumption = distance * self.config.fuel_consumption_rate
                    tank_capacity -= consumption

                    if tank_capacity < 0:
                        break

                    if type(t) == ChargeStation:
                        required_energy = self.calculate_required_charge(t)
                        if required_energy > self.config.tank_capacity:
                            tank_capacity = self.config.tank_capacity
                        else:
                            tank_capacity = required_energy

                last = t
            return t
        
        elif self.config.requirements_dict["charge_option"] == "20-80":                                                                                                                                                             
            for index, t in enumerate(self.route):
                if last is not None:
                    distance = last.distance_to(t)
                    consumption = distance * self.config.fuel_consumption_rate
                    tank_capacity -= consumption

                    if tank_capacity < self.config.tank_capacity * 0.2:
                        break

                    if type(t) == ChargeStation:
                        tank_capacity = self.config.tank_capacity * 0.8
                last = t
            return t

    def get_node_before_where_battery_is_below_20(self):
        for index, t in enumerate(self.route[1:]):
            if self.calculate_remaining_tank_capacity_below_20(t) <= (
                self.config.tank_capacity * 0.2
            ):
                # print(f"self.calculate_remaining_tank_capacity({index}-{t})",self.calculate_remaining_tank_capacity(t))
                return self.route[index]

    def append_charge_station_at_certain_point_feasible(self, charge_station, indexa):
        for charge in charge_station:
            self.append_charge_station_at_certain_point(charge, indexa)
            if self.is_feasible_all() == True:
                break
            else:
                self.remove_charge_station_from_route_by_index(indexa)

    def remove_customer_from_route(self, customer):
        if customer is None:
            pass
        for item in self.route:
            if item.id == customer.id:
                self.route.remove(item)

    def remove_charge_station_from_route(self, charge_station):
        self.route.remove(charge_station)

            
    def remove_charge_station_from_route_at_certain_point(self, index):
        self.route.pop(index)

    def find_item_index_in_solution(self, item):
        # Müşteriyi çözüm içinde ara ve indeksini bul
        for i in range(len(self.route)):
            if self.route[i] == item:
                return int(i)

    def calculate_energy_consumption(self, from_node, to_node):
        return (
            self.alpha * 1
            + self.beta * (self.calculate_load_carried_until_customer(to_node) + self.M)
        ) * self.calculate_time_between_nodes(from_node, to_node)

    def appendcustomer_at_certain_point(self, customer, index):
        self.route.insert(index, customer)

    def append_charge_station_at_certain_point(self, charge_station, index):
        last = len(self.route)

        if index == 0 or index == last-1:
            pass
        else:
            if type(self.route[index]) is ChargeStation:
                pass 
            else:
                self.route.insert(index, charge_station)

    def remove_charge_station_from_route_by_index(self, index):
        self.route.remove(self.route[index])

    

    def remove_w_id_unserved(self, customer):
        for item in self.unserved_customers:
            if item.id == customer.id:
                self.unserved_customers.remove(item)

    """
    Sonuç olarak, bu metot, "self" nesnesi ile "new_route" nesnesini birleştirerek yeni bir rota oluşturur. Bu, lojistik ve taşıma problemleri gibi alanlarda, farklı rotaları birleştirerek daha etkili ve optimize edilmiş rota planlaması yapmak için kullanışlı
    """

    def append_route(self, new_route):
        if new_route.route[0] == self.depot:
            route_to_append = new_route[1:]

        if self.route[-1] == self.depot:
            self.route = self.route[0:-1]

        self.route = self.route + route_to_append

    # ROTAYI YAZDIRMA FONKSİYONLARI
    def __str__(self):
        route_str = "["

        for t in self.route:
            route_str += t.id + ", "

        route_str += "]"
        return route_str

    def __repr__(self):
        route_str = "["

        for t in self.route:
            route_str += t.id + ", "

        route_str += "]"
        return route_str

    """
    Tüm rotaları tek bir grafikte görselleştirmek için kullanılır.
    """

    def visualizeAllRoutes(self, show=1):
        coordinates = []
        rotaC = []

        for route in self.route:
            for location in route.route:
                coord = [location.x, location.y, location.id]
                coordinates.append(coord)
            rotaC.append(coordinates)
            coordinates = []

        # Create a figure
        # Set the size of the plot
        fig, ax = plt.subplots(figsize=(10, 8))
        "abi".startswith("a")
        for route in rotaC:
            x, y, id = zip(*route)
            node_colors = [
                (
                    "blue"
                    if location[2].startswith("C")
                    else "red" if location[2].startswith("S") else "black"
                )
                for location in route
            ]

            ax.scatter(x, y, marker="o", color=node_colors, label="Nodes")

            # Connect the points with arrows
            dx = np.diff(x)
            dy = np.diff(y)
            # Fix the saturation and brightness
            saturation = 0.7
            brightness = 0.7
            random_hue = np.random.uniform(0, 360)
            # Convert HSL to RGB
            random_color = colorsys.hls_to_rgb(random_hue, saturation, brightness)

            # Plot the lines with a unique random color for each route
            ax.quiver(
                x[:-1],
                y[:-1],
                dx,
                dy,
                scale_units="xy",
                angles="xy",
                scale=1,
                color=random_color,
                label="Route Path",
                width=0.003,
                headwidth=4,
            )

            # Annotate each point with its label
        for route in rotaC:
            for location in route:
                ax.annotate(
                    location[2],
                    (location[0], location[1]),
                    textcoords="offset points",
                    xytext=(0, 10),
                    ha="center",
                )
        # [40, 50] Add a mark to the point
        ax.scatter(
            self.depot.x,
            self.depot.y,
            marker="o",
            s=75,
            color="black",
            label="Depot",
            zorder=10,
        )

        # Set the placement of points on the axes
        ax.xaxis.set_major_locator(plt.AutoLocator())
        ax.yaxis.set_major_locator(plt.AutoLocator())

        ax.set_xlabel("X Coordinate")
        ax.set_ylabel("Y Coordinate")
        ax.set_title("Combined Graph of All Routes")

        ax.grid(True)
        if show == 1:
            plt.show()
            plt.close()

        return fig

    """
    Her bir rotayı ayrı ayrı görselleştirmek için kullanılır.
    """

    def visualizeRoute(self):
        depot_x = 0
        depot_y = 0
        id = 1
        figList = []
        for route in self.route:
            fig, ax = plt.subplots(figsize=(10, 8))
            x_points = []
            y_points = []
            labels = []
            content = []
            for location in route.route:
                x, y = location.x, location.y
                label = (
                    f"{location.id}({x}, {y})"  # Display location ID with coordinates
                )
                x_points.append(x)
                y_points.append(y)
                labels.append(location.id)  # Display only location ID
                content.append(label)

            # Determine the marker style based on the location type
            markers = [
                (
                    "o"
                    if isinstance(location, Customer)
                    else "s" if isinstance(location, ChargeStation) else "D"
                )
                for location in route.route
            ]
            ax.scatter(x_points, y_points, marker="o", color="blue", label="Customers")

            # Connect the points with arrows
            dx = np.diff(x_points)
            dy = np.diff(y_points)
            ax.quiver(
                x_points[:-1],
                y_points[:-1],
                dx,
                dy,
                scale_units="xy",
                angles="xy",
                scale=1,
                color="#20590b",
                label="Route Path",
                width=0.005,
                headwidth=5,
            )

            # Plot charge stations with a different marker
            charge_station_indices = [
                i
                for i, location in enumerate(route.route)
                if isinstance(location, ChargeStation)
            ]
            charge_station_x = [x_points[i] for i in charge_station_indices]
            charge_station_y = [y_points[i] for i in charge_station_indices]
            ax.plot(charge_station_x, charge_station_y, "rs", label="Charge Stations")

            # Plot depot locations (D0) with a different marker
            depot_indices = [
                i for i, location in enumerate(route.route) if location.id == "D0"
            ]
            depot_x = [x_points[i] for i in depot_indices]
            depot_y = [y_points[i] for i in depot_indices]
            ax.plot(
                depot_x,
                depot_y,
                "gD",
                markersize=8,
                markerfacecolor="#d94800",
                label="Depot (D0)",
            )

            # Annotate each point with its label
            for x, y, label in zip(x_points, y_points, labels):
                ax.annotate(
                    label,
                    (x, y),
                    textcoords="offset points",
                    xytext=(0, 10),
                    ha="center",
                )

            ax.set_xlabel("X-axis")
            ax.set_ylabel("Y-axis")
            ax.set_title(f"Route Visualization - Route {id}")
            ax.legend()

            plt.annotate(
                ", ".join(content),
                xy=(0.5, -0.12),
                xycoords="axes fraction",
                fontsize=12,
                ha="center",
            )

            id += 1
            plt.close()
            figList.append(fig)
        return figList

    def number_of_customers(self):
        """
        Returns the number of customers in the route.

        Returns:
            int: The number of customers in the route.
        """
        return len(self.get_customers())

    def number_of_charge_stations(self):
        """
        Returns the number of charge stations in the route.

        Returns:
            int: The number of charge stations in the route.
        """
        return len(self.get_charge_stations())
