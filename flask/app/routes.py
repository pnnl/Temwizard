from flask import render_template,  url_for, Flask, render_template, request, jsonify, session, send_file
from app import app
from app.forms import FirstSublattice, ViewImageForm
import os, pdb, math, json, time
from csv_to_json import process_image, csv_to_json2
import pandas as pd
import ast
import re
import hyperspy.api as hs
import atomap.api as am
from os import path
from PIL import Image
import cv2
from flask_session import Session

from flask import Flask, render_template, request
from werkzeug.utils import secure_filename


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response


@app.route('/download/<filename>')
def download(filename):
    #For windows you need to use drive name [ex: F:/Example.pdf]
    path = "static/data_json/neighbors_test.csv"
    return send_file(path, as_attachment=True)

@app.route('/')
def upload_file():
   return render_template('upload.html')

@app.route('/process_image', methods=['GET', 'POST'])
def view_image():
    form = ViewImageForm()
    if request.method == 'POST':
      f = request.files['file']
      f.save(os.path.join(app.config['UPLOAD_FOLDER'], f.filename))
      print(os.path.join(app.config['UPLOAD_FOLDER'], f.filename))
    session['file'] = f.filename
    scale_image = form.scale_image.data
    pixels_nanometer = float(form.pixels_nanometer.data)

    s=hs.load(os.path.join(app.static_folder, "images/", session.get('file')))
    image = {'image': "static/images/" + session.get('file')}
    if  s.data.shape[1] > 800:
        form.scale_image.data = .5
        scale_image = .5
    data = {'height': s.data.shape[0], 'width' : s.data.shape[1], 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}
    return render_template('chart_view_image.html', data = data, form=form, image = image)

@app.route('/first_sublattice', methods=['GET', 'POST'])
def first_sublattice():
    form = FirstSublattice()
    if request.method == 'GET':
        form.max_dist.data = float(request.args.get('max_dist'))
        form.scale_image.data = float(request.args.get('scale_image'))
        form.pixels_nanometer.data = float(request.args.get('pixels_nanometer'))

    #get data from form
    image_string = session.get('file')
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

    s=hs.load(os.path.join(app.config['UPLOAD_FOLDER'], image_string))
    image = {'image': "static/images/" + image_string}

    # create the data that the viz uses
    feature, list_sublattice_a = csv_to_json2(image_string, max_dist, plane_first_sublattice, plane_second_sublattice, pixels_nanometer, step = "step_1")

    neighbors = pd.read_csv(os.path.join(app.static_folder, 'data_json/neighbors_test.csv'), engine='python')

    tables = {}
    #have the options only be the planes available for sublattices 0 and 1
    tables["all_zones"] = neighbors['combined'].drop_duplicates().tolist()
    tables["all_sublattices"] = neighbors['sublattice_df'].drop_duplicates().tolist()

    neighbors_json = json.loads(neighbors.to_json(orient='records'))

    data ={'dim': {'height': s.data.shape[0], 'width' : s.data.shape[1], 'separation': max_dist, 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}, 'neighbors': neighbors_json, 'feature': feature}

    return render_template('chart_first_sublattice.html', data = data, form=form, tables =tables, image =  image, list_sublattice_a = str(list_sublattice_a))


@app.route('/second_sublattice/', methods=['GET', 'POST'])
def second_sublattice():
    form = FirstSublattice()
    #max_dist image scale_image pixels_nanometer
    if request.method == 'GET':
        form.max_dist.data = float(request.args.get('max_dist'))

        form.scale_image.data = float(request.args.get('scale_image'))
        form.pixels_nanometer.data = float(request.args.get('pixels_nanometer'))
        # form.process()

    image_string = session.get('file')

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

    neighbors = pd.read_csv(os.path.join(app.static_folder, 'data_json/neighbors_test.csv'), engine='python')

    list_sublattice_a = [str(x) for x in list_sublattice_a]
    tables = {}
    #have the options only be the planes available for sublattices 0 and 1
    tables["all_zones"] = list_sublattice_a
    tables["all_sublattices"] = neighbors['sublattice_df'].drop_duplicates().tolist()

    neighbors_json = json.loads(neighbors.to_json(orient='records'))


    data ={'dim': {'height': s.data.shape[0], 'width' : s.data.shape[1], 'separation': max_dist, 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}, 'neighbors': neighbors_json, 'feature': feature}

    return render_template('chart_second_sublattice.html', data = data, form=form, tables =tables, image =  image, list_sublattice_a = str(list_sublattice_a))


@app.route('/third_sublattice/', methods=['GET', 'POST'])
def third_sublattice():
    form = FirstSublattice()
    #max_dist image scale_image pixels_nanometer

    if request.method == 'GET':
        form.scale_image.data = float(request.args.get('scale_image'))
        form.pixels_nanometer.data = float(request.args.get('pixels_nanometer'))
        form.max_dist.data = float(request.args.get('max_dist'))
        form.plane_first_sublattice.data = int(request.args.get('plane_first_sublattice'))
        form.plane_second_sublattice.data = int(request.args.get('plane_second_sublattice'))
        # form.process()

    image_string = session.get('file')
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

    neighbors = pd.read_csv(os.path.join(app.static_folder, 'data_json/neighbors_test.csv'), engine='python')

    list_sublattice_a = [str(x) for x in list_sublattice_a]
    tables = {}
    #have the options only be the planes available for sublattices 0 and 1
    tables["all_zones"] = list_sublattice_a
    tables["all_sublattices"] = neighbors['sublattice_df'].drop_duplicates().tolist()

    neighbors_json = json.loads(neighbors.to_json(orient='records'))

    data ={'dim': {'height': s.data.shape[0], 'width' : s.data.shape[1], 'separation': max_dist, 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}, 'neighbors': neighbors_json, 'feature': feature}

    return render_template('chart_third_sublattice.html', data = data, form=form, tables =tables, image =  image, list_sublattice_a = str(list_sublattice_a))


@app.route('/fourth_sublattice/', methods=['GET', 'POST'])
def fourth_sublattice():
    form = FirstSublattice()
    #max_dist image scale_image pixels_nanometer

    if request.method == 'GET':
        form.scale_image.data = float(request.args.get('scale_image'))
        form.pixels_nanometer.data = float(request.args.get('pixels_nanometer'))
        form.max_dist.data = float(request.args.get('max_dist'))
        form.plane_first_sublattice.data = int(request.args.get('plane_first_sublattice'))
        form.plane_second_sublattice.data = int(request.args.get('plane_second_sublattice'))
        # form.process()

    image_string = session.get('file')
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

    neighbors = pd.read_csv(os.path.join(app.static_folder, 'data_json/neighbors_test.csv'), engine='python')

    tables = {}

    list_sublattice_a = [str(x) for x in list_sublattice_a]
    #have the options only be the planes available for sublattices 0 and 1
    tables["all_zones"] = list_sublattice_a
    tables["all_sublattices"] = neighbors['sublattice_df'].drop_duplicates().tolist()

    neighbors_json = json.loads(neighbors.to_json(orient='records'))

    data ={'dim': {'height': s.data.shape[0], 'width' : s.data.shape[1], 'separation': max_dist, 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}, 'neighbors': neighbors_json, 'feature': feature}

    return render_template('chart_fourth_sublattice.html', data = data, form=form, tables =tables, image =  image, list_sublattice_a = str(list_sublattice_a))


@app.route('/fifth_sublattice/', methods=['GET', 'POST'])
def fifth_sublattice():
    form = FirstSublattice()
    #max_dist image scale_image pixels_nanometer

    if request.method == 'GET':
        form.scale_image.data = float(request.args.get('scale_image'))
        form.pixels_nanometer.data = float(request.args.get('pixels_nanometer'))
        form.max_dist.data = float(request.args.get('max_dist'))
        form.plane_first_sublattice.data = int(request.args.get('plane_first_sublattice'))
        form.plane_second_sublattice.data = int(request.args.get('plane_second_sublattice'))
        # form.process()

    image_string = session.get('file')
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

    feature, list_sublattice_a = csv_to_json2(image_string, max_dist, plane_first_sublattice, plane_second_sublattice, pixels_nanometer, step = "step_5")
    neighbors = pd.read_csv(os.path.join(app.static_folder, 'data_json/neighbors_test.csv'), engine='python')

    tables = {}
    #have the options only be the planes available for sublattices 0 and 1
    tables["all_zones"] = neighbors['combined'].drop_duplicates().tolist()
    tables["all_sublattices"] = neighbors['sublattice_df'].drop_duplicates().tolist()

    neighbors_json = json.loads(neighbors.to_json(orient='records'))

    data ={'dim': {'height': s.data.shape[0], 'width' : s.data.shape[1], 'separation': max_dist, 'scale_image': scale_image, 'pixels_nanometer': pixels_nanometer}, 'neighbors': neighbors_json, 'feature': feature}

    return render_template('chart_last.html', data = data, form=form, tables =tables, image =  image, list_sublattice_a = str(list_sublattice_a))
