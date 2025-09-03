# To go into container

docker exec -it [container-name] sh

# start all compose files

docker compose -f backend/compose.yaml -f frontend/compose.yaml -f nginx/compose.yaml up --build -d

docker compose up --build -d

# see enc vars

env

# add env var

export env=value
