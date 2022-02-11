
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

from scipy import spatial
import numpy as np
import math
from statistics import mean
import cv2


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

    #smooth out intensity
    if pre_process == True:
        img = cv2.imread(image, 0)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl_img = clahe.apply(img)
        cv2.imwrite("app/static/images/" + name +  "_processed." + ext, cl_img)
        x=Image.open("app/static/images/" + name +  "_processed." + ext, 'r')
    else:
        x=Image.open(image, 'r')

    #convert to image that can be process in automap
    x=x.convert('L') #makes it greypixels_nanometer
    x=np.asarray(x.getdata(),dtype=np.float64).reshape((x.size[1],x.size[0]))
    x=np.asarray(x,dtype=np.uint8)

    x=Image.fromarray(x, mode='L')
    x.save("app/static/images/" + name +  "_processed." + ext)

    return "static/images/" + name +  "_processed." + ext
