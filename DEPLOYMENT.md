#  - AWS Deployment Guide

#Deployment Options

# Option 1: AWS EC2 with Docker Compose (Recommended)

## Prerequisites
- AWS EC2 instance (t3.medium or larger recommended)
- Ubuntu 22.04 LTS or Amazon Linux 2
- Docker and Docker Compose installed
- Domain name (optional but recommended)

## Step 1: Prepare EC2 Instance

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group to take effect


## Step 2: Deploy Application

# Clone your repository
git clone <your-repo-url>
cd apt

# Copy environment file and configure
cp .env.docker .env
nano .env  # Update with your production values

# Build and start services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f app


## Step 3: Configure Security Groups (AWS Console)
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- SSH (22): Your IP only
- Custom (3000): 0.0.0.0/0 (for direct app access)




### Option 2: AWS ECS (Elastic Container Service)

#### Prerequisites
- AWS CLI configured
- ECS CLI installed
- ECR repository created

#### Step 1: Build and Push to ECR

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t employee-management .

# Tag image
docker tag employee-management:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/employee-management:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/employee-management:latest
```

#### Step 2: Create ECS Task Definition
```json
{
  "family": "employee-management",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "employee-app",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/employee-management:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "MONGODB_URI",
          "value": "mongodb+srv://username:password@cluster.mongodb.net/employee_management"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/employee-management",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Option 3: AWS Elastic Beanstalk

# Step 1: Prepare for Beanstalk

# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init employee-management --region us-east-1

# Create environment
eb create production-env


# Production Configuration

# Environment Variables (.env)

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee_management

# Security
JWT_SECRET=your-super-long-random-secret-key-for-production
NODE_ENV=production

# Application
PORT=5000
CLIENT_URL=https://yourdomain.com

# Optional: Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## SSL Certificate (Let's Encrypt)

# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet


##  Monitoring and Logs

# Docker Logs

# View application logs
docker-compose logs -f app

# View MongoDB logs
docker-compose logs -f mongodb

# View all logs
docker-compose logs -f


## Health Checks
- Application: `http://your-domain.com/api/health`
- Database: Check MongoDB connection in logs

##  Security Checklist

- [ ] Update default passwords
- [ ] Use strong JWT secret
- [ ] Configure CORS properly
- [ ] Set up SSL certificate
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor application logs
- [ ] Set up automated backups
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting (Nginx)

##  Deployment Commands

## Development

# Local development
npm run dev

# Build for production
npm run build
```

## Production Deployment

# Full deployment with monitoring
docker-compose --profile production up -d

# Basic deployment (without Nginx)
docker-compose up -d app mongodb

# Update application only
docker-compose build app
docker-compose up -d app

# Scale application
docker-compose up -d --scale app=3
```

## Maintenance

# Backup database
docker exec employee_mongodb mongodump --db employee_management --out /backup

# Update application
git pull origin main
docker-compose build app
docker-compose up -d app

# Clean up unused resources
docker system prune -f
```

## 🆘 Troubleshooting

## Common Issues
1. **Port 3000 already in use**: Change port in docker-compose.yml
2. **MongoDB connection failed**: Check MONGODB_URI in .env
3. **502 Bad Gateway**: Check if app container is running
4. **CORS errors**: Update CLIENT_URL in environment variables

### Debug Commands

# Check container status
docker-compose ps

# View container logs
docker-compose logs app

# Access container shell
docker-compose exec app sh

# Test database connection
docker-compose exec mongodb mongosh


This setup provides a production-ready deployment with proper security, monitoring, and scalability considerations.