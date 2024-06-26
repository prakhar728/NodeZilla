import requests
import os
from dotenv import load_dotenv
from datetime import datetime
import threading
import time
# import pytz

import DB as db

load_dotenv()

# URL of the API endpoint
DUNE_URL = "https://api.dune.com/api"                                   #Base URL
ALL_OPS = "/v1/eigenlayer/operator-metadata"    #All Operators
OP_METRIC = "/v1/eigenlayer/operator-stats"     # Metric for Operators

# operator_contract_address in ('0x09e6eb09213bdd3698bd8afb43ec3cb0ecff683e', '0xd172a86a0f250aec23ee19c759a8e73621fe3c10')

DUNE_KEY = os.getenv('DUNE_API_KEY')

# Custom headers
headers = {
    'X-DUNE-API-KEY': DUNE_KEY,
}


############################################# Helper ############################


def format_time(timestamp_str):
  """
  This function removes microseconds from a timestamp string.

  Args:
      timestamp_str (str): The timestamp string in ISO 8601 format (e.g., 2024-06-25T16:15:49.740032Z).

  Returns:
      str: The timestamp string with microseconds clipped (e.g., 2024-06-25T16:15:49Z).
  """
  # Split the datetime and timezone parts
  parts = timestamp_str.split("Z")
  datetime_part = parts[0]

  # Clip microseconds (if any)
  datetime_part = datetime_part.rsplit(".", 1)[0]  # Remove everything after the last dot
  # Combine the parts and return the modified string

  return datetime.fromisoformat(datetime_part)


############################################# Functions ############################

# Fetch all the metadata for 100 operators and store it in the database. This function should run once to populate only a 100 operators
def get_all_operators():
    querystring = { "limit" : "100" }
    request_url = DUNE_URL + ALL_OPS

    try:
        response = requests.get(request_url, headers=headers, params=querystring)
        res = response.json()
        nodes = res['result']['rows']

        for node in nodes:
            inserted_node = db.nodes_collection.insert_one(
                node
            )
        
        print("Populated DB with all the nodes")
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except Exception as err:
        print(f"Other error occurred: {err}")



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
                    # Join the quoted elements with a comma and space
                    joined_elements = ', '.join(quoted_elements)

                    # Enclose the joined string in parentheses
                    result = f"({joined_elements})"

                    querystring = { 
                        "limit" : "1",
                        "filters": "operator_contract_address in" + result,
                    }

                    response = requests.get(request_url, headers=headers, params=querystring)
                    res = response.json()
                    nodes = res['result']['rows']

                    for node in nodes:
                        updated_node = db.nodes_collection.update_one(filter ={
                            'operator_contract_address': node['operator_contract_address']
                        }, 
                        update={
                            "$set": node
                        }
                        )
                    temp = []
                    time.sleep(2)
            print("Refreshed all nodes inside db")
            time.sleep(20)
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")
        except Exception as err:
            print(f"Error refreshing nodes: {err}")


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
                    # Join the quoted elements with a comma and space
                    joined_elements = ', '.join(quoted_elements)

                    # Enclose the joined string in parentheses
                    result = f"({joined_elements})"
                    querystring = { 
                        "limit" : "10",
                        "filters": "operator_contract_address in" + result,
                    }

                    response = requests.get(request_url, headers=headers, params=querystring)

                    res = response.json()

                    timestamp = format_time(res['execution_ended_at'])
                    values = res['result']['rows']

                    for value in values:
                        address = value['operator_contract_address']

                        collection = db.get_db_for_tsdb(address)

                        new_t = collection.insert_one({
                            'timestamp': timestamp,
                            'address': address,
                            'value': value
                        })
                        print(new_t)

                    temp_address = []
                    time.sleep(2)
                    print("populated 10")
            print("Populated time series db")
            time.sleep(20) 
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")
        except Exception as err:
            print(f"error with time seriess: {err}")


# get_all_operators()   #one time to populate db with info
# refresh_operators()   # refresh metadata for operators 10 at a time
# populate_time_series()


def main():
    thread1 = threading.Thread(target=populate_time_series)
    # thread2 = threading.Thread(target=refresh_operators)

    # Start the threads
    thread1.start()
    # thread2.start()


if __name__ == "__main__":
  main()
 