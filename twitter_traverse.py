# Imports

import json
import requests
from time import sleep
import time
from collections import deque
from collections import defaultdict
import asyncio
import sys, signal

# Flags

_LOG_LEVEL = 4
_MAX_REQUESTS = 3000
_SEED_ACCOUNT = 1542395816
_LIMIT_PER_ACCOUNT = 3000

# Constants

_RATE_LIMIT_PER_FIFTEEN_MINUTE = 15
_FIFTEEN_MINUTES = 60 * 15
_GRAPH_OUTPUT = "results/graph.csv"
_GRAPH_OUTPUT_FORMAT = "id_a,id_b"
_NAME_OUTPUT = "results/names.csv"
_NAME_OUTPUT_FORMAT = "id,name"
_HISTORY_OUTPUT = "results/history.txt"
_STATE_OUTPUT = "results/state.txt"
_QUEUE_OUTPUT = "results/queue.txt"
_USER_AGENT = "dsc180b-wi23-a15"
_TWITTER_CONFIG_PATH = "twitter_config.json"
_BEARER_TOKENS = []

def _FOLLOWER_API_URL(user_id, pagination): return (
    "https://api.twitter.com/2/users/" +
    str(user_id) + "/followers?max_results=1000" + _PAGINATION(pagination)
)


def _FOLLOWING_API_URL(user_id, pagination): return (
    "https://api.twitter.com/2/users/" +
    str(user_id) + "/following?max_results=1000" + _PAGINATION(pagination)
)


def _PAGINATION(pagination_token): return "" if pagination_token is None else (
    "&pagination_token=" + pagination_token)

# Library


def log(*args):
    assert len(args) == 1 or len(args) == 2
    if len(args) == 2:
        assert type(args[1]) == int
    if len(args) == 1:
        print(args[0])
    elif _LOG_LEVEL >= args[1]:
        print(args[0])


def sort_tuple(tuple):
    assert len(tuple) == 2
    return tuple if tuple[0] <= tuple[1] else (tuple[1], tuple[0])


async def make_request(generated_url, bearer_token):

    log('Making request for ' + generated_url, 3)

    assert bearer_token is not None
    assert type(generated_url) == str

    url = generated_url

    payload = {}
    headers = {
        'Authorization': 'Bearer ' + bearer_token,
        'User-Agent': _USER_AGENT
    }

    response = requests.request("GET", url, headers=headers, data=payload)

    log('Request response: ' + str(response.status_code), 3)

    if response.status_code == 429:
        return {"status": "rate_limit", "headers": response.headers}

    return {"status": "success", "text": response.text}


# Load Twitter Config
try:
    twitter_config_file_handle = open(_TWITTER_CONFIG_PATH, "r")
except OSError:
    raise Exception(
        'No file found at ' + _TWITTER_CONFIG_PATH + '. Make sure ' +
        _TWITTER_CONFIG_PATH + ' is a JSON file with a key `bearer_tokens`'
    )
with twitter_config_file_handle:
    twitter_config_json = twitter_config_file_handle.read()
    twitter_config = json.loads(twitter_config_json)
    _BEARER_TOKENS = twitter_config['bearer_tokens']
twitter_config_file_handle.close()


# Load state

state = _SEED_ACCOUNT

try:
    state_file_handle = open(_STATE_OUTPUT, "r")
    log('Found state')
    state = int(state_file_handle.read())
    state_file_handle.close()
except:
    pass

# Load history

history = set()

try:
    history_file_handle = open(_HISTORY_OUTPUT, "r")
    log('Found history')
    for history_line in history_file_handle.readlines():
        if history_line.strip() == '':
            continue
        history.add(int(history_line))
    history_file_handle.close()
except:
    pass
# Load queue

queue = deque()
queue_set = set()

try:
    queue_file_handle = open(_QUEUE_OUTPUT, "r")
    log('Found queue')
    for queue_line in queue_file_handle.readlines():
        if queue_line.strip() == '':
            continue
        queue.append(int(queue_line))
    queue_file_handle.close()
except:
    pass

queue_set = set(queue)

# API calls

async def api_get(url_builder, user_id, label):
    label = label + ': '
    pagination = None
    time_to_next_request = 0
    data = []
    while True:
        log(label + 'Time to next request: ' + str(time_to_next_request), 3)
        await asyncio.sleep(time_to_next_request)
        for token_number, _BEARER_TOKEN in enumerate(_BEARER_TOKENS):
            result = await make_request(
                url_builder(
                    user_id, pagination
                ), _BEARER_TOKEN
            )
            if result['status'] == 'success':
                time_to_next_request = 0
                log(label + 'Request successful', 3)
                # increment_request()
                results = result['text']
                results_json = json.loads(results)
                # Test for private user
                if ('errors' in results_json.keys()):
                    log(label + str(results_json['errors']))
                    return {'status': 'private user', 'list': []}
                follower_list = results_json['data']
                data.extend(follower_list)
                if len(data) >= _LIMIT_PER_ACCOUNT:
                    log(label +
                        'Capping account at ' + str(_LIMIT_PER_ACCOUNT) +
                        ' results. Moving to next.', 2
                    )
                    return {'status': 'OK', 'list': data}
                if (
                    'meta' in results_json.keys()
                    and 'next_token' in results_json['meta'].keys()  # ('')
                ):
                    log(label + 'Pagination token found, moving to next', 3)
                    pagination = results_json['meta']['next_token']
                else:
                    log(label + 'Pagination token not found, end', 3)
                    return {'status': 'OK', 'list': data}
                break
            elif result['status'] == 'rate_limit':
                if 'x-rate-limit-reset' in result['headers'].keys():
                    time_crawled = int(
                        result['headers']['x-rate-limit-reset']) - time.time()
                    log(label + 'Time polled for token ' + str(token_number) + ': ' + str(time_crawled), 4)
                    if time_crawled < time_to_next_request or time_to_next_request == 0:
                        time_to_next_request = time_crawled
                else:
                    time_to_next_request = _FIFTEEN_MINUTES

async def get_followers(user_id):
    return await api_get(_FOLLOWER_API_URL, user_id, 'FOLLOWERS/' + str(user_id))


async def get_following(user_id):
    return await api_get(_FOLLOWING_API_URL, user_id, 'FOLLOWING/' + str(user_id))

# Result management


async def get_new_mutuals(user_id):
    new_graph_edges = []
    mutual_names = dict()
    followers = dict()
    following = dict()
    followers, following = await asyncio.gather(
        get_followers(user_id), get_following(user_id)
    )
    if followers['status'] == 'private user':
        log('Private user; returning None', 3)
        return None
    followers_set = set([int(mutual['id']) for mutual in followers['list']])
    following_set = set([int(mutual['id']) for mutual in following['list']])
    log('Number of followers: ' + str(len(followers_set)), 3)
    log('Number of following: ' + str(len(following_set)), 3)
    mutuals = following_set.intersection(followers_set)
    log('Number of total mutuals: ' + str(len(mutuals)), 3)
    mutuals_already_scraped = history.intersection(mutuals)
    for mutual_already_scraped in mutuals_already_scraped:
        mutuals.discard(mutual_already_scraped)
    log('Number of mutuals not scraped: ' + str(len(mutuals)), 3)
    to_discard = set()
    for mutual in mutuals:
        new_graph_edges.append(sort_tuple(
            (user_id, mutual)
        ))
        if mutual in queue_set:
            to_discard.add(mutual)
            continue
        queue.append(mutual)
        queue_set.add(mutual)
    for mutual_to_discard in to_discard:
        mutuals.discard(mutual_to_discard)
    log('Number of new mutuals: ' + str(len(mutuals)), 3)
    for following_user in following['list']:
        id = int(following_user['id'])
        if id in mutuals:
            mutual_names[id] = following_user['username']
    return {
        'edges': new_graph_edges,
        'new_names': mutual_names
    }

# File management

def write_queue(queue):
    log('Writing queue', 4)
    queue_file_handle = open(_QUEUE_OUTPUT, 'w')
    queue_file_handle.write('\n'.join([str(id) for id in queue]))
    queue_file_handle.close()

def write_state(state):
    log('Writing state', 4)
    state_file_handle = open(_STATE_OUTPUT, 'w')
    state_file_handle.write(str(state))
    state_file_handle.close()

def write_history(history):
    log('Writing history', 4)
    history_file_handle = open(_HISTORY_OUTPUT, 'w')
    history_file_handle.write('\n'.join([str(id) for id in history]))
    history_file_handle.close()

def get_new_mutuals_sync(user_id):
    return asyncio.run(get_new_mutuals(user_id))

# Central loop

def run_queue():
    global history
    global state
    global queue
    global queue_set
    while state is not None:
        history.add(state)
        log('Getting mutuals for ' + str(state), 2)
        mutuals = get_new_mutuals_sync(state)
        if mutuals is not None:
            log('Non-null mutuals', 3)
            new_graph_edges = mutuals['edges']
            new_names = mutuals['new_names']
            graph_file = open(_GRAPH_OUTPUT,'a')
            names_file = open(_NAME_OUTPUT, 'a')
            if len(history) == 1:
                log('Beginning graph and names files', 3)
                graph_file.write(_GRAPH_OUTPUT_FORMAT + '\n')
                names_file.write(_NAME_OUTPUT_FORMAT + '\n')
            log('Writing new edges', 3)
            for edge in new_graph_edges:
                graph_file.write(str(edge[0]) + ',' + str(edge[1]) + '\n')
            graph_file.close()
            log('Writing new names', 3)
            for id, name in new_names.items():
                names_file.write(str(id) + ',' + str(name) + '\n')
            names_file.close()
        if len(queue) == 0:
            state = None
            continue
        state = queue.popleft()
        queue_set.remove(state)
        write_queue(queue)
        write_state(state)
        write_history(history)

# Run

run_queue()
