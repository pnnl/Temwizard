from flask import render_template,  url_for, Flask, render_template, request, jsonify
from app import app
from app.forms import FirstSublattice
from config import *
import os, pdb, math, json, time
from csv_to_json import process_image, csv_to_json2
#from initial_sublattice import first_sublattice_hdf5
import pandas as pd
import ast
import re
import hyperspy.api as hs
import atomap.api as am
from os import path
from PIL import Image
import os
import cv2
from werkzeug import secure_filename

@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response



@app.route('/process_image', methods=['GET', 'POST'])
def view_image():

    form = ViewImageForm()

    image_string = form.image.data
    pre_process = form.pre_process.data
    scale_image = form.scale_image.data
    pixels_nanometer = float(form.pixels_nanometer.data)

    s=hs.load(os.path.join(app.static_folder, "images/", image_string))

    data = {'height': s.data.shape[0], 'width' : s.data.shape[1], 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}
    image_name = process_image(image_string, pixels_nanometer, pre_process)

    image = {'image': image_name}
    return render_template('chart_view_image.html', data = data, form=form, image = image)

@app.route('/', methods=['GET', 'POST'])
def first_sublattice():
    form = FirstSublattice()

    #get data from form
    image_string = form.image.data
    plane_first_sublattice = form.plane_first_sublattice.data
    plane_second_sublattice = form.plane_second_sublattice.data
    max_dist = form.max_dist.data
    max_dist = float(max_dist)
    scale_image = form.scale_image.data
    pixels_nanometer = float(form.pixels_nanometer.data)
    max_dist = max_dist*pixels_nanometer

    name = image_string.split('.')[0]
    ext = image_string.split('.')[1]
    image_string = name +  "." + ext

    s=hs.load(os.path.join(app.static_folder, "images/", image_string))
    image = {'image': "static/images/" + image_string}

    # create the data that the viz uses
    feature, list_sublattice_a = csv_to_json2(image_string, max_dist, plane_first_sublattice, plane_second_sublattice, pixels_nanometer, step = "step_1")
    monolayer= pd.read_csv(os.path.join(app.static_folder, 'data_json/monolayer_test.csv'))
    neighbors = pd.read_csv(os.path.join(app.static_folder, 'data_json/neighbors_test.csv'), engine='python')
    print(list_sublattice_a)
    tables = {}
    #have the options only be the planes available for sublattices 0 and 1
    tables["all_zones"] = neighbors['combined'].drop_duplicates().tolist()
    tables["all_sublattices"] = neighbors['sublattice_df'].drop_duplicates().tolist()


    neighbors_json = json.loads(neighbors.to_json(orient='records'))
    monolayer_json = json.loads(monolayer.to_json(orient='records'))

    data ={'dim': {'height': s.data.shape[0], 'width' : s.data.shape[1], 'separation': max_dist, 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}, 'neighbors': neighbors_json, 'monolayer': monolayer_json, 'feature': feature}

    return render_template('chart_first_sublattice.html', data = data, form=form, tables =tables, image =  image, list_sublattice_a = str(list_sublattice_a))


@app.route('/second_sublattice/', methods=['GET', 'POST'])
def second_sublattice():
    form = FirstSublattice()
    #max_dist image scale_image pixels_nanometer
    if request.method == 'GET':
        form.max_dist.data = float(request.args.get('max_dist'))

        form.scale_image.data = float(request.args.get('scale_image'))
        form.pixels_nanometer.data = float(request.args.get('pixels_nanometer'))
        form.image.data = str(request.args.get('image'))
        # form.process()

    image_string = form.image.data

    plane_first_sublattice = form.plane_first_sublattice.data
    plane_second_sublattice = form.plane_second_sublattice.data
    max_dist = form.max_dist.data
    max_dist = float(max_dist)
    scale_image = form.scale_image.data
    pixels_nanometer = float(form.pixels_nanometer.data)
    max_dist = max_dist*pixels_nanometer

    name = image_string.split('.')[0]
    ext = image_string.split('.')[1]
    image_string = name +  "." + ext

    s=hs.load(os.path.join(app.static_folder, "images/", image_string))
    image = {'image': "static/images/" + image_string}

    feature, list_sublattice_a = csv_to_json2(image_string, max_dist, plane_first_sublattice, plane_second_sublattice, pixels_nanometer, step = "step_2")
    monolayer= pd.read_csv(os.path.join(app.static_folder, 'data_json/monolayer_test.csv'))
    neighbors = pd.read_csv(os.path.join(app.static_folder, 'data_json/neighbors_test.csv'), engine='python')
    print(list_sublattice_a)
    list_sublattice_a = [str(x) for x in list_sublattice_a]
    tables = {}
    #have the options only be the planes available for sublattices 0 and 1
    tables["all_zones"] = list_sublattice_a
    tables["all_sublattices"] = neighbors['sublattice_df'].drop_duplicates().tolist()

    neighbors_json = json.loads(neighbors.to_json(orient='records'))
    monolayer_json = json.loads(monolayer.to_json(orient='records'))

    data ={'dim': {'height': s.data.shape[0], 'width' : s.data.shape[1], 'separation': max_dist, 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}, 'neighbors': neighbors_json, 'monolayer': monolayer_json, 'feature': feature}

    return render_template('chart_second_sublattice.html', data = data, form=form, tables =tables, image =  image, list_sublattice_a = str(list_sublattice_a))


@app.route('/third_sublattice/', methods=['GET', 'POST'])
def third_sublattice():
    form = FirstSublattice()
    #max_dist image scale_image pixels_nanometer

    if request.method == 'GET':
        form.image.data = str(request.args.get('image'))
        form.scale_image.data = float(request.args.get('scale_image'))
        form.pixels_nanometer.data = float(request.args.get('pixels_nanometer'))
        form.max_dist.data = float(request.args.get('max_dist'))
        form.plane_first_sublattice.data = int(request.args.get('plane_first_sublattice'))
        form.plane_second_sublattice.data = int(request.args.get('plane_second_sublattice'))
        # form.process()

    image_string = form.image.data
    plane_first_sublattice = form.plane_first_sublattice.data
    plane_second_sublattice = form.plane_second_sublattice.data
    max_dist = form.max_dist.data
    max_dist = float(max_dist)
    scale_image = form.scale_image.data
    pixels_nanometer = float(form.pixels_nanometer.data)
    max_dist = max_dist*pixels_nanometer

    name = image_string.split('.')[0]
    ext = image_string.split('.')[1]
    image_string = name +  "." + ext

    s=hs.load(os.path.join(app.static_folder, "images/", image_string))
    image = {'image': "static/images/" + image_string}

    feature, list_sublattice_a = csv_to_json2(image_string, max_dist, plane_first_sublattice, plane_second_sublattice, pixels_nanometer, step = "step_3")
    monolayer= pd.read_csv(os.path.join(app.static_folder, 'data_json/monolayer_test.csv'))
    neighbors = pd.read_csv(os.path.join(app.static_folder, 'data_json/neighbors_test.csv'), engine='python')

    list_sublattice_a = [str(x) for x in list_sublattice_a]
    tables = {}
    #have the options only be the planes available for sublattices 0 and 1
    tables["all_zones"] = list_sublattice_a
    tables["all_sublattices"] = neighbors['sublattice_df'].drop_duplicates().tolist()

    neighbors_json = json.loads(neighbors.to_json(orient='records'))
    monolayer_json = json.loads(monolayer.to_json(orient='records'))

    data ={'dim': {'height': s.data.shape[0], 'width' : s.data.shape[1], 'separation': max_dist, 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}, 'neighbors': neighbors_json, 'monolayer': monolayer_json, 'feature': feature}

    return render_template('chart_third_sublattice.html', data = data, form=form, tables =tables, image =  image, list_sublattice_a = str(list_sublattice_a))


@app.route('/fourth_sublattice/', methods=['GET', 'POST'])
def fourth_sublattice():
    form = FirstSublattice()
    #max_dist image scale_image pixels_nanometer

    if request.method == 'GET':
        form.image.data = str(request.args.get('image'))
        form.scale_image.data = float(request.args.get('scale_image'))
        form.pixels_nanometer.data = float(request.args.get('pixels_nanometer'))
        form.max_dist.data = float(request.args.get('max_dist'))
        form.plane_first_sublattice.data = int(request.args.get('plane_first_sublattice'))
        form.plane_second_sublattice.data = int(request.args.get('plane_second_sublattice'))
        # form.process()

    image_string = form.image.data
    plane_first_sublattice = form.plane_first_sublattice.data
    plane_second_sublattice = form.plane_second_sublattice.data
    max_dist = form.max_dist.data
    max_dist = float(max_dist)
    scale_image = form.scale_image.data
    pixels_nanometer = float(form.pixels_nanometer.data)
    max_dist = max_dist*pixels_nanometer

    name = image_string.split('.')[0]
    ext = image_string.split('.')[1]
    image_string = name +  "." + ext

    s=hs.load(os.path.join(app.static_folder, "images/", image_string))
    image = {'image': "static/images/" + image_string}

    feature, list_sublattice_a = csv_to_json2(image_string, max_dist, plane_first_sublattice, plane_second_sublattice, pixels_nanometer, step = "step_4")
    monolayer= pd.read_csv(os.path.join(app.static_folder, 'data_json/monolayer_test.csv'))
    neighbors = pd.read_csv(os.path.join(app.static_folder, 'data_json/neighbors_test.csv'), engine='python')

    tables = {}

    list_sublattice_a = [str(x) for x in list_sublattice_a]
    #have the options only be the planes available for sublattices 0 and 1
    tables["all_zones"] = list_sublattice_a
    tables["all_sublattices"] = neighbors['sublattice_df'].drop_duplicates().tolist()

    neighbors_json = json.loads(neighbors.to_json(orient='records'))
    monolayer_json = json.loads(monolayer.to_json(orient='records'))

    data ={'dim': {'height': s.data.shape[0], 'width' : s.data.shape[1], 'separation': max_dist, 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}, 'neighbors': neighbors_json, 'monolayer': monolayer_json, 'feature': feature}

    return render_template('chart_fourth_sublattice.html', data = data, form=form, tables =tables, image =  image, list_sublattice_a = str(list_sublattice_a))


@app.route('/fifth_sublattice/', methods=['GET', 'POST'])
def fifth_sublattice():
    form = FirstSublattice()
    #max_dist image scale_image pixels_nanometer

    if request.method == 'GET':
        form.image.data = str(request.args.get('image'))
        form.scale_image.data = float(request.args.get('scale_image'))
        form.pixels_nanometer.data = float(request.args.get('pixels_nanometer'))
        form.max_dist.data = float(request.args.get('max_dist'))
        form.plane_first_sublattice.data = int(request.args.get('plane_first_sublattice'))
        form.plane_second_sublattice.data = int(request.args.get('plane_second_sublattice'))
        # form.process()

    image_string = form.image.data
    plane_first_sublattice = form.plane_first_sublattice.data
    plane_second_sublattice = form.plane_second_sublattice.data
    max_dist = form.max_dist.data
    max_dist = float(max_dist)

    scale_image = form.scale_image.data
    pixels_nanometer = float(form.pixels_nanometer.data)
    max_dist = max_dist*pixels_nanometer
    name = image_string.split('.')[0]
    ext = image_string.split('.')[1]
    image_string = name +  "." + ext

    s=hs.load(os.path.join(app.static_folder, "images/", image_string))
    image = {'image': "static/images/" + image_string}
    #
    feature, list_sublattice_a = csv_to_json2(image_string, max_dist, plane_first_sublattice, plane_second_sublattice, pixels_nanometer, step = "step_5")
    monolayer= pd.read_csv(os.path.join(app.static_folder, 'data_json/monolayer_test.csv'))
    neighbors = pd.read_csv(os.path.join(app.static_folder, 'data_json/neighbors_test.csv'), engine='python')

    tables = {}
    #have the options only be the planes available for sublattices 0 and 1
    tables["all_zones"] = neighbors['combined'].drop_duplicates().tolist()
    tables["all_sublattices"] = neighbors['sublattice_df'].drop_duplicates().tolist()

    neighbors_json = json.loads(neighbors.to_json(orient='records'))
    monolayer_json = json.loads(monolayer.to_json(orient='records'))

    data ={'dim': {'height': s.data.shape[0], 'width' : s.data.shape[1], 'separation': max_dist, 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}, 'neighbors': neighbors_json, 'monolayer': monolayer_json, 'feature': feature}

    return render_template('chart_first.html', data = data, form=form, tables =tables, image =  image, list_sublattice_a = str(list_sublattice_a))


@app.route('/processed/<dist>', methods=['GET', 'POST'])
def chart(dist):

    # form = OptionsForm1()
    # print("height")
    # print(dist)
    #
    # #form info
    # image_string = form.image.data
    # plane_first_sublattice = form.plane_first_sublattice.data# # separation = form.separation.data
    # form.max_dist.data = dist
    # max_dist = float(dist)
    # print(max_dist)
    #
    #
    #
    # pre_process = form.pre_process.data
    # subtract_image = form.subtract_image.data
    #
    # scale_image = form.scale_image.data
    # pixels_nanometer = float(form.pixels_nanometer.data)
    #
    # max_dist = max_dist*pixels_nanometer
    # print(max_dist)
    #
    # s=hs.load(os.path.join(app.static_folder, "images/", image_string))
    # image = {'image': "static/images/" + image_string}
    # print("height")
    # print(s.data.shape[0])
    # print("weight")
    # print(s.data.shape[1])
    #
    # feature, list_sublattice_a = csv_to_json2(image_string, max_dist, plane_first_sublattice, plane_second_sublattice, pixels_nanometer, pre_process, subtract_image, step = "step_2")
    #
    #
    # monolayer= pd.read_csv(os.path.join(app.static_folder, 'data_json/monolayer_test.csv'))
    # neighbors = pd.read_csv(os.path.join(app.static_folder, 'data_json/neighbors_test.csv'), engine='python')
    #
    # tables = {}
    # #have the options only be the planes available for sublattices 0 and 1
    # tables["all_zones"] = neighbors['combined'].drop_duplicates().tolist()
    # tables["all_sublattices"] = neighbors['sublattice_df'].drop_duplicates().tolist()
    #
    # neighbors_json = json.loads(neighbors.to_json(orient='records'))
    # monolayer_json = json.loads(monolayer.to_json(orient='records'))
    #
    # data ={'dim': {'height': s.data.shape[0], 'width' : s.data.shape[1], 'separation': max_dist, 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}, 'neighbors': neighbors_json, 'monolayer': monolayer_json, 'feature': feature}
    # print(image)
    # return render_template('chart.html', data = data, form=form, tables =tables, image =  image, list_sublattice_a = str(list_sublattice_a))
    return render_template('base.html', dist = dist)
