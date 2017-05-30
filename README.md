# Webcam Eye Tracking
## JTEC

## Client: Dr. Even Peck
## Teammates: John Simmons, Terence McHugh, Elias Strizower, Chris Shadek


# Installing on a website
#### Pre-installation
To get eye tracking working on your website properly you must first make sure that your website is a secure site (i.e. ‘https’). This is because we will be accessing your users built in webcams, with their permission, requiring a higher level of security that an ‘http’ site can provide. 

#### Installation
**Frontend Installation**

This portion of the user manual will describe how to get the eye tracking functioning on your website. 

**File Structure and Paths**

First you must place our files, found on the Git repository, into the directory that contains your HTML files used in your website. The files you will need for the frontend are ‘index.html’, ‘jtec.js’, ‘jtec.css’, and ‘JTECServer.js’. You will notice that we provide a file called ‘index.html’. This file will be the first file loaded when someone navigates to your site. You may already have a file called ‘index.html’ in which case you will have to rename this file and make sure that all links to your original ‘index.html’ file have been changed to its new file name. For the remainder of the user manual we will refer to your original ‘index.html’ file as ‘main.html’. 
In our ‘index.html’ file there is some important information you will need to alter to successfully install the software. Namely you will have to change the final three lines 
in the body of the html file ‘index.html’(i.e. The last three lines before the < /body > tag). On the first of these three lines you have to change the src to be the path to the file ‘JTECServer.js’(i.e. src= “./path/to/JTECServer.js”). On the second line you must do the same thing but change the src to be the path to the file ‘jtec.js’. On the third line you will also do the same thing; however, the path will be to your ‘main.html’ file. After this you will also want to check that the path to ‘jtec.css’ is correct in the head of ‘index.html’.
	
**Important Variables**

For this portion of the eye tracking system there are some important variables you may want to know about and/or change to fit your needs. All of these variables can be found in the file ‘jtec.js’ at the end of the file:

1. VALIDATION_RATE

    This variable dictates how long in milliseconds the software will wait to start the next validation i.e. 60000 is equivalent to 1 minute between each validation
    
2. SIZE_OF_CIRCLE

    This variable is the radius of the circle in pixels used during validation to determine the accuracy of the data being collected. The larger the value given to this variable the more leeway you give the system in calculating the accuracy percentage.
    
3. ACCURACY

    This variable is what percent accuracy you will tolerate for data to be called valid. If the system calculates the percent accuracy (with your set SIZE_OF_CIRCLE) to be greater than ACCURACY than the data collected since the last validation period will be declared valid.
        
# Backend Installation

Please read through the following documentation to get a better understanding about the Parse Server Platform before proceeding.

1.  [Parse Server](https://github.com/parse-community/parse-server)
2.  [Parse Server Guide](http://docs.parseplatform.org/parse-server/guide/)
3.  [Parse Server Example Guide](Example]https://github.com/parse-community/parse-server-example)
4.  [Parse JavaScript Guide](http://docs.parseplatform.org/js/guide/)
5.  [Other Helpful Links](https://github.com/parse-community/parse-server/wiki)

#### Setting up Your Database

Setting up the database is a relatively simple process.  Our server requires that you have a MongoDB database, so you have a few options listed below.  Follow each hosting service’s setup tutorials and you will have a working database.  We elected to use MLab in our setup because it was easy to setup and widely used.  Generally, any system running MongoDB is acceptable, so you can also host it locally.  Please refer to any corresponding documentation on that company’s website.

1.	mLab 
2.	Objectrocket 
3.	MongoDB Atlas
4.	MongoHQ

You may find it helpful to read the Official Parse Server Setup Guide:  https://github.com/parse-community/parse-server 

If you choose mLab, do the following:

1.	Go to the mLab website and create an account
2.	After activating your account, click the Create New button
3.	You may choose any setup based on your requirements
    a.	We chose the single node sandbox hosted on AWS
4.	After creating the new database, click on it
5.	Add a database user under the users column by clicking on the Add database user button
6.	If you look at the top of the screen, you will see your data base URI.  It will look like “mongodb://<dbuser>:<dbpassword>@ds127731.mlab.com:27731/<dbname>”

    a.	You will need this later
    
    b.	The dbuser and dbpassword refer to your newly created user

If you choose to use a MongoDB host other than mLab, there are many great tutorials available with a quick search on Google.

#### Setting up Your Server

First you will need to setup you JTEC server locally.  This is a very simple and straightforward process.  The step will be to locate the GitLab Repository: JTEC. 

You can either clone or download this repository.  Once the repository is on your computer, your will need to do the following.

1.	Install Homebrew
`$ /usr/bin/ruby -e "$(curl –fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)`

2.	Install Node (v4.3 or newer)
`$ brew install node`

Now you have everything you need to run the JTEC Parse Server locally with your remotely hosted database.

Configuring Your Local Server

1.	In the JTEC repository you cloned, navigate to the Backend folder and open the JTEC Parse Server directory
2.	Open the index.js file in a text editor
3.	Edit the line with the database URI and replace the text with the URI for your database
4.	You may also choose to change the App ID and Masterkey

Open your terminal and navigate into the JTEC Parse Server folder.  If you are running the server for the first time, type `npm install`.  This will install any dependencies you need on your server.  Now run your server locally by typing `npm start` into the terminal.  If all goes well, you will have the server running locally.

Refer to the Official Parse Server Documentation for hosting your server remotely.

