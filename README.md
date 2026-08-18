Network Intrusion Detection System (NIDS)
An end-to-end machine learning pipeline for classifying network security threats, deployed on AWS with a full CI/CD workflow.

📌 Overview
This project builds a production-grade Network Intrusion Detection System that automatically identifies malicious network traffic patterns. It covers the full ML lifecycle — from raw data ingestion to cloud deployment — with robust handling of class imbalance and data drift.

🏗️ Architecture
MongoDB Atlas (Data Store)
        ↓
   ETL Pipeline
        ↓
  Data Validation
        ↓
Data Transformation
  (KNN Imputation + SMOTE-Tomek)
        ↓
  Model Training
        ↓
  Docker Container
        ↓
  AWS ECR → AWS EC2
        ↓
  CI/CD (GitHub Actions)

⚙️ Features

End-to-end ML Pipeline: Modular stages for ETL, validation, transformation, training, and deployment
Data Drift Detection: Monitors feature distribution shifts between training and serving data
KNN Imputation: Handles missing values in network traffic records
SMOTE-Tomek Resampling: Addresses severe class imbalance between normal and attack traffic
Dockerized Deployment: Containerized app pushed to AWS ECR and served on EC2
CI/CD Pipeline: Automated build, test, and deploy via GitHub Actions


🧰 Tech Stack
CategoryToolsLanguagePythonMLScikit-learn, imbalanced-learnData StoreMongoDB AtlasContainerizationDockerCloudAWS ECR, AWS EC2CI/CDGitHub ActionsData ProcessingPandas, NumPy

📁 Project Structure
├── src/
│   ├── components/
│   │   ├── data_ingestion.py
│   │   ├── data_validation.py
│   │   ├── data_transformation.py
│   │   └── model_trainer.py
│   ├── pipeline/
│   │   ├── training_pipeline.py
│   │   └── prediction_pipeline.py
│   └── utils/
├── config/
├── Dockerfile
├── .github/workflows/
│   └── deploy.yml
├── requirements.txt
└── README.md

🚀 Getting Started
Prerequisites

Python 3.8+
Docker
MongoDB Atlas URI
AWS credentials (for deployment)

Local Setup
bash# Clone the repository
git clone https://github.com/Kush-Taneja/network-intrusion-detection.git
cd network-intrusion-detection

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export MONGO_URI="your_mongodb_atlas_uri"

# Run training pipeline
python src/pipeline/training_pipeline.py
Docker
bashdocker build -t nids-app .
docker run -p 8080:8080 nids-app

📊 Results
MetricScoreAccuracyupdate after runPrecisionupdate after runRecallupdate after runF1-Scoreupdate after run

Dataset: [NSL-KDD / CICIDS — update as appropriate]


🔄 CI/CD Flow
On every push to main:

GitHub Actions builds the Docker image
Image is pushed to AWS ECR
EC2 instance pulls the latest image and restarts the container


📄 License
MIT License
