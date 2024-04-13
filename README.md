Acknowledgments/Disclaimer
======================

This work is supported by the U.S. Department of Energy (DOE), Office of Science, Office of Basic Energy Sciences, Division of Materials Sciences and Engineering under Award #10122 at Pacific Northwest National Laboratory (PNNL). PNNL is a multiprogram national laboratory operated for the U.S. Department of Energy (DOE) by Battelle Memorial Institute under Contract No. DE-AC05-76RL0-1830.

This material was prepared as an account of work sponsored by an agency of the United States Government.  Neither the United States Government nor the United States Department of Energy, nor Battelle, nor any of their employees, nor any jurisdiction or organization that has cooperated in the development of these materials, makes any warranty, express or implied, or assumes any legal liability or responsibility for the accuracy, completeness, or usefulness or any information, apparatus, product, software, or process disclosed, or represents that its use would not infringe privately owned rights.

Reference herein to any specific commercial product, process, or service by trade name, trademark, manufacturer, or otherwise does not necessarily constitute or imply its endorsement, recommendation, or favoring by the United States Government or any agency thereof, or Battelle Memorial Institute. The views and opinions of authors expressed herein do not necessarily state or reflect those of the United States Government or any agency thereof.

PACIFIC NORTHWEST NATIONAL LABORATORY
operated by
BATTELLE
for the
UNITED STATES DEPARTMENT OF ENERGY
under Contract DE-AC05-76RL01830

What is TEMWizard?
==================

TEMWizard is used to visualize intermediate and final results from Atomap, an open-source software tool for determining the position and other features of atomic columns in transmission electron microscopy (TEM) images. TEMWizard provides an easy-to-use graphical user interface (GUI) for Atomap, allowing the user to provide correct inputs and visualize lattice displacements for analysis of phenomena such as octahedral rotations or bond distortions. It is built atop Python and D3, using  the Atomap library integrated in Flask, a Python web framework.

To learn more about Atomap see the following:

* Nord, M., Vullum, P. E., MacLaren, I., Tybell, T., & Holmestad, R. (2017). Atomap: a new software tool for the automated analysis of atomic resolution images using two-dimensional Gaussian fitting. Advanced Structural and chemical imaging, 3(1), 1-12.

* Visit the Atomap webppage https://atomap.org/

This code was developed under support by the U.S. Department of Energy (DOE), Office of Science, Office of Basic Energy Sciences, Division of Materials Sciences and Engineering under Award #10122. 

How to Use TEMWizard
======================

1. Update filename and click "Rerun Atomap on current page" to reload
<p align="center">

<img src="https://raw.githubusercontent.com/pnnl/Temwizard/master/flask/app/static/doc/images/screenshot_1.png" width="300">
</p>
2. Click on image to get pixel distance between atoms. Update half this value to "Half the distance between most intense atoms" and run "Rerun Atomap on current page". Try new values until the atoms in the most intense sublattice are identified. 
<p align="center">
<img src="https://raw.githubusercontent.com/pnnl/Temwizard/master/flask/app/static/doc/images/screenshot_2.png" width="300">
</p>
3. Click "Proceed to Step 2"
<p align="center">
<img src="https://raw.githubusercontent.com/pnnl/Temwizard/master/flask/app/static/doc/images/screenshot_3.png" width="300">
</p>
4. Select the zones in the first sublattice the 2nd sublattice is between. Use "Select Zones to View" to see the order identifying the zones in the first sublattice. Click "Proceed to Step 3" if you are happy with the second sublattice.
<p align="center">
<img src="https://raw.githubusercontent.com/pnnl/Temwizard/master/flask/app/static/doc/images/screenshot_4.png" width="700">
</p>
5. If there is no third sublattice, click "View full results". Otherwise repeat step 4. 
<p align="center">
<img src="https://raw.githubusercontent.com/pnnl/Temwizard/master/flask/app/static/doc/images/screenshot_5.png" width="700">
</p>
6. In full results, select features for the y axis of the graph and select zones for the x axis of the graph. The zones will also change which sublattice is outlines in the graph. 
<p align="center">
<img src="https://raw.githubusercontent.com/pnnl/Temwizard/master/flask/app/static/doc/images/screenshot_7.png" width="700">
</p>


Installation
======================

1. Download or clone the repository

2. Open Terminal

3. cd to the folder "flask" within temwizard (example below, you can type cd in Terminal and then drag the flask folder to the terminal to quickly get the address)

`cd flask`

4. create virtual environment

`conda create -n temwizard_env python=3.7 `

5. activate virtual environment 

`conda activate temwizard_env`

6. Install all necessary packages

`pip install -r requirements.txt`

7. run flask

`flask run`

8. Go to local address

`http://127.0.0.1:5000`

9. Follow directions under "How to use TemWizard"

 How to Cite TEMWizard
 ======================

  If you find this application useful and want to publish your results, please cite our publication:
  
Wang, L., Zhao, J., Kuo, C-T., Matthews, B.E., Oostrom, M.T., Spurgeon, S.R., Bowden, M.E., Lee, S-J., Lee, J-S., Guo, E-J., Wang, J., Chambers, S.A., and Y. Du. “Synthesis and electronic properties of epitaxial SrNiO3/SrTiO3 superlattices.” Physical Review Materials. (2022). https://doi.org/10.1103/PhysRevMaterials.6.075006

 Contact Information
 ======================

 For questions about TEMWizard usage, contact Marjolein Oostrom (marjolein.oostrom@pnnl.gov) or Steven Spurgeon (steven.spurgeon@pnnl.gov).


Usage License
======================
TEMWizard
Copyright © 2022, Battelle Memorial Institute

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
