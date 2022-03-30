
import pandas as pd
import json
from collections import defaultdict
from itertools import combinations
import sys
import ast
import datetime
import re
import hashlib
import hyperspy.api as hs

import atomap.api as am
from os import path
from PIL import Image
import os
import math

from scipy import spatial
import numpy as np
from statistics import mean
import cv2
from atomap.tools import remove_atoms_from_image_using_2d_gaussian

from math import acos
from math import sqrt
from math import pi
from math import atan2

from shapely.geometry import Polygon



def merge(list1, list2):

    merged_list = [(list1[i], list2[i]) for i in range(0, len(list1))]
    return merged_list

def check(list1, val):
   return(sum([x > val for x in list1]) == 2 or sum([x < val for x in list1]) == 2)


def length(v):
     return sqrt(v[0]**2+v[1]**2)


def angle_trunc(a):
     while a < 0.0:
         a += pi * 2
     return a

def getAngleBetweenPoints(x_orig, y_orig, x_landmark, y_landmark):
    #since number increase as go down (up is down), reverse orig and landlark y
     deltaY =  y_orig - y_landmark
     deltaX = x_landmark - x_orig
     facingAngle = atan2(deltaY, deltaX) * 180/pi
     # angleOfTarget = 90
     # anglediff = (facingAngle - angleOfTarget + 180 + 360) % 360 - 180
     #angle = min(((360 - angle)), (angle))
     return facingAngle


def horizontal_angle(x):

    x['horizontal_angle'] = getAngleBetweenPoints(x['x_position'], x['y_position'], x['x_next'], x['y_next'])

    x['center_horizontal_angle']= x['inner_angle_center_atom'] - x['horizontal_angle']
    return x


def join_positions(x):
    x['new_column']= str(x['x_position']) + " " + str(x['y_position'])
    return x

def write_df_to_json(df, file_name):
   data= df.to_json(orient='records')
   with open(os.path.join('app/static/data_json', file_name), 'w') as f:
       f.write(data)
   return


def add_plane_data(image, neighbors, atoms, zone, monolayer, sublattice):
    image = "app/" + image
    #print(image)
    s=hs.load(image)

    #so filtering the dataframe by plane (but should just keep everything and filter in the javascript)
    neighbors_one_plane = neighbors[neighbors["zone"]==zone]
    new_df = pd.merge(atoms, neighbors_one_plane,  how='left', left_on=['x_position', 'y_position'], right_on = ['x_position', 'y_position'])

    #write a statistics dataframe
    describe_new_df = new_df[['sigma_x', 'sigma_y', 'ellipticity', 'distance_prev', 'distance_next']].describe()
    describe_new_df["statistics"]=describe_new_df.index

    write_df_to_json(describe_new_df, 'describe.json')


    return describe_new_df

def preprocess(original_image_path, new_image_path):
    img = cv2.imread(original_image_path, 0)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl_img = clahe.apply(img)
    cl_img.save(new_image_path)


def make_atom_lattice(orig_image, max_dist, plane_first_sublattice, plane_second_sublattice, step):

    name = orig_image.split('.')[0]
    ext = orig_image.split('.')[1]
    image = "app/static/images/" + name + "." + ext

    if ext != "jpg":
        im = Image.open(image)
        rgb_im = im.convert('RGB')
        image = "app/static/images/" + name + ".jpg"
        rgb_im.save(image)

    x=Image.open(image,'r')
    x=x.convert('L') #makes it greypixels_nanometer
    y=np.asarray(x.getdata(),dtype=np.float64).reshape((x.size[1],x.size[0]))
    y=np.asarray(y,dtype=np.uint8)

    w=Image.fromarray(y,mode='L')

    w.save("app/static/images/" + name +  "_processed." + ext)

    s=hs.load("app/static/images/" + name +  "_processed." + ext)

    #app/static/images/adf.jpg get just the adf and add _atom_lattice.hdft as name
    name_atom_lattice = image.split('/')[3].split('.')[0] + "_atom_lattice.hdf5"

    #first sublattice info (most intense atoms)
    A_positions = am.get_atom_positions(s, separation=max_dist)
    sublattice_A = am.Sublattice(A_positions, image=s.data)
    atom_lattice = am.Atom_Lattice(image=s.data, name='test', sublattice_list=[sublattice_A])


    if step == "step_1":
        sublattice_A.find_nearest_neighbors()
        atom_lattice = am.Atom_Lattice(image=s.data, name='test', sublattice_list=[sublattice_A])
        atom_lattice.save("app/static/hdf5/" + name_atom_lattice, overwrite=True)

    elif step == "step_2":
        atom_lattice = am.load_atom_lattice_from_hdf5("app/static/hdf5/" + name_atom_lattice)
        sublattice_A = atom_lattice.sublattice_list[0]
        sublattice_A.refine_atom_positions_using_center_of_mass()
        sublattice_A.refine_atom_positions_using_2d_gaussian()
        sublattice_A.construct_zone_axes()
        atom_lattice = am.Atom_Lattice(image=s.data, name='test', sublattice_list=[sublattice_A])
        atom_lattice.save("app/static/hdf5/" + name_atom_lattice, overwrite=True)

    elif step == "step_3":
        atom_lattice = am.load_atom_lattice_from_hdf5("app/static/hdf5/" + name_atom_lattice)
        sublattice_A = atom_lattice.sublattice_list[0]

        zone_axis = sublattice_A.zones_axis_average_distances[plane_first_sublattice]
        print(sublattice_A.zones_axis_average_distances)
        B_positions = sublattice_A.find_missing_atoms_from_zone_vector(zone_axis)
        image_without_A = remove_atoms_from_image_using_2d_gaussian(sublattice_A.image, sublattice_A, show_progressbar=False)

        sublattice_B = am.Sublattice(B_positions, image=image_without_A)

        sublattice_B.find_nearest_neighbors()
        sublattice_B.refine_atom_positions_using_center_of_mass()
        sublattice_B.refine_atom_positions_using_2d_gaussian()
        sublattice_B.construct_zone_axes()

        atom_lattice = am.Atom_Lattice(image=s.data, name='test', sublattice_list=[sublattice_A, sublattice_B])
        atom_lattice.save("app/static/hdf5/" + name_atom_lattice, overwrite=True)


    elif step == "step_4":

        atom_lattice = am.load_atom_lattice_from_hdf5("app/static/hdf5/" + name_atom_lattice)
        sublattice_A = atom_lattice.sublattice_list[0]
        sublattice_B = atom_lattice.sublattice_list[1]

        #adding sublattice c
        image_without_B = remove_atoms_from_image_using_2d_gaussian(sublattice_B.image, sublattice_B)
        cv2.imwrite("app/static/images/image_without_b.jpg", image_without_B )
        #get B poistions by mid-point of one of sublattice planes
        print(sublattice_A.zones_axis_average_distances)
        zone_axis = sublattice_A.zones_axis_average_distances[plane_second_sublattice]
        print(zone_axis)
        # (25.74, 0.02)
        C_positions = sublattice_A.find_missing_atoms_from_zone_vector(zone_axis)

        sublattice_C = am.Sublattice(C_positions, image=image_without_B, color='b')

        sublattice_C.find_nearest_neighbors()
        sublattice_C.refine_atom_positions_using_center_of_mass()
        sublattice_C.refine_atom_positions_using_2d_gaussian()
        sublattice_C.construct_zone_axes()
        atom_lattice = am.Atom_Lattice(image=s.data, name='test', sublattice_list=[sublattice_A, sublattice_B, sublattice_C])
        atom_lattice.save("app/static/hdf5/" + name_atom_lattice, overwrite=True)
    else:

        pass

    #load previously or (if path didn't exist yet) processed atom_lattice
    #atom_lattice = am.load_atom_lattice_from_hdf5(name_atome_lattice)
    return sublattice_A.zones_axis_average_distances


def process_image(orig_image, max_dist, pre_process):
    ##root folder is app so changing files
    name = orig_image.split('.')[0]
    ext = orig_image.split('.')[1]
    image = "app/static/images/" + name + "." + ext

    if ext != "jpg":
        im = Image.open(image)
        rgb_im = im.convert('RGB')
        image = "app/static/images/" + name + ".jpg"
        rgb_im.save(image)


    x=Image.open(image, 'r')

    #convert to image that can be process in automap
    x=x.convert('L') #makes it greypixels_nanometer
    x=np.asarray(x.getdata(),dtype=np.float64).reshape((x.size[1],x.size[0]))
    x=np.asarray(x,dtype=np.uint8)

    x=Image.fromarray(x, mode='L')
    x.save("app/static/images/" + name +  "_processed." + ext)

    return "static/images/" + name +  "_processed." + ext


def csv_to_json2(orig_image, max_dist, plane_first_sublattice, plane_second_sublattice, pixels_nanometer, step = "step_1"):
    #load image based on adddress given in routes

    image = "app/static/images/" + orig_image


    #app/static/images/adf.jpg get just the adf and add _atom_lattice.hdft as name
    name_atom_lattice = image.split('/')[3].split('.')[0] + "_atom_lattice.hdf5"
    #run the process zigzag on the image and store as name_atome_lattice if doesn't exit already
    list_sublattice_a = make_atom_lattice(orig_image, max_dist, plane_first_sublattice, plane_second_sublattice, step)

    name = orig_image.split('.')[0]
    ext = orig_image.split('.')[1]
    s=hs.load("app/static/images/" + name +  "_processed." + ext)
    #load previously or (if path didn't exist yet) processed atom_lattice
    atom_lattice = am.load_atom_lattice_from_hdf5("app/static/hdf5/" + name_atom_lattice)


    #stored info per atom in list initially - will be stored in dataframe at the end
    distance_next_df =[]
    distance_prev_df =[]
    x_position_df =[]
    y_position_df =[]
    x_prev_df =[]
    y_prev_df =[]
    x_next_df =[]
    y_next_df =[]
    plane_df =[]
    zone_df =[]
    sublattice_df=[]
    plane_position_df=[]

    x_distance_next_monolayer = []
    y_distance_next_monolayer = []
    length_distance_next_monolayer = []

    zone_monolayer_df= []
    sublattice_monolayer_df = []

    x_position_atom  =[]
    y_position_atom  =[]
    sigma_x_atom  = []
    sigma_y_atom  = []
    ellipticity_atom = []
    rotation_ellipticity_atom = []
    sublattice_atom =[]

    #this is manually done twice for the two sublattice, but really should be a function that goes through the sublattices
    for current_sublattice_i in range(len(atom_lattice.sublattice_list)):
        current_sublattice= atom_lattice.sublattice_list[current_sublattice_i ]
        x_position_atom.extend(current_sublattice.x_position.tolist())
        y_position_atom.extend(current_sublattice.y_position.tolist())
        sigma_x_atom.extend(current_sublattice.sigma_x.tolist())
        sigma_y_atom.extend(current_sublattice.sigma_y.tolist())
        ellipticity_atom.extend(current_sublattice.ellipticity.tolist())
        rotation_ellipticity_atom.extend(current_sublattice.rotation_ellipticity.tolist())
        sublattice_c= [current_sublattice] * len(current_sublattice.rotation_ellipticity.tolist())
        sublattice_atom.extend(sublattice_c)


        for current_zone_i  in range(len(current_sublattice.zones_axis_average_distances)):
            #going from sublattice, to zone, to plane within zone
            # #each sublattice has zone axis identified with it's average x, y distance to next atom
            # #example list: [(-1.59, 87.37), (87.74, 0.92), (86.14, 88.27), (89.33, -86.46)]
            current_zone = current_sublattice.zones_axis_average_distances[current_zone_i]

            # #Get distance between each atom and the next monolayer given by the zone_vector.
            # #Returns the x- and y-position, and the distance between the atom and the monolayer.
            # #The position is set between the atom and the monolayer.
            # #this is used for the dot between monolayers
            distance_next_monolayer = current_sublattice.get_monolayer_distance_list_from_zone_vector(current_zone)
            x_distance_next_monolayer.extend(distance_next_monolayer[0])
            y_distance_next_monolayer.extend(distance_next_monolayer[1])
            length_distance_next_monolayer.extend(distance_next_monolayer[2])

            sublattice_monolayer = [current_sublattice] * len(distance_next_monolayer[0])

            zone_monolayer = [current_zone] * len(distance_next_monolayer[0])
            sublattice_monolayer_df.extend(sublattice_monolayer)
            zone_monolayer_df.extend(zone_monolayer)

            current_plane_list = current_sublattice.atom_planes_by_zone_vector[current_zone]


            for current_plane_i in range(len(current_plane_list)):

                #cycle through each plane in zone
                current_plane = current_plane_list[current_plane_i]


                x_position = current_plane.get_x_position_list()
                y_position = current_plane.get_y_position_list()

                distance_next = current_plane.get_atom_distance_list()
                #since the distance to the next atom will be n/z for the last atom, adding "none"

                distance_prev = distance_next.copy()
                distance_next.append(None)

                #distance the prev atom will be n/a for the first atom
                distance_prev.insert(0, None)

                x_prev = x_position[:-1]
                x_prev.insert(0, x_position[0])

                y_prev = y_position[:-1]
                y_prev.insert(0, y_position[0])

                x_next= x_position[1:]
                x_next.append(x_position[-1])

                y_next  = y_position[1:]
                y_next.append(y_position[-1])

                plane = [current_plane] * len(x_position)
                zone = [current_zone] * len(x_position)

                plane = [current_plane_i] * len(x_position)
                sublattice_i = [str(current_sublattice)] * len(x_position)
                plane_position = [*range(len(x_position))]


                distance_next_df.extend(distance_next)
                distance_prev_df.extend(distance_prev)
                x_position_df.extend(x_position)
                y_position_df.extend(y_position)
                x_prev_df.extend(x_prev)
                y_prev_df.extend(y_prev)
                x_next_df.extend(x_next)
                y_next_df.extend(y_next)
                plane_df.extend(plane)
                zone_df.extend(zone)
                sublattice_df.extend(sublattice_i)
                plane_position_df.extend(plane_position)

     #stored info per atom in list initially - will be stored in dataframe at the end
    monolayer_df = pd.DataFrame(list(zip(x_distance_next_monolayer, y_distance_next_monolayer, length_distance_next_monolayer, zone_monolayer_df, sublattice_monolayer_df)),  columns =['x_monolayer', 'y_monolayer', 'length_monolayer', 'zone_monolayer_df', 'sublattice_monolayer_df'])

    neighbors = pd.DataFrame(list(zip(distance_next_df, distance_prev_df, x_position_df, y_position_df, x_prev_df, y_prev_df, x_next_df, y_next_df, plane_df, zone_df, sublattice_df, plane_position_df)),  columns =['distance_next', "distance_prev", 'x_position', 'y_position', 'x_prev', 'y_prev', 'x_next', 'y_next', 'plane', 'zone', 'sublattice_df', 'plane_position_df'])

    neighbors["zone_plane_horizontal"] = neighbors['zone'].astype(str) + neighbors['sublattice_df'].astype(str) + "Plane: " + neighbors['plane'].astype(str)

    neighbors['zone_horizontal'] = neighbors['zone']
    # neighbors.loc[neighbors['zone2'] == (75.82, 0.08), 'zone_horizontal'] = "Horizontal Line"
    # neighbors.loc[neighbors['zone2'] == (75.86, 0.02), 'zone_horizontal'] = "Horizontal Line"
    neighbors.loc[neighbors['zone'] == (61.49, 0.01), 'zone_horizontal'] = "Horizontal Line"
    neighbors.loc[neighbors['zone'] == (61.47, 0.05), 'zone_horizontal'] = "Horizontal Line"

    #every line, with two lines combined, is it's own group
    neighbors["zone_plane_orig"] = neighbors['zone'].astype(str) + "Plane: " + neighbors['plane'].astype(str)

    #every line, not combined, is it's own group
    neighbors["zone_plane_horizontal"] = neighbors['zone_horizontal'].astype(str) + "Plane: " + neighbors['plane'].astype(str)

    #the average of each indiviual line
    neighbors['avg_y_horizontal'] = neighbors.groupby(['zone_plane_horizontal'])['y_position'].transform('mean')

    #the average of each line with two lines combined
    neighbors['avg_y_zone_orig'] = neighbors.groupby(['zone_plane_orig'])['y_position'].transform('mean')

    #average from combined lines minus original
    neighbors['dist_from_avg_line'] = neighbors['avg_y_horizontal'] - neighbors['avg_y_zone_orig']

    #ind_dist_from_avg_line_mean should be same value as dist_from_avg_line
    neighbors['ind_dist_from_avg_line'] = neighbors['avg_y_horizontal'] -  neighbors['y_position']
    neighbors['ind_dist_from_avg_line_mean'] = neighbors.groupby(['zone_plane_orig'])['ind_dist_from_avg_line'].transform('mean')

    #calculated stddev
    neighbors['dev_y_horizontal'] = (neighbors['y_position'] - neighbors['avg_y_zone_orig'])**2
    neighbors['stddev_y_horizontal'] = neighbors.groupby(['zone_plane_orig'])['dev_y_horizontal'].transform('mean')**(1/2)


    #neighbors["zone_horizontal"] = neighbors[['zone_horizontal', 'sublattice_df']].apply(lambda row: ''.join(row.values.astype(str)), axis=1)
    #neighbors["zone_horizontal"] = neighbors[['zone_horizontal', 'sublattice_df']].apply(lambda row: ''.join(row.values.astype(str)), axis=1)

    atoms = pd.DataFrame(list(zip(x_position_atom, y_position_atom, sigma_x_atom, sigma_y_atom, ellipticity_atom, rotation_ellipticity_atom, sublattice_atom)),  columns =['x_position', 'y_position', 'sigma_x', 'sigma_y', 'ellipticity', 'rotation_ellipticity', 'sublattice_atom'])

    def length(v):
         return sqrt(v[0]**2+v[1]**2)


    def angle_trunc(a):
         while a < 0.0:
             a += pi * 2
         return a

    def getAngleBetweenPoints(x_orig, y_orig, x_landmark, y_landmark):
        #since number increase as go down (up is down), reverse orig and landlark y
         deltaY =  y_orig - y_landmark
         deltaX = x_landmark - x_orig
         facingAngle = atan2(deltaY, deltaX) * 180/pi
         # angleOfTarget = 90
         # anglediff = (facingAngle - angleOfTarget + 180 + 360) % 360 - 180
         #angle = min(((360 - angle)), (angle))
         return facingAngle

    def four_neighbors(x):
        #find closest atoms in the opposite lattice
        current_sl =x["sublattice_atom"]
        current_atoms_df = atoms[atoms["sublattice_atom"] != current_sl]

        xy = current_atoms_df[['x_position', 'y_position']].drop_duplicates()
        xy = xy.to_numpy()

        tree = spatial.KDTree(xy)
        pts = np.array([[x['x_position'], x['y_position']]])
        result = tree.query(pts, k =4)
        index_result = result[1][0]

        x["neighbor_1x"] = xy[index_result[0]][0]
        x["neighbor_2x"] = xy[index_result[1]][0]
        x["neighbor_3x"] = xy[index_result[2]][0]
        x["neighbor_4x"] = xy[index_result[3]][0]

        x["neighbor_1y"] = xy[index_result[0]][1]
        x["neighbor_2y"] = xy[index_result[1]][1]
        x["neighbor_3y"] = xy[index_result[2]][1]
        x["neighbor_4y"] = xy[index_result[3]][1]

        x_coords = [x["neighbor_1x"], x["neighbor_2x"], x["neighbor_3x"],  x["neighbor_4x"]  ]
        y_coords = [x["neighbor_1y"], x["neighbor_2y"], x["neighbor_3y"],  x["neighbor_4y"]  ]

        x_min = min(x_coords)
        y_min = min(y_coords)

        x_coords = [x - x_min for x in x_coords]
        y_coords = [x - y_min for x in y_coords]

        x_center = mean(x_coords)
        y_center = mean(y_coords)


        from shapely.geometry import Polygon

        def merge(list1, list2):
            merged_list = [(list1[i], list2[i]) for i in range(0, len(list1))]
            return merged_list

        #https://stackoverflow.com/questions/41855695/sorting-list-of-two-dimensional-coordinates-by-clockwise-angle-using-python
        coords = merge(x_coords, y_coords)
        coords.sort(key=lambda x: math.atan2(x[1] - x_center, x[0] - y_center))
        polygon = Polygon(coords)

        x["area"] =polygon.area

        x["neighbor_1x"] = coords[0][0] + x_min
        x["neighbor_2x"] = coords[1][0] + x_min
        x["neighbor_3x"] = coords[2][0] + x_min
        x["neighbor_4x"] = coords[3][0] + x_min

        x["neighbor_1y"] = coords[0][1] + y_min
        x["neighbor_2y"] = coords[1][1] + y_min
        x["neighbor_3y"] = coords[2][1] + y_min
        x["neighbor_4y"] = coords[3][1] + y_min

        x["neighbor_1x_zero"] = coords[0][0]
        x["neighbor_2x_zero"] = coords[1][0]
        x["neighbor_3x_zero"] = coords[2][0]
        x["neighbor_4x_zero"] = coords[3][0]

        x["neighbor_1y_zero"] = coords[0][1]
        x["neighbor_2y_zero"] = coords[1][1]
        x["neighbor_3y_zero"] = coords[2][1]
        x["neighbor_4y_zero"] = coords[3][1]

        x['ratio_aspect'] = (max(y_coords) - min(y_coords))/(max(x_coords) - min(y_coords))

        #get center
        list_points = []
        for i in range(len(index_result)):
            current_point= list(xy[index_result[i]])
            list_points.append(current_point)

        numpy_points = np.array(list_points)
        center = numpy_points.mean(axis=0)
        x["center_neighborsx"] =  center[0]
        x["center_neighborsy"] =  center[1]
        x['inner_angle_center_atom']= getAngleBetweenPoints(x['x_position'], x['y_position'], center[0], center[1])

        length_arrow = 10

        x['x_dist_center_atom']=   center[0] -  x['x_position']
        x['y_dist_center_atom']=  center[1] - x['y_position']
        x["magnitude"] = math.sqrt(x['x_dist_center_atom']**2 + x['y_dist_center_atom']**2)
        x['arrow_x'] = x['x_position'] + length_arrow*(center[0]  - x['x_position'])
        x['arrow_y'] = x['y_position'] + length_arrow*(center[1] - x['y_position'] )

        filter_features_list = ["magnitude", "inner_angle_center_atom", "arrow_x", "arrow_y", "x_position", "y_position", "ratio_aspect", "area"]

        def check(list1, val):
           return(sum([x > val for x in list1]) == 2 or sum([x < val for x in list1]) == 2)

        for filtered_feature in filter_features_list:
            if x["magnitude"] < (max_dist/4) and check([x["neighbor_1x"], x["neighbor_2x"], x["neighbor_3x"], x["neighbor_4x"]], x['x_position']) and check([x["neighbor_1y"], x["neighbor_2y"], x["neighbor_3y"], x["neighbor_4y"]], x['y_position']):
                x["filtered_" + filtered_feature] = x[filtered_feature]
            else:
                x["filtered_" + filtered_feature] = None

        x["filtered_magnitude"] = x["magnitude"] if x["magnitude"] < (max_dist/4) else None
        x["filtered_inner_angle_center_atom"] = x["inner_angle_center_atom"] if x["magnitude"] < (max_dist/4) else None
        x["filtered_arrow_x"] = x["arrow_x"] if x["magnitude"] < (max_dist/4) else None
        x["filtered_arrow_y"] = x["arrow_y"] if x["magnitude"] < (max_dist/4) else None

        x["filtered_x_position"] = x["x_position"] if x["magnitude"] < (max_dist/4) else None
        x["filtered_y_position"] = x["y_position"] if x["magnitude"] < (max_dist/4) else None

        if .7 <(max(y_coords) - min(y_coords))/(max(x_coords) - min(y_coords)) < 1.3 :
            x['filtered_ratio_aspect'] = (max(y_coords) - min(y_coords))/(max(x_coords) - min(y_coords))
        else:
            x['filtered_ratio_aspect'] = None

        if check([x["neighbor_1x"], x["neighbor_2x"], x["neighbor_3x"], x["neighbor_4x"]], x['x_position']) or check([x["neighbor_1y"], x["neighbor_2y"], x["neighbor_3y"], x["neighbor_4y"]], x['y_position']):
            polygon = Polygon(coords)
            x["area"] =polygon.area
        else:
            polygon = Polygon(coords)
            x["area"] = None
        return x


    def upper_neighbors(x):
        sublattice_df = x['sublattice_df']
        plane = x['plane']
        zone_horizontal = x['zone_horizontal']
        plane_position_df = x['plane_position_df']
        x_position_current = x['x_position']
        y_position_current = x['y_position']
        subset_one_up = neighbors[(neighbors['sublattice_df'] == sublattice_df) & (neighbors['plane'] == plane + 1) & (neighbors['zone_horizontal'] == zone_horizontal) & (neighbors['plane_position_df'] == plane_position_df)]
        subset_one_up_one_right = neighbors[(neighbors['sublattice_df'] == sublattice_df) & (neighbors['plane'] == plane + 1) & (neighbors['zone_horizontal'] == zone_horizontal) & (neighbors['plane_position_df'] == plane_position_df + 1)]
        subset_one_right = neighbors[(neighbors['sublattice_df'] == sublattice_df) & (neighbors['plane'] == plane) & (neighbors['zone_horizontal'] == zone_horizontal) & (neighbors['plane_position_df'] == plane_position_df + 1)]
        x_position_subset_one_up = subset_one_up['x_position'].values
        y_position_subset_one_up = subset_one_up['y_position'].values
        x_position_subset_one_up_one_right = subset_one_up_one_right['x_position'].values
        y_position_subset_one_up_one_right = subset_one_up_one_right['y_position'].values
        x_position_subset_one_right = subset_one_right['x_position'].values
        y_position_subset_one_right = subset_one_right['y_position'].values
        if (len(x_position_subset_one_up) + len(y_position_subset_one_up) + len(x_position_subset_one_up_one_right) + len(y_position_subset_one_up_one_right) + len(x_position_subset_one_right) + len(y_position_subset_one_right) == 6) and (plane != 0):
            # save in dataframe
            x['x_position_subset_one_up'] = x_position_subset_one_up[0]
            x['y_position_subset_one_up'] = y_position_subset_one_up[0]
            x['x_position_subset_one_up_one_right'] = x_position_subset_one_up_one_right[0]
            x['y_position_subset_one_up_one_right'] = y_position_subset_one_up_one_right[0]
            x['x_position_subset_one_right'] = x_position_subset_one_right[0]
            x['y_position_subset_one_right'] = y_position_subset_one_right[0]

            # get distance lengthwise
            left_x = (x_position_current + x_position_subset_one_up[0])/2
            left_y = (y_position_current + y_position_subset_one_up[0])/2
            right_x = (x_position_subset_one_up_one_right[0] + x_position_subset_one_right[0])/2
            right_y = (y_position_subset_one_up_one_right[0] + y_position_subset_one_right[0])/2

            dist_hori = math.hypot(left_x -right_x, left_y - right_y)

            x['left_x'] = left_x
            x['left_y'] = left_y
            x['right_x'] = right_x
            x['right_y'] = right_y
            x['dist_hori'] = dist_hori

            # get distance heightwise
            top_x = (x_position_subset_one_up[0] + x_position_subset_one_up_one_right[0])/2
            top_y = (y_position_subset_one_up[0] + y_position_subset_one_up_one_right[0])/2
            bottom_x = (x_position_current + x_position_subset_one_right[0])/2
            bottom_y = (y_position_current + y_position_subset_one_right[0])/2

            dist_vert = math.hypot(top_x -bottom_x, top_y -bottom_y)

            x['top_x'] = top_x
            x['top_y'] = top_y
            x['bottom_x'] = bottom_x
            x['bottom_y'] = bottom_y
            x['dist_vert'] = dist_vert

        else:
            pass
            # print(x_position_subset_one_up)
            # print(x_position_subset_one_up_one_right)
            # print(x_position_subset_one_right )
            # print("")
        return x

    def horizontal_angle(x):
        x['horizontal_angle'] = getAngleBetweenPoints(x['x_position'], x['y_position'], x['x_next'], x['y_next'])
        x['center_horizontal_angle']= x['inner_angle_center_atom'] - x['horizontal_angle']
        return x

    if step == "step_5":
        atoms = atoms.apply(four_neighbors, axis=1)
        neighbors = pd.merge(neighbors, atoms,  how='left', left_on=['x_position', 'y_position'], right_on = ['x_position', 'y_position'])
        neighbors = neighbors.apply(upper_neighbors, axis=1)
        neighbors = neighbors.apply(horizontal_angle, axis =1)
        neighbors[['area']] = neighbors[['area']].div(pixels_nanometer**2)
        neighbors[['filtered_area']] = neighbors[['filtered_area']].div(pixels_nanometer**2)

    combined_count = neighbors[['zone', 'zone_plane_horizontal']].value_counts(['zone_plane_horizontal']).reset_index(name='combined count')

    neighbors = pd.merge(neighbors, combined_count, on=['zone_plane_horizontal'], how='left')

    # def filter_area(row):
    #     if row["area"] < (max_dist * 1.5/pixels_nanometer )**2 and (max_dist/pixels_nanometer * .7)**2 < row["area"]:
    #         val = row["area"]

    #     else:
    #         val = None
    #     return val
    # neighbors['filtered_area'] = neighbors.apply(filter_area, axis = 1)

    not_features = set(['center_horizontal_angle',  'filtered_arrow_x', 'filtered_arrow_y', 'zone_plane_horizontal', 'sublattice_df', 'plane_position_df', ('zone', 'count'), 'horizontal_angle', 'sublattice_atom', 'coords', 'zone', 'zone_horizontal', 'plane',  'x_position', 'y_position', 'x_prev', 'y_prev', 'x_next', 'y_next',  'sigma_x', 'sigma_y',  'rotation_ellipticity',  'neighbor_1x', 'neighbor_2x', 'neighbor_3x', 'neighbor_4x', 'neighbor_1y', 'neighbor_2y', 'neighbor_3y', 'neighbor_4y',  'center_neighborsx', 'center_neighborsy',  'x_dist_center_atom', 'y_dist_center_atom',  'arrow_x', 'arrow_y',  'filtered_x_position', 'filtered_y_position', 'distance_next', 'ratio_aspect', 'inner_angle_center_atom', 'magnitude', 'area', 'distance_prev', "neighbor_1x_zero", "neighbor_2x_zero", "neighbor_3x_zero", "neighbor_4x_zero", "neighbor_1y_zero", "neighbor_2y_zero", "neighbor_3y_zero", "neighbor_4y_zero"
         ])

    #do_not_pixels_nanometer = set(['center_horizontal_angle',  'area', 'filtered_area', 'zone_plane_horizontal', 'sublattice_df', 'plane_position_df', ('zone', 'count'), 'ellipticity', 'rotation_ellipticity', 'horizontal_angle', 'sublattice_atom', 'ratio_aspect', 'filtered_ratio_aspect', 'filtered_inner_angle_center_atom', 'inner_angle_center_atom', 'coords', 'zone', 'zone_horizontal', 'plane',  'rotation_ellipticity', 'center_horizontal_angle', "('zone', 'count')"])
    do_not_pixels_nanometer = set(['center_horizontal_angle',  'area', 'filtered_area', 'zone_plane_horizontal', 'sublattice_df', 'zone', 'zone_plane_orig', 'plane_position_df', ('zone', 'count'), 'ellipticity', 'rotation_ellipticity', 'horizontal_angle', 'sublattice_atom', 'ratio_aspect', 'filtered_ratio_aspect', 'filtered_inner_angle_center_atom', 'inner_angle_center_atom', 'coords', 'zone', 'zone_horizontal', 'zone', 'plane',  'rotation_ellipticity', 'center_horizontal_angle', "('zone', 'count')", "intensity", "new_column"])

    all_columns = set(neighbors.columns)

    features = neighbors.filter(regex='^filtered',axis=1).columns
    features = list(set(features) - set(['filtered_arrow_x', 'filtered_arrow_y']))
    features.extend(['dist_from_avg_line', 'ind_dist_from_avg_line', 'dist_hori', 'dist_vert', 'distance_next'])
    pixels_nanometer_features = list( all_columns - do_not_pixels_nanometer )

    neighbors[pixels_nanometer_features] = neighbors[pixels_nanometer_features].div(pixels_nanometer)

    neighbors.to_csv("app/static/data_json/neighbors_test.csv")

    return features, list_sublattice_a
