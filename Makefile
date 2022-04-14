.PHONY: build
## Build the image
build:
	docker-compose -f client/docker-compose.yml build

.PHONY: up
## Start the container
up:
	docker-compose -f client/docker-compose.yml up
