import datetime
import json
import os
import io
import copy

separator = "_____________________________________________________________\n"

log_file = "./download_data/map_editors/log.txt"
map_directory = "./download_data/data/map"
map_fileName = "countries-10m"
map_version = -1              # -1-> last vesrion, 0-> original file

# Nome dello Stato da cercare
country_name = "Netherlands"
new_countryName = None
pol_to_extract = None
new_id = None

# Se true il poligono che viene estratto  e viene anche rimosso dal set di poligoni
# in cui si trovava originariamente
remove_from_originalCountry = True


def find_mapPath():
    global map_version
    map_selected = None

    all_files = os.listdir(map_directory)
    map_filter = filter(lambda f: f[-5:] == ".json"
                        and map_fileName in f, all_files)
    map_files = list(map_filter)

    # Find the last version available (the original map is excluded)
    if map_version == -1:
        last_version = -1
        for f_map in map_files:
            p = f_map.find("_V")
            if p == -1:
                continue
            v = int(f_map[p+2:-5])
            if v > last_version:
                last_version = v
                map_selected = f_map
        map_version = last_version
     # Select the original map
    elif map_version == 0:
        idx_map = map_files.index(map_fileName+".json")
        map_selected = map_files[idx_map]
    # Select one specific version
    else:
        for f_map in map_files:
            p = f_map.find("_V")
            if p == -1:
                continue
            v = int(f_map[p+2:-5])
            if v == map_version:
                map_selected = f_map
                break

    if map_selected is None:
        print("Error: MAP NOT FOUND!")
        exit()

    print("FileName_map:", map_selected)
    print(separator)
    return os.path.join(map_directory, map_selected)


def show_info(c, s):
    print("\t\t"+s+" COUNTRY INFO")
    print("Name:", c["properties"]["name"])
    print("Id:", c['id'])
    print("Type:", c['type'])
    print("Number of polygon:", len(c["arcs"]))
    print(separator)


def find_country(country_list, name):
    for pos, el in enumerate(country_list):
        if el["properties"]["name"] == name:
            return el

    # se nessuna corrspondenza ritorna un oggetto nullo
    return None


def extract_polygon(country):
    global new_countryName, pol_to_extract, new_id
    # seleziona la posizione del country da estrarre
    pol_to_extract = int(
        input("Insert POSITION of the polygon to extract: "))
    if pol_to_extract < 0 or pol_to_extract > len(country["arcs"]):
        print("\tERROR: Value out of range!")
        exit(-1)

    new_countryName = input(
        "Insert new NAME for the new extracted polygon: ")
    print(separator)

    new_id = 9999
    polygon_to_extract = copy.deepcopy(country["arcs"][pol_to_extract])
    remove_polygon(country, pol_to_extract)

    return polygon_to_extract


def crete_new_country(new_name, new_id, polygon, parent_country):
    
    new_country = copy.deepcopy(parent_country)
    new_country["id"] = str(new_id)
    new_country["properties"]["name"] = new_name
    new_country["arcs"] = [polygon]
    new_country["type"] = "Polygon"

    show_info(new_country, "NEW")
    return new_country


def append_polygon(country, polygon):
    country["arcs"].append(polygon)
    if len(country["arcs"]) > 1:
        country["type"] = "MultiPolygon"
    
    show_info(country, "NEW")
    return country


def remove_polygon(original_country, pol_pos):
    if remove_from_originalCountry:
        original_country["arcs"].pop(pol_pos)
        if len(original_country["arcs"]) == 1:
            original_country["type"] = "Polygon"
    show_info(original_country, "UPDATED ORIGINAL")


def log_changes():
    f = open(log_file, "a")
    f.write("MAP VERSION "+str(map_version+1)+"\n\n")

    f.write("Orginal mapVersion: " + str(map_version)+"\n")
    f.write("Log time: "+str(datetime.datetime.now())+"\n\n")
    f.write("Orginal Name: "+country_name+"\n")
    f.write("New Name: "+new_countryName+"\n")
    f.write("Id: "+str(new_id)+"\n")
    f.write("Poligon pos. extracted: "+str(pol_to_extract)+"\n")
    f.write("Polygon removed from the orignal country: " +
            ("YES" if remove_from_originalCountry else "NO")+"\n")

    f.write("########################################################################")
    f.write("\n\n")
    f.close()


def save_newMap(data):
    new_name = map_fileName + "_V" + str(map_version+1)+".json"

    json_f = json.dumps(data)
    f = open(os.path.join(map_directory, new_name), "w")
    f.write(json_f)
    f.close()
    log_changes()


def move_oldMap(map_path):
    nameMap = map_fileName + "_V" + str(map_version)+".json"
    os.rename(map_path, os.path.join(map_directory, "old_version", nameMap))


def update_map(dataMap, country):
    polygon_extracted = extract_polygon(country)

    new_country = find_country(countries_list, new_countryName)
    if new_country is None:
        print("Creating new country...")
        new_country = crete_new_country(new_countryName, 9999, polygon_extracted, country)
        dataMap["objects"]["countries"]["geometries"].append(new_country)
    else:
        print("The country already exist, appending the polingon to {}...".format(new_countryName))
        new_country = append_polygon(new_country, polygon_extracted)

    extract = input("Continue? ")
    if extract != "yes":
        print("\tChiusura del programma senza apportare alcuna modifica!")
        exit(0)
        
    save_newMap(dataMap)
    


# MAIN
if __name__ == "__main__":
    mapFile_path = find_mapPath()
    with io.open(mapFile_path, mode="r", encoding="UTF-8") as json_file:
        data_map = json.load(json_file)
        countries_list = data_map["objects"]["countries"]["geometries"]

        country = find_country(countries_list, country_name)
        if country is None:
            print("COUNTRY NOT FOUND!")
            exit(-1)

        if "id" not in country:
            country["id"] = None
        show_info(country, "ORIGINAL")

        update_map(data_map, country)
    
    move_oldMap(mapFile_path)
