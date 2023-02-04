#!/bin/bash

DIR=$1

if [ -z "$DIR" ]
then
  echo "No data directory supplied"
  exit 1
fi

if [ ! -d "$DIR" ]
then
  echo "Directory $DIR does not exist"
  exit 1
fi

DATADIR=${DIR%%/}/hg-data
TMPDIR=${DIR%%/}/hg-tmp

if [ ! -d "$DATADIR" ]
then
  echo "Data directory $DATADIR does not exist"
  exit 1
fi

# start docker container
docker run --detach \
	--publish 8888:80 \
	--volume ${DATADIR}:/data \
	--volume ${TMPDIR}:/tmp \
	--name higlass-container \
	higlass/higlass-docker
