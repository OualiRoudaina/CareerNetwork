#!/bin/bash
# Script de déploiement pour AWS App Runner
# Ce script prépare et déploie le service ML sur AWS

set -e

echo "=========================================="
echo "CareerNetwork ML Service - AWS Deployment"
echo "=========================================="

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier les variables d'environnement requises
if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}✗ Error: MONGODB_URI environment variable is required${NC}"
    exit 1
fi

if [ -z "$S3_BUCKET_NAME" ]; then
    echo -e "${YELLOW}⚠ Warning: S3_BUCKET_NAME not set. S3 upload will be skipped.${NC}"
fi

# Étape 1: Synchroniser MongoDB et générer les embeddings
echo -e "\n${GREEN}[1/3]${NC} Synchronizing MongoDB jobs..."
python sync_mongodb_s3.py

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Error during MongoDB sync${NC}"
    exit 1
fi

# Étape 2: Build Docker image (optionnel, pour test local)
if [ "$BUILD_DOCKER" = "true" ]; then
    echo -e "\n${GREEN}[2/3]${NC} Building Docker image..."
    docker build -t careernetwork-ml-service:latest .
    echo -e "${GREEN}✓${NC} Docker image built successfully"
else
    echo -e "\n${YELLOW}[2/3]${NC} Skipping Docker build (set BUILD_DOCKER=true to build)"
fi

# Étape 3: Instructions pour App Runner
echo -e "\n${GREEN}[3/3]${NC} Deployment instructions:"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for AWS deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to AWS Console > App Runner > Create service"
echo "3. Connect your GitHub repository"
echo "4. Configure:"
echo "   - Build type: Docker"
echo "   - Dockerfile path: ml-service/Dockerfile"
echo "   - Port: 8000"
echo "   - CPU: 2 vCPU"
echo "   - Memory: 4 GB"
echo ""
echo "5. Set environment variables:"
echo "   MONGODB_URI=$MONGODB_URI"
echo "   S3_BUCKET_NAME=$S3_BUCKET_NAME"
echo "   MODEL_PATH=models/all-MiniLM-L6-v2"
echo "   EMBEDDINGS_PATH=data/job_embeddings.npy"
echo "   INDEX_PATH=data/jobs_index.pkl"
echo "   PORT=8000"
echo ""
echo "6. Create IAM role with S3 read access"
echo "7. Deploy!"

echo -e "\n${GREEN}✓${NC} Deployment preparation complete!"




