# GAMA Platform Docker Images

This directory contains Docker configurations for the GAMA modeling and simulation platform.

## Quick Start

### Build the image

```bash
# Build with default version (0.0.0-SNAPSHOT)
make build

# Build with specific version
GAMA_VERSION=1.9.0 make build
```

### Run the container

```bash
# Start the container
make run

# View logs
make logs

# Stop the container
make stop
```

### Using Docker Compose directly

```bash
# Build and run
docker compose -f docker/docker-compose.yml up -d

# View logs
docker compose -f docker/docker-compose.yml logs -f

# Stop
docker compose -f docker/docker-compose.yml down
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GAMA_VERSION` | `0.0.0-SNAPSHOT` | Version tag for the image |
| `JAVA_OPTS` | `-Xms1g -Xmx4g -XX:+UseG1GC` | JVM options |
| `GAMA_OPTS` | `` | Additional GAMA options |

## Ports

| Port | Description |
|------|-------------|
| `8080` | Spring Boot REST API |
| `9090` | GAMA WebSocket server |

## Volumes

| Volume | Description |
|--------|-------------|
| `gama-workspace` | GAMA workspace for models and experiments |
| `gama-logs` | Application logs |

## API Endpoints

Once running, the following REST endpoints are available:

- `GET /api/simulation/health` - Health check
- `POST /api/simulation/stream` - SSE stream simulation
- `POST /api/simulation/validate` - Validate GAML code

## Building the Product

Before building the Docker image, ensure the GAMA product is built:

```bash
# Build GAMA platform
mvn clean install -DskipTests

# The product ZIP will be at:
# gama.product/target/gama.product-0.0.0-SNAPSHOT.zip
```

## Production Deployment

### Push to registry

```bash
# Login to registry
docker login

# Build and push
make build-push
```

### Kubernetes deployment example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gama-headless
spec:
  replicas: 1
  selector:
    matchLabels:
      app: gama-headless
  template:
    metadata:
      labels:
        app: gama-headless
    spec:
      containers:
      - name: gama
        image: gama-platform/gama-headless:latest
        ports:
        - containerPort: 8080
        - containerPort: 9090
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "6Gi"
            cpu: "4000m"
        volumeMounts:
        - name: workspace
          mountPath: /opt/gama/workspace
      volumes:
      - name: workspace
        persistentVolumeClaim:
          claimName: gama-workspace
---
apiVersion: v1
kind: Service
metadata:
  name: gama-headless
spec:
  selector:
    app: gama-headless
  ports:
  - port: 8080
    targetPort: 8080
  - port: 9090
    targetPort: 9090
  type: LoadBalancer
```

## License

GAMA is licensed under the CECILL license. See https://gama-platform.org for more information.
