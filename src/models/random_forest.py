from sklearn.ensemble import RandomForestClassifier as SklearnRF

class RandomForest:
    """
    Wrapper around sklearn.ensemble.RandomForestClassifier to maintain 
    consistency with the project's model structure.
    """
    def __init__(self, n_estimators=100, max_depth=None, criterion='entropy', random_state=42, **kwargs):
        self.model = SklearnRF(
            n_estimators=n_estimators,
            max_depth=max_depth,
            criterion=criterion,
            random_state=random_state,
            n_jobs=-1,  
            class_weight='balanced',
            **kwargs
        )

    def fit(self, X, y):
        self.model.fit(X, y)
        return self

    def predict(self, X):
        return self.model.predict(X)

    def predict_proba(self, X):
        return self.model.predict_proba(X)
    
    def get_params(self, deep=True):
        return self.model.get_params(deep)
