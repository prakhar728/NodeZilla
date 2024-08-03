import os
import requests
import threading
import time
from dotenv import load_dotenv
from datetime import datetime
import logging
import config

import DB as db

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

DUNE_URL = config.DUNE_URL
ALL_OPS = config.ALL_OPS
OP_METRIC = config.OP_METRIC
DUNE_KEY = os.environ['DUNE_API_KEY']

# Custom headers
headers = {
    'X-DUNE-API-KEY': DUNE_KEY,
}


############################################# Helper ############################
def format_time(timestamp_str):
    try:
        datetime_part = timestamp_str.split("Z")[0]
        datetime_part = datetime_part.rsplit(".", 1)[0]
        return datetime.fromisoformat(datetime_part)
    except Exception as e:
        logging.error(f"Error formatting time: {e}")
        return None


############################################# Functions ############################
def get_all_operators():
    querystring = {"limit": "300"}
    request_url = DUNE_URL + ALL_OPS

    try:
        response = requests.get(request_url,
                                headers=headers,
                                params=querystring)
        response.raise_for_status()
        nodes = response.json()['result']['rows']

        for node in nodes:
            node['status'] = 'inactive'
            db.nodes_collection.insert_one(node)

        logging.info("Populated DB with all the nodes")
    except requests.exceptions.HTTPError as http_err:
        logging.error(f"HTTP error occurred: {http_err}")
    except Exception as err:
        logging.error(f"Other error occurred: {err}")


def refresh_operators():
    request_url = DUNE_URL + ALL_OPS

    while True:
        try:
            all_nodes = db.nodes_collection.find()
            temp = []

            for node in all_nodes:
                temp.append(node['operator_contract_address'])

                if len(temp) == 1:
                    quoted_elements = [f"'{elem}'" for elem in temp]
                    joined_elements = ', '.join(quoted_elements)
                    result = f"({joined_elements})"
                    querystring = {
                        "limit": "1",
                        "filters": "operator_contract_address in" + result,
                    }

                    response = requests.get(request_url,
                                            headers=headers,
                                            params=querystring)
                    response.raise_for_status()
                    nodes = response.json()['result']['rows']

                    for node in nodes:
                        db.nodes_collection.update_one(
                            {
                                'operator_contract_address':
                                node['operator_contract_address']
                            }, {"$set": node})
                    temp = []
                    time.sleep(2)

            logging.info("Refreshed all nodes inside db")
            time.sleep(20)
        except requests.exceptions.HTTPError as http_err:
            logging.error(f"HTTP error occurred: {http_err}")
        except Exception as err:
            logging.error(f"Error refreshing nodes: {err}")


def populate_time_series():
    request_url = DUNE_URL + OP_METRIC
    while True:
        try:
            all_nodes = db.nodes_collection.find()
            temp_address = []

            for node in all_nodes:
                temp_address.append(node['operator_contract_address'])

                if len(temp_address) == 10:
                    quoted_elements = [f"'{elem}'" for elem in temp_address]
                    joined_elements = ', '.join(quoted_elements)
                    result = f"({joined_elements})"
                    querystring = {
                        "limit": "10",
                        "filters": "operator_contract_address in " + result,
                    }

                    response = requests.get(request_url,
                                            headers=headers,
                                            params=querystring)
                    response.raise_for_status()
                    res = response.json()

                    timestamp = format_time(res['execution_ended_at'])
                    if not timestamp:
                        continue
                    values = res['result']['rows']

                    db.nodes_collection.update_many({},
                                                    {'$unset': {
                                                        "status": ""
                                                    }})
                    for value in values:
                        address = value['operator_contract_address']
                        collection = db.get_db_for_tsdb(address)
                        db.nodes_collection.update_one(
                            {"operator_contract_address": address},
                            {"$set": {
                                "status": "active"
                            }})
                        collection.insert_one({
                            'timestamp': timestamp,
                            'address': address,
                            'value': value
                        })

                    temp_address = []
                    logging.info("Batch success")

            logging.info("Populated time series db")
            time.sleep(900)
        except requests.exceptions.HTTPError as http_err:
            logging.error(f"HTTP error occurred: {http_err}")
        except Exception as err:
            logging.error(f"Error with time series: {err}")


def main():
    thread1 = threading.Thread(target=populate_time_series)
    # thread2 = threading.Thread(target=refresh_operators)

    # Start the threads
    thread1.start()
    # thread2.start()


if __name__ == "__main__":
    main()
