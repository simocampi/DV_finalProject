import pandas as pd
import io
import os
import json
import numpy as np

dataTmp_folder = "./download_data/data/counties"
dataYear_folder = "./download_data/data/years"

global_dict = {}

maxTmp = -9999
minTmp = 99999


def group_year(df):

    year_list = df.loc[:, "Year": "Month"]
    year_dict = {}
    find_start = False
    for idx, (year, month) in enumerate(year_list.values.tolist()):
        if (year not in year_dict or month == 5) and (find_start or not np.isnan(df.loc[idx, "Twenty-year Anomaly"])):
            year_dict[year] = idx
            find_start = True
    return year_dict


# initialize the year dictionary
folders_list = [(os.path.join(dataTmp_folder, country), country)
                for country in os.listdir(dataTmp_folder)]
folders_list.append(
    ("./download_data/data/regions/Global Land", "Global Land"))

for i, (dir_path, country) in enumerate(folders_list):

    df = pd.read_csv(dir_path + "/" + country + "_anomalyTable.csv")
    year_group = group_year(df)

    for year in year_group.keys():
        if year not in global_dict:
            global_dict[year] = pd.DataFrame(
                columns=["Country", "Anomaly"])

# filling the csv files
for i, (dir_path, country) in enumerate(folders_list):
    print("[{}/{}] {}".format(i, len(folders_list), country))

    df = pd.read_csv(dir_path + "/" + country+"_anomalyTable.csv")
    year_group = group_year(df)

    for year in global_dict.keys():
        if year in year_group.keys():
            year_mean = df.loc[year_group[year], "Twenty-year Anomaly"]

            year_df = global_dict[year]
            new_row = {"Country": country,
                       "Anomaly": year_mean}
            global_dict[year] = year_df.append(new_row, ignore_index=True)
        else:
            year_df = global_dict[year]
            new_row = {"Country": country, "Anomaly": np.float64("NaN")}
            global_dict[year] = year_df.append(new_row, ignore_index=True)

for year in global_dict.keys():
    if not os.path.exists(dataYear_folder+"/"+str(year)):
        os.makedirs(dataYear_folder+"/"+str(year))
    curr_max = np.max(global_dict[year]["Anomaly"])
    curr_min = np.min(global_dict[year]["Anomaly"])

    maxTmp = max(maxTmp, curr_max)
    minTmp = min(minTmp, curr_min)

    global_dict[year].to_csv(
        dataYear_folder+"/"+str(year)+"/20-year_mean.csv", index=False)

print()
new_row = {"Average": "20-year",
           "First_year": sorted(global_dict.keys())[0],
           "Last_year": sorted(global_dict.keys())[-1],
           "min_temp": minTmp,
           "max_tmp": maxTmp}
df = pd.read_csv("./download_data/extra-data/14.3_info_yearsDivision.csv", index_col=0)
df = df.append(new_row, ignore_index=True)
df.to_csv("./download_data/extra-data/14.4_info_yearsDivision.csv", index=False)
print(df)

print("Saved the files that contains the division by years, PART 4.")