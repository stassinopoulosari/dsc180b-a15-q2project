import os
import requests, zipfile, io
import networkx as nx
import pandas as pd

def get_data():
   
    url = "https://dl.dropboxusercontent.com/s/cactds8ci3hoxyz/graph_dessadarling_2022.01.30-14-30.zip?dl=0"
    response = requests.get(url)

    directory = "data/"
    parent_dir = "./"
    path = os.path.join(parent_dir, directory)
    if not os.path.exists(path):
        os.makedirs(path)
    z = zipfile.ZipFile(io.BytesIO(response.content))
    z.extractall(path)
    return

def read_data(path):
    nodepath = os.path.join(path,"graph.csv")
    namepath = os.path.join(path,"names.csv")
    nodes = pd.read_csv(nodepath)
    names = pd.read_csv(namepath)
    return nodes, names

def make_graph(nodes, names):
    graph = nx.from_pandas_edgelist(nodes, source='id_a', target='id_b',create_using=nx.Graph())
    nx.set_node_attributes(G, names, "name")
    return graph