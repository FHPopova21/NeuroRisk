import numpy as np

class LogisticRegression:
    def __init__(self, number_inputs, learning_rate=0.01, epochs=1000):
        self.number_inputs = number_inputs
        self.learning_rate = learning_rate
        self.epochs = epochs
        self.weights = np.zeros(number_inputs)
        self.bias = 0
        self.threshold = 0.5

    def sigmoid(self, z):
        z = np.clip(z, -250, 250)
        return 1 / (1 + np.exp(-z))

    def predict_proba(self, inputs):
        inputs = np.array(inputs)
        z = np.dot(inputs, self.weights) + self.bias
        return self.sigmoid(z)

    def predict(self, inputs):
        probs = self.predict_proba(inputs)
        return (probs >= self.threshold).astype(int)

    def loss(self, y_expected, y_predicted):
        eps = 1e-15
        y_predicted = np.clip(y_predicted, eps, 1 - eps)
        loss = -np.mean(y_expected * np.log(y_predicted) + (1 - y_expected) * np.log(1 - y_predicted))
        return loss

    def train(self, X, y, verbose=True):
        """
        Train using Batch Gradient Descent.
        X: (n_samples, n_features)
        y: (n_samples,)
        """
        X = np.array(X)
        y = np.array(y)
        n_samples = X.shape[0]

        for i in range(self.epochs):
            # 1. Forward Pass
            z = np.dot(X, self.weights) + self.bias
            y_pred = self.sigmoid(z)

            error = y - y_pred 
            
            # Gradients 
            dw = np.dot(X.T, error) / n_samples
            db = np.sum(error) / n_samples

            # Update Weights
            self.weights += self.learning_rate * dw
            self.bias += self.learning_rate * db
            
            # Logging
            if verbose and i % 100 == 0:
                l = self.loss(y, y_pred)
                print(f"Epoch {i}: Loss = {l:.4f}")
