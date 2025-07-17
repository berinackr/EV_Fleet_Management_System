import tabulate
from AlnsOperators.CustomerOperators import (
    
    greedyCustomerInsertionOperator,
    infeasibleDivider,
    regret2CustomerInsertionOperator,
    leastTimeWindowCustomerRemovalOperator,
    relatedCustomerRemovalOperator,
    removeRandomCustomerOperator,
    worstDistanceCustomerRemovalOperator,
    
)
from AlnsOperators.CustomerOperators import (
    randomCustomerSwapOperator,
    randomBetweenRouteSwapOperator,
#     randomCustomerRandomInsertionOperator,
#     randomCustomerAppendOperator
)

from AlnsOperators.RepairSolution import GreedyRepair, RandomRepair

from AlnsOperators.RouteOperators import (
    greedyRouteRemovalOperator,
    randomRouteRemovalOperator,
)
from AlnsOperators.StationOperators import (
    Compare_K_Insertion,
    bestStationInsertionOperator,
    randomNearestStationInsertion,
    greedyStationInsertion,
    worstChargeUsageStationRemovalOperator,
    worstStationRemovalOperator,
)

from AlnsOperators.LocalSearchOperators import *

class ALNS:
    def __init__(self, bestSolution, currentSolution):
        self.bestSolution = bestSolution
        self.currentSolution = currentSolution

        # Customer removal operators
        self.relatedCustomerRemovalOp = relatedCustomerRemovalOperator()
        self.removeRandomCustomerRemovalOp = removeRandomCustomerOperator()
        self.leastTimeWindowCustomerRemovalOp = leastTimeWindowCustomerRemovalOperator()
        self.worstDistanceCustomerRemovalOp = worstDistanceCustomerRemovalOperator()
        self.customerRemovalOps = [
            self.relatedCustomerRemovalOp,
            self.removeRandomCustomerRemovalOp,
            self.leastTimeWindowCustomerRemovalOp,
            self.worstDistanceCustomerRemovalOp,
        ]
        # ------------------------------------------------------
        # Customer insertion operators  
        self.greedyCustomerInsertionOp = greedyCustomerInsertionOperator()
        self.regret2CustomerInsertionOp= regret2CustomerInsertionOperator()        
        self.infeasibleDividerOp = infeasibleDivider()
        self.customerInsertionOps = [
            self.greedyCustomerInsertionOp,
            self.regret2CustomerInsertionOp,
            # self.infeasibleDividerOp,
        ]
        # ------------------------------------------------------
        # Station removal operators
        self.worstChargeUsageStationRemovalOp = worstChargeUsageStationRemovalOperator()
        self.worstStationRemovalOp = worstStationRemovalOperator()
        self.stationRemovalOps = [
            # self.randomStationRemovalOp,
            self.worstChargeUsageStationRemovalOp,
            self.worstStationRemovalOp,
        ]
        # ------------------------------------------------------
        # Station insertion operators
        self.yasin_op = greedyStationInsertion()
        self.randomNearest = randomNearestStationInsertion()
        self.bestStationInsertionOp = bestStationInsertionOperator()
        self.Compare_K_InsertionOp = Compare_K_Insertion(k=2)
        self.stationInsertionOps = [
            # self.bestStationInsertionOp,
            # self.Compare_K_InsertionOp,
            self.yasin_op,
            self.randomNearest,
        ]
        # ------------------------------------------------------
        # Route removal operators
        self.randomRouteRemovalOp = randomRouteRemovalOperator()
        self.greedyRouteRemovalOp = greedyRouteRemovalOperator()
        self.routeRemovalOps = [
            self.randomRouteRemovalOp, 
            self.greedyRouteRemovalOp
        ]
        # ------------------------------------------------------
        # Swap operators
        self.randomCustomerSwapOp = randomCustomerSwapOperator()
        self.randomBetweenRouteSwapOp = randomBetweenRouteSwapOperator()
        # self.randomCustomerRandomInsertionOp = randomCustomerRandomInsertionOperator()
        # self.randomCustomerAppendOp = randomCustomerAppendOperator()
        self.swapOps = [
            self.randomCustomerSwapOp,
            self.randomBetweenRouteSwapOp,
        ]
        # ------------------------------------------------------
        # Local search operators
        self.intraRelocateOp = IntraRelocate()
        self.intraExchangeOp = IntraExchange()
        self.intraOrOpt = IntraOrOpt()
        self.intraTwoOpt = IntraTwoOpt()
        self.interRelocateOp = InterRelocate() 
        self.interExchangeOp = InterExchange() 
        self.interCrossExchangeOp = InterCrossExcange()
        self.inter2OptStarOp = Inter2OptStar()
        self.localSearchOps = [
            self.intraRelocateOp,
            self.intraExchangeOp,
            self.intraOrOpt,
            self.intraTwoOpt,
            self.interRelocateOp,
            self.interExchangeOp,
            self.interCrossExchangeOp,
            self.inter2OptStarOp,
        ]
        # ------------------------------------------------------
        # Solution repair operators
        self.greedyRepair = GreedyRepair()
        self.randomRepair = RandomRepair()
        self.solutionRepairOps = [
            # self.greedyRepair
            self.randomRepair
        ]
        # ------------------------------------------------------
        
    def resetScoresForAllOperators(self):
        for op in self.customerInsertionOps:
            op.resetScore()
        for op in self.customerRemovalOps:
            op.resetScore()
        for op in self.stationRemovalOps:
            op.resetScore()
        for op in self.stationInsertionOps:
            op.resetScore()
        for op in self.routeRemovalOps:
            op.resetScore()
        for op in self.swapOps:
            op.resetScore()
        for op in self.localSearchOps:
            op.resetScore()
        for op in self.solutionRepairOps:
            op.resetScore()
        

    def calculateOperatorsAndWeights(self):
        
        self.CI_operator_dict = {}
        for index, op in enumerate(self.customerInsertionOps):
            weights = self.customerInsertionOps[index].weights
            sumOfWeights = sum(weights)
            probs = [weights[i]/sumOfWeights for i in range(len(weights))]
            op_name = op.name
            self.CI_operator_dict[op_name] = probs[index]
        self.CR_operator_dict = {}
        for index, op in enumerate(self.customerRemovalOps):
            weights = self.customerRemovalOps[index].weights
            sumOfWeights = sum(weights)
            probs = [weights[i]/sumOfWeights for i in range(len(weights))]
            op_name = op.name
            self.CR_operator_dict[op_name] = probs[index]
        # for op in self.stationRemovalOps:
        #     operators.append(op)
        #     weights.append(op.getWeight())
        # for op in self.stationInsertionOps:
        #     operators.append(op)
        #     weights.append(op.getWeight())
        self.RR_operator_dict = {}
        for index, op in enumerate(self.routeRemovalOps):
            weights = self.routeRemovalOps[index].weights
            sumOfWeights = sum(weights)
            probs = [weights[i]/sumOfWeights for i in range(len(weights))]
            op_name = op.name
            self.RR_operator_dict[op_name] = probs[index]
        self.LS_operator_dict = {}
        for index, op in enumerate(self.localSearchOps):
            weights = self.localSearchOps[index].weights
            sumOfWeights = sum(weights)
            probs = [weights[i]/sumOfWeights for i in range(len(weights))]
            op_name = op.name
            self.LS_operator_dict[op_name] = probs[index]
            
        self.operator_dicts = {
            "Customer Insertion": self.CI_operator_dict,
            "Customer Removal": self.CR_operator_dict,
            "Route Removal": self.RR_operator_dict,
            "Local Search": self.LS_operator_dict
        }
        return self.operator_dicts
        
    def tabulate_operators(self):
        
        self.calculateOperatorsAndWeights()
        for key, operator_dict in self.operator_dicts.items():
            data = [(op, weight) for op, weight in operator_dict.items()]
            tabulated = tabulate.tabulate(
                data,
                headers=[f'{key} Operator', 'Weight'],
                tablefmt='fancy_grid'
            )
            print(tabulated)     
        # data = [(op, weight) for op, weight in operator_dict.items()]
        # tabulated = tabulate.tabulate(
        #     data,
        #     headers=['Operator', 'Weight'],
        #     tablefmt='fancy_grid'
        # )
        
        # print(tabulated)
