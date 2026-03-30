import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import numpy as np

class LSTMModel:
    """
    Wrapper around TensorFlow/Keras LSTM model to maintain 
    consistency with the project's model structure.
    """
    def __init__(self, input_shape, units=64, dropout_rate=0.2, learning_rate=0.001):
        """
        Initializes the LSTM model.
        
        Args:
            input_shape (tuple): The shape of a single input sample (time_steps, features).
            units (int): Number of units in the LSTM layer.
            dropout_rate (float): Dropout probability.
            learning_rate (float): Learning rate for the Adam optimizer.
        """
        self.input_shape = input_shape
        self.units = units
        self.num_classes = 3
        self.dropout_rate = dropout_rate
        self.learning_rate = learning_rate
        self.model = self._build_model()

    def _build_model(self):
        model = Sequential([
            LSTM(self.units, input_shape=self.input_shape, return_sequences=False),
            Dropout(self.dropout_rate),
            Dense(32, activation='relu'),
            Dropout(self.dropout_rate),
            Dense(self.num_classes, activation='softmax')  
        ])
        
        optimizer = tf.keras.optimizers.Adam(learning_rate=self.learning_rate)
        model.compile(optimizer=optimizer, loss='sparse_categorical_crossentropy', metrics=['accuracy'])
        return model

    def _reshape_data(self, X):
        """
        Reshapes 2D tabular data (samples, features) into 3D sequence data
        required by LSTM: (samples, time_steps, features).
        We will treat the features dimension as time_steps with 1 feature per step.
        """
        if len(X.shape) == 2:
            # (samples, features) -> (samples, features, 1)
            return X.reshape(X.shape[0], X.shape[1], 1)
        return X

    def fit(self, X, y, epochs=50, batch_size=32, validation_split=0.2, verbose=1, **kwargs):
        X_reshaped = self._reshape_data(X)
        self.model.fit(
            X_reshaped, y, 
            epochs=epochs, 
            batch_size=batch_size, 
            validation_split=validation_split, 
            verbose=verbose,
            **kwargs
        )
        return self

    def predict(self, X):
        X_reshaped = self._reshape_data(X)
        y_prob = self.model.predict(X_reshaped, verbose=0)
        return np.argmax(y_prob, axis=1).flatten()

    def predict_proba(self, X):
        X_reshaped = self._reshape_data(X)
        y_prob = self.model.predict(X_reshaped, verbose=0)
        return y_prob

    def save(self, filepath):
        """Saves the Keras model to the specified filepath."""
        self.model.save(filepath)

    @classmethod
    def load(cls, filepath, input_shape=None):
        """Loads a saved Keras model."""
        loaded_keras_model = tf.keras.models.load_model(filepath)

        if input_shape is None:
            # Extract input shape from the loaded model
            input_shape = loaded_keras_model.input_shape[1:]
            
        instance = cls(input_shape=input_shape)
        instance.model = loaded_keras_model
        return instance
