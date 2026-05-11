# Stage 1: Build the React frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the FastAPI backend
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy the built React assets into the backend's static directory
RUN mkdir -p ./backend/static
COPY --from=frontend-build /app/frontend/dist/ ./backend/static/

# Set working directory to where the FastAPI app lives
WORKDIR /app/backend

# Run the FastAPI server, binding to the PORT environment variable provided by the host
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
