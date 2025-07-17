import random

class LocalSearchOperator():
    """ 
        This class is used to select the swap operator based on the weights provided.
    """
    def __init__(self, weights=[1,1,1,1,1,1,1,1], probability=0.0, score=0.0):
        self.weights = weights
        self.probability = probability
        self.P = 0
        
    def rouletteWheelSelection(self):
        weights=self.weights
        sumOfWeights = sum(weights)
        probs = [weights[i]/sumOfWeights for i in range(len(weights))]
        return probs
    
    def selectOperator(self):
        probs=self.rouletteWheelSelection()
        r = random.uniform(0, 1)
        cumulative_prob = 0.0
        for i, prob in enumerate(probs):
            cumulative_prob += prob
            if r <= cumulative_prob:
                return i  # Return the index corresponding to the selected probability

class SwapOperator():
    def __init__(self, weights=[1,1], probability=0.0, score=0.0):
        self.weights = weights
        self.probability = probability
        self.P = 0
        
    def rouletteWheelSelection(self):
        weights=self.weights
        sumOfWeights = sum(weights)
        probs = [weights[i]/sumOfWeights for i in range(len(weights))]
        return probs
    
    def selectOperator(self):
        probs=self.rouletteWheelSelection()
        r = random.uniform(0, 1)
        cumulative_prob = 0.0
        for i, prob in enumerate(probs):
            cumulative_prob += prob
            if r <= cumulative_prob:
                return i  # Return the index corresponding to the selected probability


class SolutionRepairOperator():
    def __init__(self, weights=[1], probability=0.0):
        self.weights = weights
        self.probability = probability
        self.P = 0
        
    def rouletteWheelSelection(self):
        weights=self.weights
        sumOfWeights = sum(weights)
        probs = [weights[i]/sumOfWeights for i in range(len(weights))]
        return probs
    
    def selectOperator(self):
        probs=self.rouletteWheelSelection()
        r = random.uniform(0, 1)
        cumulative_prob = 0.0
        for i, prob in enumerate(probs):
            cumulative_prob += prob
            if r <= cumulative_prob:
                return i  # Return the index corresponding to the selected probability

class CustomerInsertionOperator():
    def __init__(self, weights=[1,1], probability=0.0,customerPool=[],score=0.0):
        self.weights = weights
        self.probability = probability
        self.customerPool = customerPool
        self.P = 0
        self.score = score
    
    def rouletteWheelSelection(self):
        weights=self.weights
        sumOfWeights = sum(weights)
        probs = [weights[i]/sumOfWeights for i in range(len(weights))]
        return probs
    
    def selectOperator(self):
        probs=self.rouletteWheelSelection()
        r = random.uniform(0, 1)
        cumulative_prob = 0.0
        for i, prob in enumerate(probs):
            cumulative_prob += prob
            if r <= cumulative_prob:
                return i  # Return the index corresponding to the selected probability


class CustomerRemovalOperator():
    def __init__(self, weights=[1,1,1,1], probability=0.0,customerPool=[],score=0.0):
        self.weights = weights
        self.probability = probability
        self.customerPool = customerPool
        self.P = 0
        self.score = score
    
    def customerToBeRemoved(self,solution): #burada solutionState senin yazacağın sınıf olacak. Rotalar burada tutulacak. 
        numOfCustomers = solution.getNumberOfCustomers()
        P=min(0.2 * numOfCustomers, 60)
        return P

    def insertCustomer(self,lst, index, value):
        # Verilen indekse değeri ekleyen manuel ekleme fonksiyonu
        return lst.route[:index] + [value] + lst.route[index:]
    
    
    def rouletteWheelSelection(self):
        weights=self.weights
        sumOfWeights = sum(weights)
        probs = [weights[i]/sumOfWeights for i in range(len(weights))]
        return probs
    
    def selectOperator(self):
        probs=self.rouletteWheelSelection()
        r = random.uniform(0, 1)
        cumulative_prob = 0.0
        for i, prob in enumerate(probs):
            cumulative_prob += prob
            if r <= cumulative_prob:
                return i  # Return the index corresponding to the selected probability
            
class StationInsertionOperator():
    def __init__(self, weights=[1,1], probability=0.0):
        self.weights = weights
        self.probability = probability
        self.Q = 0
    
    def stationToBeRemoved(self,solution):
        numOfStations = solution.getNumberOfStation()
        Q=min(0.4 * numOfStations, 10)
        return int(Q)
    def rouletteWheelSelection(self):
        weights=self.weights
        sumOfWeights = sum(weights)
        probs = [weights[i]/sumOfWeights for i in range(len(weights))]
        return probs
    
    def selectOperator(self):
        probs=self.rouletteWheelSelection()
        r = random.uniform(0, 1)
        cumulative_prob = 0.0
        for i, prob in enumerate(probs):
            cumulative_prob += prob
            if r <= cumulative_prob:
                return i  # Return the index corresponding to the selected probability
    
class StationRemovalOperator():
    def __init__(self, weights=[1,1], probability=0.0):
        self.weights = weights
        self.probability = probability
        self.Q = 0
    
    def stationToBeRemoved(self,solution):
        numOfStations = solution.getNumberOfStation()
        Q=min(0.4 * numOfStations, 10)
        return int(Q)
    def rouletteWheelSelection(self):
        weights=self.weights
        sumOfWeights = sum(weights)
        probs = [weights[i]/sumOfWeights for i in range(len(weights))]
        return probs
    # Burada kullanacağımız operatorün indexini verir kodun içinde ona göre istediğimizi seçecek şekilde düzenlenecek.
    def selectOperator(self):
        probs=self.rouletteWheelSelection()
        r = random.uniform(0, 1)
        cumulative_prob = 0.0
        for i, prob in enumerate(probs):
            cumulative_prob += prob
            if r <= cumulative_prob:
                return i  # Return the index corresponding to the selected probability
    
    
class RouteOperator():
    def __init__(self,weights=[1,1]):
        self.lowerBound = 0
        self.upperBound = 0
        self.weights = weights
    def rouletteWheelSelection(self):
        weights=self.weights
        sumOfWeights = sum(weights)
        probs = [weights[i]/sumOfWeights for i in range(len(weights))]
        return probs
    # Burada kullanacağımız operatorün indexini verir kodun içinde ona göre istediğimizi seçecek şekilde düzenlenecek.
    def selectOperator(self):
        probs=self.rouletteWheelSelection()
        r = random.uniform(0, 1)
        cumulative_prob = 0.0
        for i, prob in enumerate(probs):
            cumulative_prob += prob
            if r <= cumulative_prob:
                return i  # Return the index corresponding to the selected probability
            
        
    
    def routeToBeRemoved(self,solution):
        Tr=len(solution.routes) #number of routes
        self.lowerBound= int(0.1 * Tr)
        self.upperBound = int(0.4 * Tr)
        if self.lowerBound==0 or self.upperBound==0:
            W=1
        else:
            W=random.randint(self.lowerBound, self.upperBound)
        return W