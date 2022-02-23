from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, FloatField, IntegerField
from wtforms.validators import DataRequired

from flask_wtf import FlaskForm
from wtforms import SelectField, StringField, SelectMultipleField, SubmitField, DateField, TextField, FormField, BooleanField, SelectMultipleField, DateTimeField
from wtforms.validators import DataRequired, InputRequired, ValidationError
from datetime import date, timedelta
import datetime

# class LoginForm(FlaskForm):
#     username = StringField('Username', validators=[DataRequired()])
#     password = PasswordField('Password', validators=[DataRequired()])
#     remember_me = BooleanField('Remember Me')
#     submit = SubmitField('Sign In')

#
# class OptionsForm1(FlaskForm):
#     image=StringField("Image Name", default="ABF_Inverted_No_Scale.jpg")
#     max_dist = FloatField("Approximately half the distance between the most intense atoms in the structure (used to calculate atom position) in nanometers", default=30)
#     scale_image = FloatField("Scale Image", default=1)
#
#     submit = SubmitField('Update Plot')


class FirstSublattice(FlaskForm):
    #max_dist image scale_image pixels_nanometer
    image = StringField("1. Image Name", default="adf1.jpg")
    scale_image = FloatField("2. Scale Image", default=1)
    pixels_nanometer = FloatField("3. Pixels per nanometer", default=1) #90 #218.365
    max_dist = FloatField("4. Half the distance between the most intense atoms", default=45) #.19 #.24
    plane_first_sublattice = IntegerField("5. The second sublattice is on the line between which zone", default=2, description = "Indicate with the plane order (first is 0)")
    plane_second_sublattice = IntegerField("6. The third sublattice is on the line between which zone", default=2, description = "Indicate with the plane order (first is 0)")
    #replace_hdf5 = BooleanField("Recreate the hdf5 file", default =  True)
    submit = SubmitField('Rerun Atomap on Current Page')
#
# #max_dist image scale_image pixels_nanometer
# class ViewImageForm(FlaskForm):
#     image=StringField("Image Name", default="ABF_Inverted_No_Scale.jpg", id = "image")
#     scale_image = FloatField("Scale Image", default=1, id = "scale_image")
#     pixels_nanometer = IntegerField("Pixels per nanometer", default=1, id = "pixels_nanometer")
#     max_dist = FloatField("Approximately half the distance between the most intense atoms in the structure (used to calculate atom position) in nanometers", default=30, id = "max_dist")
#     pre_process = BooleanField("Even out intensity in image", default = False)
#
#     submit1 = SubmitField('Update Plot')
