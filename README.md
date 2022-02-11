What is TEMWizard?
==================

TEMWizard is used to visualize intermediate and final results from Atomap, an open-source software tool for determining the position and other features of atomic columns in transmission electron microscopy (TEM) images. TEMWizard provides an easy-to-use graphical user interface (GUI) for Atomap, allowing the user to provide correct inputs and visualize lattice displacements for analysis of phenomena such as octahedral rotations or bond distortions. It is built atop Python and D3, using  the Atomap library integrated ih Flask, a Python web framework.

To learn more about <b>Atomap</b> see the following:

* Nord, M., Vullum, P. E., MacLaren, I., Tybell, T., & Holmestad, R. (2017). Atomap: a new software tool for the automated analysis of atomic resolution images using two-dimensional Gaussian fitting. Advanced Structural and chemical imaging, 3(1), 1-12.

* Visit the Atomap webppage https://atomap.org/

This code was developed under support by the U.S. Department of Energy (DOE), Office of Science, Office of Basic Energy Sciences, Division of Materials Sciences and Engineering under Award #10122. 

How to Use TEMWizard
======================

Screenshots

Installation
======================

1. Download or clone the repository

2. Open Terminal

3. cd to the folder "flask" within temwizard (example below, you can type cd in Terminal and then drag the flask folder to the terminal to quickly get the address)

`cd ...temwizard/flask`

4. create virtual environment

`python -m venv venv`

5. activate virtual environment 

(mac)

`source venv/bin/activate`

(windows)

`venv\Scripts\activate`

6. Install all necessary packages

`pip install -r requirements.txt`

7. run flask

`flask run`

8. Go to local address

`http://127.0.0.1:5000`

9. Select atom by clicking on the center dot. The other atoms will be filtered out depending on if their values fall within the ranges indicated on the left. Click again of the dot to reset

 How to Cite TEMWizard
 ======================

  If you find this application useful and want to publish your results, please cite our repository.

 Contact Information
 ======================

 For questions about TEMWizard usage, contact Marjolein Oostrom (marjolein.oostrom@pnnl.gov) or Steven Spurgeon (steven.spurgeon@pnnl.gov).

 Acknowledgments
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

Usage License
======================
TEMWizard
Copyright © 2022, Battelle Memorial Institute

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
