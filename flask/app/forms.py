from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, FloatField, IntegerField
from wtforms.validators import DataRequired

class FirstSublattice(FlaskForm):
    scale_image = FloatField("2. Scale Image", default=1)
    pixels_nanometer = FloatField("3. Pixels per nanometer", default=1) #90 #218.365
    max_dist = FloatField("4. Half the distance between the most intense atoms", default=45) #.19 #.24
    plane_first_sublattice = IntegerField("5. The second sublattice is on the line between which zone", default=2, description = "Indicate with the plane order (first is 0)")
    plane_second_sublattice = IntegerField("6. The third sublattice is on the line between which zone", default=2, description = "Indicate with the plane order (first is 0)")
    submit = SubmitField('Rerun Atomap on Current Page')
#max_dist image scale_image pixels_nanometer
class ViewImageForm(FlaskForm):
    scale_image = FloatField("Scale Image", default=1, id = "scale_image")
    pixels_nanometer = IntegerField("Pixels per nanometer", default=1, id = "pixels_nanometer")
    max_dist = FloatField("Approximately half the distance between the most intense atoms in the structure (used to calculate atom position) in nanometers", default=30, id = "max_dist")
