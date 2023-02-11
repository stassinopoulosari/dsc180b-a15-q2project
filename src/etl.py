import os
import requests, zipfile, io
import networkx as nx
import pandas as pd

LATEST_RELEASE = '2023.02.11-11.51'


def get_data():
   
    url = "https://github.com/stassinopoulosari/dsc180b-wi23-a15-2-data/releases/download/" + LATEST_RELEASE + "/release.zip"
    response = requests.get(url)

    directory = "data/"
    parent_dir = "./"
    path = os.path.join(parent_dir, directory)
    if not os.path.exists(path):
        os.makedirs(path)
    z = zipfile.ZipFile(io.BytesIO(response.content))
    z.extractall(path)
    return path

def read_data(path):
    nodepath = os.path.join(path,"graph.csv")
    namepath = os.path.join(path,"names.csv")
    nodes = pd.read_csv(nodepath)
    names = pd.read_csv(namepath).set_index('id').to_dict()['name']
    return nodes, names

def make_graph(nodes, names):
    graph = nx.from_pandas_edgelist(nodes, source='id_a', target='id_b',create_using=nx.Graph())
    nx.set_node_attributes(graph, names, "name")
    return graph