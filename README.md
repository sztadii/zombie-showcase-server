# zombie-showcase-server

## Description:
REST API to present little information about zombies

## Requirements:
- NodeJS ( min 12.0.0 ) for app serving and other development process
- Docker - to build and get some dependencies ( like Firestore etc )

## How to run our application ( in development mode )
At first, you need to create .env file ( please use as an example .env-example ) in root directory <br/>
After please install NodeJS and then run below commands:
```
npm install
npm start
```

## How to run our application ( in production mode )
At first please install docker and docker-compose on your machine
```
docker-compose up
```

## Other info
Production version of app is deployed to GCP [LINK](https://zombie-showcase-server-kgptm5ui3q-ey.a.run.app)
