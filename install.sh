#!/bin/bash

WEB_URL="http://localhost:3000"
DOCS_URL="http://localhost:3000/documentation"
DOCKER_FILE_PATH=docker-compose.yml
DOCKER_ENV_PATH=.env

function print_header() {
clear

cat <<"EOF"
--------------------------------------------
--------------------------------------------
Project crawl data from the web
--------------------------------------------
EOF
}

function spinner() {
    local pid=$1
    local delay=.5
    local spinstr='|/-\'

    if ! ps -p "$pid" > /dev/null; then  
        echo "Invalid PID: $pid"  
        return 1  
    fi  
    while ps -p "$pid" > /dev/null; do  
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr" >&2
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b" >&2
    done
    printf "    \b\b\b\b" >&2
}

check_docker() {
    echo "-- Check if docker daemon is running --"
    docker version
    if [ $? == 0 ]; then
	echo "Docker daemon installed and running"
    elif [ $? == 1 ]; then
	echo "Build failed -- Docker daemon installed but not running"
	exit -1;
    else
	echo "Build failed -- Docker daemon not installed"
	exit -1;
    fi
}

function buildYourOwnImage(){
    echo "Building images locally..."
    export APP_RELEASE="local"

    /bin/bash -c "$COMPOSE_CMD -f build.yml build" >&2
    if [ $? -ne 0 ]; then
        echo "Build failed. Exiting..."
        exit 1
    fi
    echo "Build completed successfully"
}

function startServices() {
    echo "building your own image"
    buildYourOwnImage

    /bin/bash -c "$COMPOSE_CMD -f $DOCKER_FILE_PATH up -d migration redis football-match-db"

    local migration_container_id=$(docker container ls -aq -f "name=football-match-migration")
    if [ -n "$migration_container_id" ]; then
        local idx=0
        while docker inspect --format='{{.State.Status}}' $migration_container_id | grep -q "running"; do
            local message=">> Waiting for Data Migration to finish"
            local dots=$(printf '%*s' $idx | tr ' ' '.')
            echo -ne "\r$message$dots"
            ((idx++))
            sleep 1
        done
    fi
    printf "\r\033[K"
    echo ""
    echo "   Data Migration completed successfully"

    if [ -n "$migration_container_id" ]; then
        local migrator_exit_code=$(docker inspect --format='{{.State.ExitCode}}' $migration_container_id)
        if [ $migrator_exit_code -ne 0 ]; then
            echo "Plane Server failed to start"
            # stopServices
            echo
            echo "Please check the logs for the 'migrator' service and resolve the issue(s)."
            echo "Stop the services by running the command: ./setup.sh stop"
            exit 1
        fi
    fi

    /bin/bash -c "$COMPOSE_CMD -f $DOCKER_FILE_PATH up -d football-match"

    local api_container_id=$(docker container ls -q -f "name=football-match-development")
    local idx2=0
    while ! docker logs $api_container_id 2>&1 | grep -m 1 -i "Nest application successfully started" | grep -q ".";
    do
        local message=">> Waiting for API Service to Start"
        local dots=$(printf '%*s' $idx2 | tr ' ' '.')    
        echo -ne "\r$message$dots"
        ((idx2++))
        sleep 1
    done
    printf "\r\033[K"
    echo "   API Service started successfully"
    source "${DOCKER_ENV_PATH}"
    echo "   Plane Server started successfully"
    echo ""
    echo "   You can access the application at $WEB_URL"
    echo "   You can access the documentation at $DOCS_URL"
    echo ""
}

function stopServices() {
    /bin/bash -c "$COMPOSE_CMD -f $DOCKER_FILE_PATH  down"
}

function askForAction() {
    local DEFAULT_ACTION=$1

    if [ -z "$DEFAULT_ACTION" ];
    then
        echo
        echo "Select a Action you want to perform:"
        echo "   1) Start"
        echo "   2) Stop"
        echo "   3) Exit"
        echo 
        read -p "Action [1]: " ACTION
        until [[ -z "$ACTION" || "$ACTION" =~ ^[1-3]$ ]]; do
            echo "$ACTION: invalid selection."
            read -p "Action [1]: " ACTION
        done

        if [ -z "$ACTION" ];
        then
            ACTION=1
        fi
        echo
    fi

    if [ "$ACTION" == "1" ] || [ "$DEFAULT_ACTION" == "start" ];
    then
        startServices
    elif [ "$ACTION" == "2" ] || [ "$DEFAULT_ACTION" == "stop" ];
    then
        stopServices
    elif [ "$ACTION" == "3" ]
    then
        exit 0
    else
        echo "INVALID ACTION SUPPLIED"
    fi
}

# if docker-compose is installed
if command -v docker-compose &> /dev/null
then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

check_docker
print_header
askForAction "$@"
