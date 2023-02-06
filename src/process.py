import networkx as nx
import community
import numpy as np
import pandas as pd
from collections import Counter

from louvain import Louvain

def topComms(graph):
    communities = Louvain(graph).predict()
    counts = Counter(communities.values())
    sorted = counts.most_common()
    topLabels = [i[0] for i in sorted[:10]]
    return topLabels

def nodeFilter(graph, label):
    nodes = (node
    for node, data
    in graph.nodes(data=True)
    if data.get("detected") == label)
    return graph.subgraph(nodes)


