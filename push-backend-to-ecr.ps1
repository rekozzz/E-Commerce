# Set your AWS details here!
$AWS_ACCOUNT_ID="657588917420"
$AWS_REGION="us-east-1"  # Change if your region is different
$REPO_NAME="nexshop-backend"

# Write-Host "1. Creating ECR Repository (if it doesn't exist)..."
# aws ecr create-repository --repository-name $REPO_NAME --region $AWS_REGION 2>$null

Write-Host "2. Logging into AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

Write-Host "3. Building the Backend Docker Image..."
docker build -t $REPO_NAME ./backend

Write-Host "4. Tagging the Image..."
docker tag ${REPO_NAME}:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${REPO_NAME}:latest"

Write-Host "5. Pushing the Image to AWS ECR..."
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/${REPO_NAME}:latest"

Write-Host "Done! The image is now in ECR."
