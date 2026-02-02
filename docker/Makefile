.PHONY: build build-push run stop logs clean help

GAMA_VERSION ?= 0.0.0-SNAPSHOT
BUILD_DATE := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
IMAGE_NAME := gama-platform/gama-headless

build:
	@echo "Building GAMA Docker image v${GAMA_VERSION}..."
	@cd .. && docker build \
		--build-arg GAMA_VERSION=$(GAMA_VERSION) \
		--build-arg BUILD_DATE=$(BUILD_DATE) \
		-t $(IMAGE_NAME):$(GAMA_VERSION) \
		-t $(IMAGE_NAME):latest \
		-f docker/Dockerfile .
	@echo "Image built successfully!"

build-push: build
	@echo "Pushing image to registry..."
	@docker push $(IMAGE_NAME):$(GAMA_VERSION)
	@docker push $(IMAGE_NAME):latest
	@echo "Image pushed successfully!"

run:
	@echo "Starting GAMA container..."
	@docker compose -f docker/docker-compose.yml up -d
	@echo "Container started. Access at http://localhost:8080"

stop:
	@echo "Stopping GAMA container..."
	@docker compose -f docker/docker-compose.yml down
	@echo "Container stopped."

logs:
	@docker compose -f docker/docker-compose.yml logs -f

clean:
	@echo "Cleaning up Docker resources..."
	@docker compose -f docker/docker-compose.yml down -v
	@docker rmi $(IMAGE_NAME):$(GAMA_VERSION) $(IMAGE_NAME):latest 2>/dev/null || true
	@echo "Cleanup complete."

help:
	@echo "GAMA Docker Management Commands:"
	@echo ""
	@echo "  make build         - Build the Docker image"
	@echo "  make build-push    - Build and push to registry"
	@echo "  make run           - Start the container"
	@echo "  make stop          - Stop the container"
	@echo "  make logs          - View container logs"
	@echo "  make clean         - Remove container and images"
	@echo ""
	@echo "Variables:"
	@echo "  GAMA_VERSION=$(GAMA_VERSION)  - Version tag for the image"
