import requests


position_mapping = {
    1: "HOK",
    2: "MID",
    3: "EDG",
    4: "HLF",
    5: "CTR",
    6: "WFB",
}

def fetch_data():
    url = 'https://fantasy.nrl.com/data/nrl/players.json'
    response = requests.get(url)
    if response.status_code == 200:
        raw_data = response.json()
        processed_data = process_data(raw_data)
        return processed_data
    else:
        print("Failed to retrieve data")
        return []

def process_data(raw_data):
    players_info = []  

    for player in raw_data:  
        player_info = player.copy()

       
        if "positions" in player_info and player_info["positions"]:
            mapped_positions = [position_mapping.get(pos, "Unknown") for pos in player_info["positions"]]
            player_info["positions"] = ", ".join(mapped_positions)

        
        player_info["first_name"] = player_info.get("first_name", "No Name")
        player_info["last_name"] = player_info.get("last_name", "")

        players_info.append(player_info)  

    return players_info  


if __name__ == '__main__':
    players_data = fetch_data()
    for player in players_data:
        print(player)



# static also only gets a list
# url = 'https://fantasy.nrl.com/data/nrl/players.json'
# response = requests.get(url)
# data = response.json() if response.status_code == 200 else []

