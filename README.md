## Synopsis

This is a deployment framework for Webgazer, aiming to allow quick deployment of Webgazer to any websites. 

## Backend Installation

This framework strictly uses Amazon DynamoDB for backend for consistency. To set up the back end, do as follow:
1. Go to *https://aws.amazon.com/* and sign in. Sign up for a new account if you haven't already had one.
2. Log into console. In the console, search for **Amazon Cognito** and go to Amazon Cognito page.
3. Select **Manage Federated Identities**. 
4. Select **Create New Identity Pool"**. 
5. 
    - Enter a name in the **Identity pool name** box. Anything will work here. 
    - **VERY IMPORTANT**. Check the **Enable access to unauthenticated identities** box.
    - Select **Create pool**. 
6. Select **Allow**. 
7. In the **Platform** dropdown selection, choose Javascript. It will show example code for Javascript. In the first code box, under *Get AWS Credentials*, There is a line with 
**IdentityPoolId**. It will look something like *'us-east-2:6f89cc95-78a6-4d78-9ec1-4eb5fab8b86f'*. Replace the value of var *IdentityPoolId* in gaze_config.js with the id. 
8. Go to **https://console.aws.amazon.com/iam/home#/roles**. Or alternatively, you can go to AWS console and search for **IAM**, go to IAM page, then click on **roles**, which is located on the left dashboard.
9. In the list of roles on the right, select **Cognito_**"yourappname"****Unauth**_Role**.  *yourappname* is what you entered in the *identity pool name* box above. 
10. Select **Create role policy**.
11. The selection **Policy Generator** is already selected. Select **Select**. 
12. 
    - In the dropdown **AWS Service**, choose **Amazon DynamoDB**.
    - In the dropdown **Actions**, Check the following boxes: *BatchWriteItem*, *CreateTable*, *GetItems*, *PutItems*, *UpdateItems*. 
    - In the box **Amazon Resource Name**, enter *.
    - Select **Add Statement**. 
13. Select **Next Step**. 
14. Select **Apply policy**.
15. It will go back to the policy page. Find the line **Role ARN** at the top of the page, and copy the information there, which looks something like **arn:aws:iam::345518382834:role/Cognito_whateverUnauth_Role**. Replace the value of the var *RoleArn* in gaze_config.js with the id. 
16. You are all set!!!

## Frontend Installation
Provide code examples and explanations of how to get the project.

## API Reference

Depending on the size of the project, if it is small and simple enough the reference docs can be added to the README. For medium size to larger projects it is important to at least provide a link to where the API reference docs are located.

## Tests

Describe and show how to run the tests with code examples.

## Contributors

Let people know how they can dive into the project, include important links to things like issue trackers, irc, twitter accounts if applicable.

## License

A short snippet describing the license (MIT, Apache, etc.)