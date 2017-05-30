# Installing on a website
#### Preinstallation
To get eye tracking working on your website properly you must first make sure that your website is a secure site(i.e. ‘https’). This is because we will be accessing your users built in webcams, with their permission, requiring a higher level of security that an ‘http’ site can provide.

#### Installation
**Frontend Installation**
This portion of the user manual will describe how to get the eye tracking functioning on your website.
**File Structure and Paths**
	First you must place our files, found on the git repository, into the directory that contains your HTML files used in your website. The files you will need for the frontend are ‘index.html’, ‘jtec.js’, ‘jtec.css’, and ‘JTECServer.js’. You will notice that we provide a file called ‘index.html’. This file will be the first file loaded when someone navigates to your site. You may already have a file called ‘index.html’ in which case you will have to rename this file and make sure that all links to your original ‘index.html’ file have been changed to its new file name. For the remainder of the user manual we will refer to your original ‘index.html’ file as ‘main.html’.

	In our ‘index.html’ file there is some important information you will need to alter to successfully install the software. Namely you will have to change the final three lines in the body of the html file ‘index.html’(i.e. The last three lines before the </body> tag). On the first of these three lines you have to change the src to be the path to the file ‘JTECServer.js’(i.e. src= “./path/to/JTECServer.js”). On the second line you must do the same thing but change the src to be the path to the file ‘jtec.js’. On the third line you will also do the same thing; however, the path will be to your ‘main.html’ file. After this you will also want to check that the path to ‘jtec.css’ is correct in the head of ‘index.html’.
**Important Variables**
	For this portion of the eye tracking system there are some important variables you may want to know about and/or change to fit your needs. All of these variables can be found in the file ‘jtec.js’ at the end of the file:

    1.VALIDATION_RATE
        This variable dictates how long in milliseconds the software will wait to start the next validation i.e. 60000 is equivalent to 1 minute between each validation

    2.SIZE_OF_CIRCLE
        This variable is the radius of the circle in pixels used during validation to determine the accuracy of the data being collected. The larger the value given to this variable the more leeway you give the system in calculating the accuracy percentage.
    3.ACCURACY
        This variable is what percent accuracy you will tolerate for data to be called valid. If the system calculates the percent accuracy(with your set SIZE_OF_CIRCLE) to be greater than ACCURACY than the data collected since the last validation period will be declared valid.
# Backend Installation
