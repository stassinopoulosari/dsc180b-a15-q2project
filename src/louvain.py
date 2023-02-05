import networkx as nx
import community

class Louvain:
    def __init__(self, G: nx.graph) -> None:
        self.G = G.copy()
        
    def predict(self):
        return community.best_partition(self.G)