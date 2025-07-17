import copy
import random
from AlnsObjects.Route import Route
from AlnsObjects.Solution import Solution
from AlnsOperators.Operators import LocalSearchOperator


class IntraRelocate(LocalSearchOperator):
    """ 
    Rota içi operatörüdür.
    Amaç : Seçilen bir müşteri rotada farklı bir yere taşınır. 
    Gösterim :
        cs5, 1, 2, 3, 4, 5, 6, cs5
        --------------------------
        cs5, 1, 2, 4, 5, 6, 3, cs5
        
    Kod : 
        random_route = random.choice(solution.routes)
        customer = random.choice(random_route.route[1:-1])
        customer_index = random_route.route.index(customer)
        random_index = random.choice(1, len(random_route.route) -1) if i != customer_index ])
        where = random_route.route.index(random_index )
        random_route.remove(customer)
        random_route.appendcustomer_at_certain_point(customer, random_index)
        
    Yan etki : 
        - Aynı rotada değişim yapıldığı için payload sorunu olmayacaktır
        - Müşterinin index'i ile taşınacağı rastgele index aynı olmamalıdır. 
    """
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Intra Relocate"
        self.score = score
        
    def resetScore(self):
        self.score = 0.0
        
    def swap(self, solution: Solution):
        random_route = random.choice(solution.routes)
        if len(random_route.route) < 4:
            return solution
        customer = random.choice(random_route.route[1:-1])
        customer_index = random_route.route.index(customer)
        random_route.remove_customer_from_route(customer)
        random_index = random.randint(1, len(random_route.route) - 2)
        random_route.appendcustomer_at_certain_point(customer, random_index)
        
                
class IntraExchange(LocalSearchOperator):
    """ 
    Rota içi  operatörüdür.
    Amaç : Aynı rota içerisinde seçilen iki müşteri yer değiştirilir. 
    Gösterim : 
        cs5, 1, 2, 3, 4, 5, 6, cs5
        --------------------------
        cs5, 1, 5, 3, 4, 2, 6, cs5    
        
    Kod : 
        random_route = random.choice(solution.routes)
        customers = random.sample(random_route.route[1:-1], 2)
        customer1, customer2 = customers
        index1 = random_route.route.index(customer1)
        index2 = random_route.route.index(customer2)
        random_route.route[index1], random_route.route[index2] = random_route.route[index2], random_route.route[index1]
        
    Yan etki :
        - Aynı rotada değişim yapıldığı için payload sorunu olmayacaktır
        - Müşteri indexleri aynı olmamalıdır.  
    """
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Intra Exchange"
        self.score = score
        
    def resetScore(self):
        self.score = 0.0    
        
    def swap(self, solution: Solution):
        random_route = random.choice(solution.routes)
        if len(random_route.route) < 4:
            return solution
        customers = random.sample(random_route.route[1:-1], 2)
        customer1, customer2 = customers
        index1 = random_route.route.index(customer1)
        index2 = random_route.route.index(customer2)
        random_route.route[index1], random_route.route[index2] = random_route.route[index2], random_route.route[index1] 
        
class IntraOrOpt(LocalSearchOperator):
    """ 
    Rota içi operatörüdür.
    Amaç : Intra Relocate'ye benzer şekilde seçilen segmentin(birden çok müşteri) rota içerisinde yer değiştirilmesidir. 
    Gösterim :
        cs5, 1, 2, 3, 4, 5, 6, cs5
        --------------------------
        cs5, 1, 4, 5, 6, 2, 3, cs5 
    Kod : 
        random_route = random.choice(solution.routes)
        if len(random_route.route) <= segment_length + 1:  # Depo noktalarını da çıkarırsak
            return solution
        
        start_index = random.randint(1, len(random_route.route) - segment_length - 1)
        end_index = start_index + segment_length
        segment = random_route.route[start_index:end_index]
        del random_route.route[start_index:end_index]
        new_position = random.randint(1, len(random_route.route) - 1)
        for customer in reversed(segment):
        # reversed olmasının sebebi hep aynı indise eklenecek customerlar
        # bu yüzden ters çeviriyor ve aynı yere ekliyor
        random_route.route.insert(new_position, customer)    
    Yan etki :
        - Aynı rotada değişim yapıldığı için payload sorunu olmayacaktır.
        - Rotada segment sayısı kadar müşteri olduğu garanti edilmelidir.
        - Segment uzunluğu rota sayısına oranlı olmalı.
    """
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Intra Or Opt"
        self.score = score
        
    def resetScore(self):
        self.score = 0.0
        
    def swap(self, solution: Solution):
        
        
        random_route = random.choice(solution.routes)
        
        if len(random_route.route) < 5:
            return solution
        
        # İlk ve son depo noktalarını sabit tutarak geri kalan elemanlar üzerinde işlem yap
        route_customers = random_route.route[1:-1]  # İlk ve son depo noktalarını hariç tut
        
        if len(route_customers) < 2:
            return solution
        
        depot = random_route.route[0]
        last_depot = random_route.route[-1]
        
        # Segment uzunluğu ayarlanır
        if len(route_customers) <= 3:
            segment_length = 2
        else:
            segment_length = 3
        
        # Segmentin başlangıç ve bitiş indekslerini seç (depo elemanları hariç)
        max_start_index = len(route_customers) - segment_length
        start_index = random.randint(0, max_start_index)
        end_index = start_index + segment_length
        segment = route_customers[start_index:end_index]
        
        # Segmenti rotadan çıkar
        del route_customers[start_index:end_index]
        
        # Yeni pozisyonu seç
        max_new_position = len(route_customers)
        new_position = random.randint(0, max_new_position)
        
        # Segmenti ters çevirip yeni pozisyona ekle
        for customer in reversed(segment):
            route_customers.insert(new_position, customer)
        
        # Yeni rotayı oluştur (depo noktalarını sabit tut)
        random_route.route = [depot] + route_customers + [last_depot]
        
        
        # for index, node in enumerate(random_route.route):
        #     if index == 0 or index == len(random_route.route) - 1:
        #         if node.id == "cs5" and node.id == "cs5":
        #             continue 
        #         else:
        #             print("rota : ", random_route)
        #             print("node.id : ", node.id)
        #             print("Intra or opt")
        #             input("hata")
                    
        return solution
    
class IntraTwoOpt(LocalSearchOperator):
    """ 
    Rota içi operatörüdür.
    Amaç : Seçilen bir rotadaki iki müşteri arasındaki müşterilerin sırasını (ters) değiştirir. 
    Gösterim : 
        cs5, 1, 2, 3, 4, 5, 6, cs5
        -----------------------------
        cs5, 1, 2, 5, 4, 3, 6, cs5
    Kod : 
        if i >= k:
            return route
        # Segment ters çevrilir
        new_route = route[:i] + route[i:k+1][::-1] + route[k+1:]
        return new_route
    """
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Intra 2 Opt"
        self.score = score

    def resetScore(self):
        self.score = 0.0
        
    def swap(self, solution: Solution):
        
        random_route = random.choice(solution.routes)
        depot = random_route.route[0]
        depot_last = random_route.route[-1]
        
                    
        # Bir müşteri varsa 2-opt yapmaya gerek yok
        if len(random_route.route) <= 4:
            return solution 
        
        route_customers = random_route.route[1:-1] 
        
        # Geçerli bir aralık seçene kadar tekrar dene
        counter = 0
        while True:
            counter += 1
            i = random.randint(0, len(route_customers) - 2)
            k = random.randint(i + 1, len(route_customers) - 1)
            if i < k:
                break
                
            if counter > 3:
                return solution
        
        # Sadece rota içerisindeki müşteriler arasında segment ters çevrilir
        route_customers = route_customers[:i] + route_customers[i:k+1][::-1] + route_customers[k+1:]
        random_route.route = [depot] + route_customers + [depot_last]

        
        return solution
        

     
class InterRelocate(LocalSearchOperator):
    """ 
    Rotalar arası operatörüdür.
    Amaç : Bir müşteri seçilip farklı bir rotada rastgele yere taşınır. (Müşterinin seçildiği rotayı max olan rotadan seçtim)
    Gösterim : 
        cs5, 1, 2, 3, 4, 5, 6, cs5
        cs5  7, 8, 9, 10, 11, 12, cs5 
        -----------------------------
        cs5, 1, 2, 3, 4, 6, cs5
        cs5  7, 8, 5, 9, 10, 11, 12, cs5
    Kod : 
        random_route_1 = max(solution.routes, key=lambda x: len(x.route))
        random_route_2 = min(solution.routes, key=lambda x: len(x.route))
        last_1 = len(random_route_1.route) - 1
        last_2 = len(random_route_2.route) - 1
        customer1 = random.choice(random_route_1.route[1:last_1])
        customer1_index = random_route_1.route.index(customer1)       
        # rastgele bir yere müşteriyi ekle
        where = random.randint(1, last_2)
        # print("Solution önce = ", solution.routes)
        random_route_2.appendcustomer_at_certain_point(customer1, where)
        random_route_1.remove_customer_from_route(customer1)
    
    Yan etki : 
        - Payload sorunu olabilir, kontrol edilmeli.    
        - Eğer müşterinin alındığı rotada sadece o varsa (alındığında rota boş kalır) taşıma sonrası rota silinmelidir.
    """
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Inter Relocate"
        self.score = score

    def resetScore(self):
        self.score = 0.0
        
    def swap(self, solution: Solution):
        # Bir rota varsa operatör çalışmaz
        if len(solution.routes) < 2:
            return solution
        
        # rota1 -> rota2'ye customer atılmalı 
        random_route_1, random_route_2 = random.sample(solution.routes, 2)
        
        if len(random_route_1.route) <= 2 or len(random_route_2.route) <= 2:
            return solution

        # eğer rota1'daki müşteri sayısı rota2'den küçükse yer değiştirme yapma
        if random_route_1 and random_route_2:
            customer1 = random.choice(random_route_1.route[1:-1])        
            customer1_index = random_route_1.route.index(customer1)
            where = random.randint(1, len(random_route_2.route) - 1)
            random_route_1.remove_customer_from_route(customer1)
            random_route_2.appendcustomer_at_certain_point(customer1, where)
        else:
            return solution
        # payload sorunu olabilir kontrol edilir. 
        if random_route_2.payload_capacity_constraint_violated():
            random_route_2.remove_customer_from_route(customer1)
            random_route_1.appendcustomer_at_certain_point(customer1, customer1_index)            

        if len(random_route_1.route) == 2 :
            solution.routes.remove(random_route_1)
    
class InterExchange(LocalSearchOperator):
    """ 
    rotalar arası swap operatörüdür.
    Rotalar arası operatörüdür.
    Amaç : İki farklı rotadaki iki müşteri seçilir. Bu müşterilerin birbiri ile yer değiştirilir.
    Gösterim : 
        cs5, 1, 2, 3, 4, 5, 6, cs5
        cs5  7, 8, 9, 10, 11, 12, cs5 
        -----------------------------
        cs5, 1, 2, 3, 4, 11, 6, cs5
        cs5  7, 8, 9, 10, 5, 12, cs5
    Kod : 
        random_route_1, random_route_2 = random.sample(solution.routes, 2)
        customer1 = random.choice(random_route_1.route[1:last_1])
        customer2 = random.choice(random_route_2.route[1:last_2])
        index1 = random_route_1.route.index(customer1)
        index2 = random_route_2.route.index(customer2)
        random_route_1.route[index1], random_route_2.route[index2] = (
            random_route_2.route[index2],
            random_route_1.route[index1],
        )
    Yan etki :
        - Payload sorunu olabilir, kontrol edilmelidir.
        - Rota sayısı kontrol edilmeli 
    """
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Inter Exchange"
        self.score = score

    def resetScore(self):
        self.score = 0.0
        
    def swap(self, solution: Solution):
        
        if len(solution.routes) < 2:
            return solution
        
        random_route_1, random_route_2 = random.sample(solution.routes, 2)
        if len(random_route_1.route) < 3 or len(random_route_2.route) < 3:
            return solution
        customer1 = random.choice(random_route_1.route[1:-1])
        customer2 = random.choice(random_route_2.route[1:-1])
        index1 = random_route_1.route.index(customer1)
        index2 = random_route_2.route.index(customer2)
        random_route_1.route[index1], random_route_2.route[index2] = (
            random_route_2.route[index2],
            random_route_1.route[index1],
        )
        if random_route_1.payload_capacity_constraint_violated() or random_route_2.payload_capacity_constraint_violated():
            random_route_1.route[index1], random_route_2.route[index2] = (
                random_route_2.route[index2],
                random_route_1.route[index1],
            )
                
class InterCrossExcange(LocalSearchOperator): 
    """ 
    Rotalar arası operatörüdür.
    Amaç : İki farklı rotadaki iki segment seçilir. Bu segmentlerin birbiri ile yer değiştirilir. 
    Gösterim :
        cs5, 1, 2, 3, 4, 5, 6, cs5
        cs5  7, 8, 9, 10, 11, 12, cs5 
        -----------------------------
        cs5, 1, 2, 9, 10, 5, 6, cs5
        cs5  7, 8, 3, 4,  11, 12, cs5
    Kod : 
        start_idx1 = random.randint(1, len(route1) -1 - segment_length)
        start_idx2 = random.randint(1, len(route2) -1 - segment_length)
        segment1 = route1[start_idx1:start_idx1 + segment_length]
        segment2 = route2[start_idx2:start_idx2 + segment_length]
        route1[start_idx1:start_idx1 + segment_length] = segment2
        route2[start_idx2:start_idx2 + segment_length] = segment1
        return route1, route2
    Yan etki :
        - Payload sorunu olabilir, kontrol edilmelidir.
        - Rota sayısı kontrol edilmeli
        - Segment rotayı aşmamalı len - 1 - segment ? 
    """
    
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Inter Cross Exchange"
        self.score = score

    def resetScore(self):
        self.score = 0.0
        
    def swap(self, solution: Solution):
        if len(solution.routes) < 2:
            return solution
        
        random_route_1, random_route_2 = random.sample(solution.routes, 2)
        if len(random_route_1.route) < 3 or len(random_route_2.route) < 3:
            return solution
        
        segment_length = 2
        
        max_length_1 = len(random_route_1.route) - 1 - segment_length
        max_length_2 = len(random_route_2.route) - 1 - segment_length
        
        if max_length_1 < 1 or max_length_2 < 1:
            return solution
        
        start_idx1 = random.randint(1, max_length_1)
        start_idx2 = random.randint(1, max_length_2)

        segment1 = random_route_1.route[start_idx1:start_idx1 + segment_length]
        segment2 = random_route_2.route[start_idx2:start_idx2 + segment_length]

        random_route_1.route[start_idx1:start_idx1 + segment_length] = segment2
        random_route_2.route[start_idx2:start_idx2 + segment_length] = segment1
        
        if random_route_1.payload_capacity_constraint_violated() or random_route_2.payload_capacity_constraint_violated():
            random_route_1.route[start_idx1:start_idx1 + segment_length] = segment1
            random_route_2.route[start_idx2:start_idx2 + segment_length] = segment2
            
        return solution
            
class Inter2OptStar(LocalSearchOperator):
    """ 
    Rotalar arası operatörüdür.
    Amaç : Seçilen iki rota arasında 2-opt* operatörü uygular. Rotalarda seçilen indislerden itibaren sonları swap yapar 
    Gösterim : 
        cs5, 1, 2, 3, 4, 5, 6, cs5
        cs5  7, 8, 9, 10, 11, 12, cs5 
        -----------------------------
        cs5, 1, 2, 3, 10, 11, 12, cs5
        cs5  7, 8, 9, 4, 5, 6, cs5
    Kod : 
        i = random.randint(0, len(route1) - 1)
        j = random.randint(0, len(route2) - 1)
        new_route1 = route1[:i] + route2[j:]
        new_route2 = route2[:j] + route1[i:]
        return new_route1, new_route2
    Yan etki :
        - Payload sorunu olabilir, kontrol edilmelidir.
        - Rota sayısı kontrol edilmeli
        - 
    """
    
    def __init__(self, score=0.0):
        super().__init__()
        self.name = "Inter 2 Opt Star"
        self.score = score

    def resetScore(self):
        self.score = 0.0
        
    def swap(self, solution: Solution):
        
        if len(solution.routes) < 2:
            return solution
        
        random_route_1, random_route_2 = random.sample(solution.routes, 2)
        if len(random_route_1.route) < 3 or len(random_route_2.route) < 3:
            return solution
        
        i = random.randint(1, len(random_route_1.route) - 2)
        j = random.randint(1, len(random_route_2.route) - 2)
        new_route1 = random_route_1.route[:i] + random_route_2.route[j:]
        new_route2 = random_route_2.route[:j] + random_route_1.route[i:]
        
        if random_route_1.payload_capacity_constraint_violated() or random_route_2.payload_capacity_constraint_violated():
            new_route1 = random_route_1.route[:i] + random_route_1.route[i:]
            new_route2 = random_route_2.route[:j] + random_route_2.route[j:]
            
        return solution






