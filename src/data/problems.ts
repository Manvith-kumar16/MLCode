export type Difficulty = "Easy" | "Medium" | "Hard";
export type ProblemStatus = "solved" | "attempted" | "unsolved";
export type MLTopic = "Classification" | "Regression" | "NLP" | "Computer Vision" | "Clustering" | "Deep Learning" | "Feature Engineering" | "Time Series" | "Recommender Systems" | "Reinforcement Learning";

export interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  topics: MLTopic[];
  acceptance: number;
  status: ProblemStatus;
  description: string;
  dataset: string;
  metric: string;
  constraints: string[];
  starterCode: string;
}

export const problems: Problem[] = [
  {
    id: 1,
    title: "Binary Classification with Logistic Regression",
    difficulty: "Easy",
    topics: ["Classification"],
    acceptance: 78.2,
    status: "solved",
    description: "Given a dataset of patient records with features like age, blood pressure, and cholesterol levels, build a binary classifier to predict whether a patient has heart disease.\n\nYour model should achieve at least 75% accuracy on the hidden test set.",
    dataset: "heart_disease.csv — 303 samples, 13 features, binary target",
    metric: "Accuracy",
    constraints: ["Must use scikit-learn", "No external data allowed", "Time limit: 60s"],
    starterCode: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

def solution(X_train, y_train, X_test):
    """
    Build a classifier to predict heart disease.
    
    Args:
        X_train: Training features (pd.DataFrame)
        y_train: Training labels (pd.Series)
        X_test: Test features (pd.DataFrame)
    
    Returns:
        predictions: numpy array of predictions
    """
    # Your code here
    model = LogisticRegression()
    model.fit(X_train, y_train)
    return model.predict(X_test)`,
  },
  {
    id: 2,
    title: "House Price Prediction",
    difficulty: "Easy",
    topics: ["Regression", "Feature Engineering"],
    acceptance: 72.5,
    status: "solved",
    description: "Predict house prices using the Boston Housing dataset. Apply feature engineering and regression techniques to minimize RMSE.",
    dataset: "housing.csv — 506 samples, 13 features, continuous target",
    metric: "RMSE",
    constraints: ["Time limit: 120s", "Memory limit: 512MB"],
    starterCode: `import pandas as pd
from sklearn.linear_model import LinearRegression

def solution(X_train, y_train, X_test):
    """Predict house prices."""
    # Your code here
    pass`,
  },
  {
    id: 3,
    title: "Sentiment Analysis on Movie Reviews",
    difficulty: "Medium",
    topics: ["NLP", "Classification"],
    acceptance: 54.3,
    status: "attempted",
    description: "Build a sentiment classifier for IMDB movie reviews. Preprocess text data, extract features, and classify reviews as positive or negative.",
    dataset: "imdb_reviews.csv — 50,000 reviews, binary sentiment",
    metric: "F1 Score",
    constraints: ["Time limit: 180s", "No pre-trained transformers"],
    starterCode: `import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

def solution(X_train, y_train, X_test):
    """Classify movie review sentiment."""
    # Your code here
    pass`,
  },
  {
    id: 4,
    title: "Image Classification with CNN",
    difficulty: "Hard",
    topics: ["Computer Vision", "Deep Learning"],
    acceptance: 31.7,
    status: "unsolved",
    description: "Build a convolutional neural network to classify images from the CIFAR-10 dataset into 10 categories. Achieve at least 85% accuracy.",
    dataset: "CIFAR-10 — 60,000 32x32 color images, 10 classes",
    metric: "Accuracy",
    constraints: ["PyTorch or TensorFlow only", "Time limit: 300s", "GPU available"],
    starterCode: `import torch
import torch.nn as nn

class MLModel(nn.Module):
    def __init__(self):
        super().__init__()
        # Define your architecture
        pass
    
    def forward(self, x):
        # Your forward pass
        pass

def solution(train_loader, test_loader):
    """Train and predict on CIFAR-10."""
    # Your code here
    pass`,
  },
  {
    id: 5,
    title: "Customer Segmentation with K-Means",
    difficulty: "Easy",
    topics: ["Clustering"],
    acceptance: 82.1,
    status: "unsolved",
    description: "Segment customers based on purchasing behavior using K-Means clustering. Determine the optimal number of clusters.",
    dataset: "customers.csv — 200 samples, 5 features",
    metric: "Silhouette Score",
    constraints: ["Time limit: 60s"],
    starterCode: `from sklearn.cluster import KMeans

def solution(X):
    """Segment customers into clusters."""
    # Your code here
    pass`,
  },
  {
    id: 6,
    title: "Time Series Forecasting with LSTM",
    difficulty: "Hard",
    topics: ["Time Series", "Deep Learning"],
    acceptance: 28.4,
    status: "unsolved",
    description: "Forecast stock prices using LSTM neural networks. Handle temporal dependencies and predict the next 30 days of prices.",
    dataset: "stock_prices.csv — 5 years of daily prices",
    metric: "MAE",
    constraints: ["PyTorch only", "Time limit: 300s"],
    starterCode: `import torch
import torch.nn as nn

def solution(train_data, forecast_horizon=30):
    """Forecast future stock prices."""
    # Your code here
    pass`,
  },
  {
    id: 7,
    title: "Feature Selection for High-Dimensional Data",
    difficulty: "Medium",
    topics: ["Feature Engineering", "Classification"],
    acceptance: 61.2,
    status: "unsolved",
    description: "Given a dataset with 500+ features, select the most relevant features and build a classifier. Handle multicollinearity and redundant features.",
    dataset: "genomics.csv — 1000 samples, 500 features",
    metric: "ROC-AUC",
    constraints: ["Max 50 features in final model", "Time limit: 120s"],
    starterCode: `from sklearn.feature_selection import SelectKBest

def solution(X_train, y_train, X_test):
    """Select features and classify."""
    # Your code here
    pass`,
  },
  {
    id: 8,
    title: "Text Generation with Markov Chains",
    difficulty: "Medium",
    topics: ["NLP"],
    acceptance: 58.9,
    status: "unsolved",
    description: "Build a text generator using Markov Chains trained on Shakespeare's works. Generate coherent text passages.",
    dataset: "shakespeare.txt — Complete works",
    metric: "Perplexity",
    constraints: ["No neural networks", "Time limit: 60s"],
    starterCode: `import random
from collections import defaultdict

def solution(training_text, seed_words, num_words=100):
    """Generate text using Markov Chains."""
    # Your code here
    pass`,
  },
  {
    id: 9,
    title: "Anomaly Detection in Network Traffic",
    difficulty: "Hard",
    topics: ["Classification", "Feature Engineering"],
    acceptance: 35.1,
    status: "unsolved",
    description: "Detect anomalous network traffic patterns that may indicate cyber attacks. Handle highly imbalanced data.",
    dataset: "network_traffic.csv — 500K records, 41 features, 0.1% anomaly rate",
    metric: "F1 Score",
    constraints: ["Handle class imbalance", "Time limit: 180s"],
    starterCode: `from sklearn.ensemble import IsolationForest

def solution(X_train, y_train, X_test):
    """Detect network anomalies."""
    # Your code here
    pass`,
  },
  {
    id: 10,
    title: "Multi-class Image Segmentation",
    difficulty: "Hard",
    topics: ["Computer Vision", "Deep Learning"],
    acceptance: 22.8,
    status: "unsolved",
    description: "Perform pixel-level segmentation on medical images to identify different tissue types. Build a U-Net architecture.",
    dataset: "medical_images/ — 500 images with masks, 4 classes",
    metric: "IoU (Intersection over Union)",
    constraints: ["PyTorch only", "Time limit: 600s", "GPU available"],
    starterCode: `import torch
import torch.nn as nn

class UNet(nn.Module):
    def __init__(self):
        super().__init__()
        # Build U-Net architecture
        pass

def solution(train_loader, test_images):
    """Segment medical images."""
    # Your code here
    pass`,
  },
  {
    id: 11,
    title: "Dimensionality Reduction with PCA",
    difficulty: "Medium",
    topics: ["Feature Engineering", "Clustering"], // Using Clustering as a proxy for Unsupervised if needed, but Feature Engineering fits well
    acceptance: 68.5,
    status: "unsolved",
    description: "Reduce the dimensionality of a high-dimensional dataset using Principal Component Analysis (PCA) while retaining 95% of the variance.",
    dataset: "digits.csv — 1797 samples, 64 features",
    metric: "Explained Variance Ratio",
    constraints: ["Must use scikit-learn", "Time limit: 60s"],
    starterCode: `from sklearn.decomposition import PCA

def solution(X):
    """
    Reduce dimensionality using PCA.
    
    Args:
        X: high-dimensional data
        
    Returns:
        X_reduced: data with reduced dimensions
        pca: fitted PCA object
    """
    # Your code here
    pass`,
  },
  {
    id: 12,
    title: "Movie Recommendation System",
    difficulty: "Medium",
    topics: ["Recommender Systems"],
    acceptance: 55.2,
    status: "unsolved",
    description: "Build a collaborative filtering recommendation system to suggest movies to users based on their rating history.",
    dataset: "movies.csv & ratings.csv — 100k ratings, 9k movies, 600 users",
    metric: "RMSE",
    constraints: ["Time limit: 120s"],
    starterCode: `import pandas as pd
from sklearn.metrics import mean_squared_error

def solution(ratings_train, ratings_test):
    """
    Predict movie ratings.
    
    Args:
        ratings_train: DataFrame [userId, movieId, rating]
        ratings_test: DataFrame [userId, movieId, rating]
        
    Returns:
        predictions: list of predicted ratings for test set
    """
    # Your code here
    pass`,
  },
  {
    id: 13,
    title: "Reinforcement Learning with CartPole",
    difficulty: "Hard",
    topics: ["Reinforcement Learning"],
    acceptance: 25.8,
    status: "unsolved",
    description: "Train an agent to balance a pole on a cart using reinforcement learning (DQN or Policy Gradient). The agent must keep the pole balanced for 200 time steps.",
    dataset: "OpenAI Gym CartPole-v1 Environment",
    metric: "Average Reward",
    constraints: ["PyTorch or TensorFlow", "Time limit: 600s"],
    starterCode: `import gym
import torch
import torch.nn as nn

def solution(env):
    """
    Train an RL agent on CartPole-v1.
    
    Args:
        env: gym environment
        
    Returns:
        policy_net: trained neural network
    """
    # Your code here
    pass`,
  },
  {
    id: 14,
    title: "Gradient Boosting for Churn Prediction",
    difficulty: "Medium",
    topics: ["Classification"],
    acceptance: 62.9,
    status: "unsolved",
    description: "Predict customer churn using Gradient Boosting (XGBoost/LightGBM/CatBoost). Optimize hyperparameters for maximum recall.",
    dataset: "telecom_churn.csv — 7043 samples, 21 features",
    metric: "Recall",
    constraints: ["Time limit: 180s"],
    starterCode: `from xgboost import XGBClassifier

def solution(X_train, y_train, X_test):
    """
    Predict customer churn.
    
    Args:
        X_train: Training features
        y_train: Training labels
        X_test: Test features
        
    Returns:
        predictions: predicted labels
    """
    # Your code here
    pass`,
  },
  {
    id: 15,
    title: "Transfer Learning with ResNet",
    difficulty: "Easy",
    topics: ["Computer Vision", "Deep Learning"],
    acceptance: 85.3,
    status: "unsolved",
    description: "Fine-tune a pre-trained ResNet-18 model to classify bees vs. ants. Use transfer learning to achieve high accuracy with a small dataset.",
    dataset: "hymenoptera_data — 244 training images, 153 validation images",
    metric: "Accuracy",
    constraints: ["PyTorch only", "Time limit: 300s", "GPU available"],
    starterCode: `import torch
import torch.nn as nn
from torchvision import models

def solution(train_loader, val_loader):
    """
    Fine-tune ResNet-18.
    
    Args:
        train_loader: DataLoader for training
        val_loader: DataLoader for validation
        
    Returns:
        model: trained model
    """
    # Your code here
    pass`,
  },
];

export const leaderboardData = [
  { rank: 1, username: "ml_wizard", score: 2847, solved: 156, streak: 42, country: "US" },
  { rank: 2, username: "neural_ninja", score: 2691, solved: 148, streak: 38, country: "IN" },
  { rank: 3, username: "data_sage", score: 2534, solved: 139, streak: 31, country: "UK" },
  { rank: 4, username: "tensor_queen", score: 2412, solved: 132, streak: 27, country: "DE" },
  { rank: 5, username: "gradient_guru", score: 2301, solved: 125, streak: 24, country: "CA" },
  { rank: 6, username: "loss_fn", score: 2198, solved: 118, streak: 21, country: "FR" },
  { rank: 7, username: "backprop_dev", score: 2087, solved: 112, streak: 19, country: "JP" },
  { rank: 8, username: "sklearn_pro", score: 1956, solved: 105, streak: 15, country: "BR" },
  { rank: 9, username: "deep_thinker", score: 1843, solved: 98, streak: 12, country: "KR" },
  { rank: 10, username: "feature_eng", score: 1721, solved: 91, streak: 10, country: "AU" },
];

export const userStats = {
  username: "ml_enthusiast",
  rank: 1247,
  solved: 23,
  attempted: 8,
  total: 150,
  streak: 7,
  points: 456,
  easy: { solved: 12, total: 50 },
  medium: { solved: 8, total: 60 },
  hard: { solved: 3, total: 40 },
  recentSubmissions: [
    { problem: "Binary Classification with Logistic Regression", status: "Accepted", score: 92.3, date: "2 hours ago" },
    { problem: "Sentiment Analysis on Movie Reviews", status: "Wrong Answer", score: 61.2, date: "1 day ago" },
    { problem: "House Price Prediction", status: "Accepted", score: 88.7, date: "2 days ago" },
    { problem: "Customer Segmentation with K-Means", status: "Time Limit Exceeded", score: 0, date: "3 days ago" },
  ],
  heatmap: Array.from({ length: 365 }, () => Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0),
};
