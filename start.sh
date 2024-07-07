#!/bin/bash

cp backend/.env.example backend/.env

docker compose down --rmi local
docker compose up -d