import networkx as nx
import community
import numpy as np
import pandas as pd
from collections import Counter

from louvain import Louvain

def getComms(graph):
    communities = Louvain(graph).predict()
    counts = Counter(communities.values())
    sorted = counts.most_common()
    return sorted

