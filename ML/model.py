import torch
import torch.nn as nn

class ReimbursementModel(nn.Module):
    def __init__(self, input_size=12):
        super(ReimbursementModel, self).__init__()
        self.classifier = nn.Sequential(
            nn.Linear(input_size, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 3)  # Low, Medium, High
        )
        self.regressor = nn.Sequential(
            nn.Linear(input_size, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid()  # Normalized reimbursement percentage
        )

    def forward(self, x):
        class_logits = self.classifier(x)
        reimbursement = self.regressor(x)
        return class_logits, reimbursement