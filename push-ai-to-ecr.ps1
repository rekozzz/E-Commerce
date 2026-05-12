# Set your AWS details here!
$AWS_ACCOUNT_ID="657588917420"
$AWS_REGION="us-east-1"  
$REPO_NAME="nexshop-ai"

Write-Host "1. Creating ECR Repository for AI..."
aws ecr create-repository --repository-name $REPO_NAME --region $AWS_REGION 2>$null

Write-Host "2. Logging into AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

Write-Host "3. Building the AI Docker Image..."
docker build -t $REPO_NAME ./ai

Write-Host "4. Tagging the Image..."
docker tag ${REPO_NAME}:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${REPO_NAME}:latest"

Write-Host "5. Pushing the AI Image to AWS ECR..."
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${REPO_NAME}:latest"

Write-Host "Done! The AI image is now in ECR."
