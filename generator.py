import os
import json
from collections import defaultdict
import colorsys

def readMaps(directory):
    database = {}
    visit_counts = defaultdict(int)
    
    for filename in os.listdir(directory):
        if filename.endswith(".json"):
            with open(os.path.join(directory, filename), 'r') as file:
                data = json.load(file)
                for group in data['groups'].values():
                    for path in group['paths']:
                        visit_counts[path] += 1
                        try:
                            database[path].append(filename[:-5])
                        except:
                            database[path] = [filename[:-5]]
    return visit_counts, database

def getColor(count):
    if count < 1:
        count = 1
    elif count > 50:
        count = 50
    
    hue = (count) * 240 / 50
    
    rgb = colorsys.hls_to_rgb(hue / 360.0, 0.5, 1.0)
    
    rgb = tuple(int(255 * x) for x in rgb)
    hex_color = '#{:02x}{:02x}{:02x}'.format(*rgb)
    
    return hex_color

def generateHeatmap(visit_counts):
    heatmap = {
        "groups": {},
        "title": "County Visit Heatmap",
        "hidden": [],
        "background": "#013f3f",
        "borders": "#000",
        "legendFont": "Century Gothic",
        "legendFontColor": "#ffffff",
        "legendBgColor": "#00000000",
        "legendBoxShape": "square",
        "legendBorderColor": "#00000000",
        "legendWidth": 391.80637738330046,
        "areBordersShown": True,
        "defaultColor": "#d1dbdd",
        "labelsColor": "#000000",
        "labelsFont": "Arial",
        "strokeWidth": "medium",
        "areLabelsShown": True,
        "uncoloredScriptColor": "#ffff33",
        "v5": True,
        "areStateBordersShown": True,
        "legendPosition": "bottom_right",
        "legendSize": "medium",
        "legendStatus": "show",
        "scalingPatterns": True,
        "legendRowsSameColor": True,
        "legendColumnCount": 1
    }

    for county, count in visit_counts.items():
        color = getColor(count)
        if color not in heatmap["groups"]:
            heatmap["groups"][color] = {"label": f"{count} visitors", "paths": []}
        heatmap["groups"][color]["paths"].append(county)
    
    return heatmap

def saveHeatmap(heatmap, filename):
    with open(filename, 'w') as file:
        json.dump(heatmap, file, indent=4)

def saveVisitorData(data):
    lines_to_write = ""
    for county in data:
        line = county + ", "
        line += ", ".join(data[county])
        lines_to_write += line + "\n"
    with open('visitordata.csv', 'w') as file:
        file.writelines(lines_to_write)
        
def createHeatmapFromDirectory(directory, output_filename):
    visit_counts, visitor_data = readMaps(directory)
    heatmap = generateHeatmap(visit_counts)
    saveHeatmap(heatmap, output_filename)
    saveVisitorData(visitor_data)

createHeatmapFromDirectory("maps/", "heatmap.json")