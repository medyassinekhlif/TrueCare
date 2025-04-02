import os
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import re
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from torch.utils.data import DataLoader

# Enhanced neural network architecture with an extra hidden layer
class ReimbursementModel(nn.Module):
    def __init__(self, input_size):
        super(ReimbursementModel, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_size, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(128, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()  # Ensures output between 0 and 1
        )
    
    def forward(self, x):
        # Scale output to a percentage (0-100)
        return self.net(x) * 100

# Enhanced data processor including new features (policy margins)
class InsuranceDataProcessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.enc = OneHotEncoder(handle_unknown='ignore')
        # Add policy_min_margin and policy_max_margin as numerical features.
        self.num_features_order = ['sessions', 'total_expense', 'age', 'in_network', 
                                   'pre_existing', 'retired', 'policy_min_margin', 'policy_max_margin']
        self.cat_features_order = ['insurance_tier', 'treatment_type', 'case_severity']
        
    def fit_transform(self, features_list):
        num_features = np.array([
            [f[feat] for feat in self.num_features_order]
            for f in features_list
        ])
        cat_features = np.array([
            [f[feat] for feat in self.cat_features_order]
            for f in features_list
        ])
        
        self.scaler.fit(num_features)
        self.enc.fit(cat_features)
        
        return self.transform(features_list)
    
    def transform(self, features_list):
        num_features = np.array([
            [f[feat] for feat in self.num_features_order]
            for f in features_list
        ])
        cat_features = np.array([
            [f[feat] for feat in self.cat_features_order]
            for f in features_list
        ])
        
        scaled_num = self.scaler.transform(num_features)
        encoded_cat = self.enc.transform(cat_features).toarray()
        
        return np.hstack([scaled_num, encoded_cat])

# Enhanced parser that extracts new fields from text files including policy margins
def parse_txt_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    def extract_pattern(pattern, default=None):
        match = re.search(pattern, content)
        return match.group(1).strip() if match else default
    
    # Extract policy reimbursement margin as a range e.g. "70-90"
    margin = extract_pattern(r"Policy reimbursement margin:\s*([\d]+)-([\d]+)%", None)
    if margin:
        # Use regex groups for min and max
        margin_match = re.search(r"([\d]+)-([\d]+)", extract_pattern(r"Policy reimbursement margin:\s*([\d\-]+)%", "0-0"))
        policy_min_margin = float(margin_match.group(1))
        policy_max_margin = float(margin_match.group(2))
    else:
        policy_min_margin = 0.0
        policy_max_margin = 0.0

    data = {
        'sessions': int(extract_pattern(r"Sessions attended:\s*(\d+)", "0")),
        'total_expense': float(extract_pattern(r"Total amount paid:\s*([\d.]+)", "0.0")),
        'age': 2024 - int(extract_pattern(r"Date of birth:\s*(\d{4})", "2000")),
        'insurance_tier': extract_pattern(r"Insurance Tier:\s*(.*?)\n", "Unknown"),
        'in_network': int('in-network' in extract_pattern(r"Network status:\s*(.*?)\n", "out-of-network").lower()),
        'pre_existing': int(extract_pattern(r"Pre-existing condition:\s*(Yes|No)", "No").lower() == "yes"),
        'retired': int(extract_pattern(r"Retired:\s*(Yes|No)", "No").lower() == "yes"),
        'treatment_type': extract_pattern(r"Treatment Type:\s*(.*?)\n", "Unknown"),
        'case_severity': extract_pattern(r"Case Severity:\s*(.*?)\n", "Non-critical"),
        # Final reimbursement percentage is the target variable (without % symbol)
        'reimbursement_percentage': float(extract_pattern(r"Final reimbursement percentage:\s*([\d.]+)", "0.0")),
        # New features from policy reimbursement margin:
        'policy_min_margin': policy_min_margin,
        'policy_max_margin': policy_max_margin
    }
    return data

# Training function with validation, early stopping, and learning rate scheduling
def train_model(model, train_loader, val_loader, epochs=100):
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-5)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=5, verbose=True)
    best_loss = float('inf')
    
    for epoch in range(epochs):
        model.train()
        train_loss = 0
        for X, y in train_loader:
            optimizer.zero_grad()
            outputs = model(X).squeeze()
            loss = criterion(outputs, y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
        
        # Validation phase
        model.eval()
        val_loss = 0
        with torch.no_grad():
            for X, y in val_loader:
                outputs = model(X).squeeze()
                val_loss += criterion(outputs, y).item()
        
        avg_train_loss = train_loss / len(train_loader)
        avg_val_loss = val_loss / len(val_loader)
        
        scheduler.step(avg_val_loss)
        
        # Save the best model based on validation loss
        if avg_val_loss < best_loss:
            best_loss = avg_val_loss
            torch.save(model.state_dict(), "best_model.pth")
        
        print(f"Epoch {epoch+1}: Train Loss: {avg_train_loss:.4f}, Val Loss: {avg_val_loss:.4f}")
        
# Sample usage
if __name__ == "__main__":
    # Load and process data from all .txt files in the current directory
    files = [f for f in os.listdir('.') if f.endswith('.txt')]
    features_list = [parse_txt_file(f) for f in files]
    
    processor = InsuranceDataProcessor()
    X = processor.fit_transform(features_list)
    y = np.array([f['reimbursement_percentage'] for f in features_list])
    
    # Create datasets and data loaders
    dataset = torch.utils.data.TensorDataset(
        torch.tensor(X, dtype=torch.float32),
        torch.tensor(y, dtype=torch.float32)
    )
    train_size = int(0.8 * len(dataset))
    train_set, val_set = torch.utils.data.random_split(dataset, [train_size, len(dataset)-train_size])
    
    train_loader = DataLoader(train_set, batch_size=2, shuffle=True)
    val_loader = DataLoader(val_set, batch_size=2)
    
    # Initialize and train the model
    model = ReimbursementModel(X.shape[1])
    train_model(model, train_loader, val_loader, epochs=200)
    
    # Predict an example using "3.txt"
    test_features = parse_txt_file("3.txt")
    test_input = processor.transform([test_features])
    model.load_state_dict(torch.load("best_model.pth"))
    model.eval()
    with torch.no_grad():
        prediction = model(torch.tensor(test_input, dtype=torch.float32)).item()
    print(f"Predicted Reimbursement Percentage: {prediction:.2f}%")
