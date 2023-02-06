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
    subgraph = graph.subgraph(nodes)
    return subgraph

def topNodes(graph):
    sorted = sorted(graph.degree, key=lambda x: x[1], reverse=True)
    topTen = [i[0] for i in sorted[:10]]
    handles = list(nx.get_node_attributes(graph.subgraph(topTen), 'name').values())
    return handles

def summary(graph):
    communities = Louvain(graph).predict()
    nx.set_node_attributes(graph, communities, "detected")
    topLabels = topComms(graph)
    for label in topLabels:
        subgraph = nodeFilter(graph, label)
        handles = topNodes(subgraph)
        print("Top ten account handles for community {}: ".format(label) + ', '.join(handles))