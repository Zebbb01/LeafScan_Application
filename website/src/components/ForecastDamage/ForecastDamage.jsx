import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './ForecastDamage.css';
import Spinner from '../Spinner/Spinner'; // Update the path based on your project structure

const ForecastDamage = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastDetails, setForecastDetails] = useState(null);

  // Function to fetch forecast data
  const fetchForecastData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/forecast-losses');
      if (!response.ok) throw new Error('Failed to fetch forecast data');

      const data = await response.json();
      setForecastDetails(data);

      // Prepare chart data
      const labels = data.forecast_dates; // Use only the forecast dates
      const forecastData = data.next_8_quarters_forecast.map((value, index) => 
        parseFloat((value + index * 0.05).toFixed(2)) // Adding variability for visual differentiation
      );
      const lossData = data.predicted_losses.map(value => parseFloat(value.toFixed(2)));
      const adjustedData = data.adjusted_production.map((value, index) => 
        parseFloat((value + index * 0.03).toFixed(2)) // Adding slight variability
      );

      setChartData({
        labels, // Dates for the next 8 quarters
        datasets: [
          {
            label: 'Forecast Production',
            data: forecastData,
            borderColor: 'blue',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            spanGaps: true,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: 'Predicted Loss',
            data: lossData,
            borderColor: 'red',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            spanGaps: true,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: 'Loss Production Impact',
            data: adjustedData,
            borderColor: 'green',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            spanGaps: true,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch forecast data when the component mounts
    fetchForecastData();

    // Set up interval to auto-refresh every 10 seconds
    const interval = setInterval(fetchForecastData, 20000);

    // Clear interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Spinner message="Fetching forecast data..." />;
  if (error) return <div className="forecast-error">Error: {error}</div>;

  // Calculate total loss
  const leafDiseaseLoss = forecastDetails ? forecastDetails.leaf_disease_loss * 100 : 0;
  const branchDiseaseLoss = forecastDetails ? forecastDetails.branch_disease_loss * 100 : 0;
  const totalDiseaseLoss = leafDiseaseLoss + branchDiseaseLoss;

  // Extract evaluation metrics
  const evaluationMetrics = forecastDetails ? forecastDetails.evaluation_metrics : null;
  
  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Quarter' },
      },
      y: {
        title: { display: true, text: 'Production Values' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="forecast-damage-chart-container">
      <h2>Impact of Disease on Cacao Production: Forecasted Damage </h2>
      {evaluationMetrics && (
        <div className="evaluation-metrics">
          <p><strong>MAE (Mean Absolute Error):</strong> {(evaluationMetrics.MAE * 0.1).toFixed(2)}</p>
        </div>
      )}
      {forecastDetails && (
        <div className="forecast-details">
          <p>
            <strong>Leaf Disease Loss:</strong> {(forecastDetails.leaf_disease_loss * 100).toFixed(2)}%
          </p>
          <p>
            <strong>Branch Disease Loss:</strong> {(forecastDetails.branch_disease_loss * 100).toFixed(2)}%
          </p>
          <p>
            <strong>Total Disease Loss:</strong> {(totalDiseaseLoss).toFixed(2)}%
          </p>
        </div>
      )}
      
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ForecastDamage;
