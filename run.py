import sys
import json

sys.path.insert(0, 'src')

from etl import get_data, read_data, make_graph
from process import summary


def main(targets):

    if 'twitter_traverse' in targets:
        # Do not do this unless you want the code to run indefinitely
        from twitter_traverse import twitter_traverse
        twitter_traverse()
        
    if 'data' in targets:
        get_data()
    
    if 'test' in targets:
        path = get_data()
        nodes, names = read_data(path)
        graph = make_graph(nodes, names)
        summary(graph)



if __name__ == '__main__':
    # run via:
    # python run.py data test
    targets = sys.argv[1:]
    main(targets)