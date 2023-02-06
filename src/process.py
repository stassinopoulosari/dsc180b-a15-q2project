import networkx as nx
import community
import numpy as np
import pandas as pd
from collections import Counter

from louvain import Louvain

def topComms(communities):
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
    sortedNodes = sorted(graph.degree, key=lambda x: x[1], reverse=True)
    topTwenty = [i[0] for i in sortedNodes[:20]]
    handles = list(nx.get_node_attributes(graph.subgraph(topTwenty), 'name').values())
    return handles

def summary(graph):
    communities = Louvain(graph).predict()
    nx.set_node_attributes(graph, communities, "detected")
    topLabels = topComms(communities)
    for label in topLabels:
        subgraph = nodeFilter(graph, label)
        handles = topNodes(subgraph)
        print("Top twenty account handles for community {}: ".format(label) + ', '.join(handles))
    return