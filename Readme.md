# Glass house

A daily data privacy and cybersecurity education game. One challenge per day, designed for people with no prior knowledge of online security.

## What is it?

Glass House works like a daily puzzle game. Each day a new challenge is determined and generated from the backend with teh help of a LLM. The backend then uploads the generated game in a json format to google drive folder. The frontend reads the Google Drive url and generates the correct components. Seven game types rotate daily: passwords, passphrases, spot the weakest password, phishing emails, cookie banners, and privacy quizzes.

## Tech stack

| Layer      | Choice             |
| ---------- | ------------------ |
| Framework  | React + TypeScript |
| UI library | MUI (Material UI)  |
| Backend    |                    |
| LLM        |                    |
| ...        |                    |

## General Project structure

```
client #frontend of the application
├── src/
│   └── App.tsx
│   └── index.tsx
server #backend of the application
├── glasshouse/
│   └── app/
│   └── example_json/

```

# How to run the project

## Front-end

```Bash
    cd .\client\
    npm install
    npm start
```

To connect to a real google drive, create a `.env` file in the project root:

```
REACT_APP_SECRET_NAME=https://www.googleapis.com/drive/v3/files/YOUR_FILE_ID?alt=media&key=YOUR_API_KEY
```

When `REACT_APP_SECRET_NAME` is not set, the app automatically falls back to the built-in mock data so you can develop without a google drive or any drive connection.

## Back-end

The back end requires the following env variables to be present at the root of the back end project folder

- FILE_ID: This is the id of the file for the one drive communication 
- CREDENTIAL_PATH: The path where all the one drive credentials are stored
- GMAIL_SENDER: The host of the email service to send emails from
- RECIPIENTS: The people that will recieve te email 
- CHAT_API_KEY: The API key used to access the Radboud AI model

Currently the email is not finished thus those are not neccasery to provide. 
The Install chapter contains the required command for Windows to get the project running. 

The file 'generate_day.py' is responsible for generating the day, this is automated with the use of pipelines which can be found in 'pipeline.py'. For any questions about the back-end contact: justin.kasteleijn@ru.nl. 

### Install

pip install google-api-python-client google-auth google-auth-httplib2 google-auth-oauthlib

```Bash
    cd .\server\
    . .venv\Scripts\activate
    python manage.py runserver

    Testing
    python server\glasshouse\main.py
```

# Deployment

Currently only the frontend is deployed using github pages
