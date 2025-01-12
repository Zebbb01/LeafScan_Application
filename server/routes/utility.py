from flask import app
import numpy as np
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import KFold # mao ni ang gi gamit sa pag K-fold cross validation
from sklearn.metrics import mean_squared_error
from models import Production

def time_series_k_fold(data, k=5, seasonal_periods=4):
    # Initialize KFold (here k=5 for example)
    kf = KFold(n_splits=k, shuffle=False)

    mae_scores = []
    mse_scores = []
    rmse_scores = []

    for train_index, test_index in kf.split(data):
        # Split the data into train and test
        train_data, test_data = data.iloc[train_index], data.iloc[test_index]

        # Fit the model on training data
        model = ExponentialSmoothing(
            train_data['value'], 
            trend='add', 
            seasonal='add', 
            seasonal_periods=seasonal_periods
        ).fit()

        # Forecast on the test data
        forecast = model.forecast(len(test_data))

        # Evaluate the model
        y_true = test_data['value'].values
        y_pred = forecast.values
        mae = mean_absolute_error(y_true, y_pred)
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)

        mae_scores.append(mae)
        mse_scores.append(mse)
        rmse_scores.append(rmse)

    # Return average scores from all folds
    return {
        'MAE': np.mean(mae_scores),
        'MSE': np.mean(mse_scores),
        'RMSE': np.mean(rmse_scores)
    }
    
def fetch_production_data():
    """Fetch production data as a DataFrame."""
    try:
        records = Production.query.order_by(Production.date).all()
        if not records:
            raise ValueError("No production data found.")
        data = [{'date': r.date.strftime('%Y-%m-%d'), 'value': round(r.value, 2)} for r in records]
        return pd.DataFrame(data)
    except Exception as e:
        app.logger.error(f"Error fetching production data: {e}")
        raise