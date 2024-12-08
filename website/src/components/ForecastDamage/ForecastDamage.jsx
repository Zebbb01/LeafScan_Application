import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './ForecastDamage.css';

const ForecastDamage = ({ isDataLoaded }) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastDetails, setForecastDetails] = useState(null);
  const [rawProductionData, setRawProductionData] = useState(null);

  // Function to fetch raw production data
  const fetchRawData = async () => {
    try {
      const response = await fetch('/api/production-raw');
      if (!response.ok) throw new Error('Failed to fetch raw production data');
      const data = await response.json();
      setRawProductionData(data.production);
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to fetch forecast data
  const fetchForecastData = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch('/api/forecast-losses');
      if (!response.ok) throw new Error('Failed to fetch forecast data');
  
      const data = await response.json();
      setForecastDetails(data);
  
      const labels = data.forecast_dates;
      const forecastData = data.next_8_quarters_forecast.map(value => parseFloat(value.toFixed(2)));
      const lossImpactData = data.actual_losses.map(value => parseFloat(value.toFixed(2)));
      const adjustedData = data.adjusted_production.map(value => parseFloat(value.toFixed(2)));
  
      const rawLabels = rawProductionData?.map(item => item.date) || [];
      const rawValues = rawProductionData?.map(item => item.value) || [];
  
      // Combine raw production and forecasted adjusted production data
      const combinedAdjustedProduction = [...rawValues, ...adjustedData];
  
      setChartData({
        labels: [...rawLabels, ...labels],
        datasets: [
          {
            label: 'Production Data',
            data: rawValues,
            backgroundColor: 'blue',
            borderColor: 'blue',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
          },
          {
            label: 'Expected Production',
            data: [...Array(rawValues.length).fill(null), ...forecastData],
            backgroundColor: 'orange',
            borderColor: 'orange',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
          },
          {
            label: 'Loss Production Impact',
            data: [...Array(rawValues.length).fill(null), ...lossImpactData],
            backgroundColor: 'red',
            borderColor: 'red',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
          },
          {
            label: 'Adjusted Production',
            data: combinedAdjustedProduction, // Use combined data for continuous line
            backgroundColor: 'green',
            borderColor: 'green',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
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

  // Refresh data when isDataLoaded changes
  useEffect(() => {
    if (isDataLoaded) {
      fetchRawData();
    }
  }, [isDataLoaded]);

  useEffect(() => {
    if (rawProductionData) {
      fetchForecastData();
    }
  }, [rawProductionData]);

  // // Set interval to refresh data every 20 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchRawData();
  //     fetchForecastData();
  //   }, 20000);

  //   return () => clearInterval(interval);
  // }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="forecast-error">Error: {error}</div>;

  const leafDiseaseLoss = forecastDetails ? forecastDetails.leaf_disease_loss * 100 : 0;
  const branchDiseaseLoss = forecastDetails ? forecastDetails.branch_disease_loss * 100 : 0;
  const totalDiseaseLoss = leafDiseaseLoss + branchDiseaseLoss;
  const evaluationMetrics = forecastDetails ? forecastDetails.evaluation_metrics : null;

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Impact of Disease on Cacao Production: Forecasted Damage',
        font: {
          size: 16,
        }
      },
      legend: { display: true, position: 'top' },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        callbacks: {
          label: function (tooltipItem) {
            const datasetLabel = tooltipItem.dataset.label || '';
            const value = tooltipItem.raw;
            return `${datasetLabel}: ${value.toFixed(2)}`;
          },
        },
        caretSize: 5,
        xPadding: 10,
        yPadding: 10,
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
    hover: {
      mode: 'nearest',
      intersect: false,
    },
    events: ['mousemove', 'mouseout', 'click'],
  };

  const handleRefresh = () => {
    fetchRawData();
    fetchForecastData();
  };

  return (
    <div className="forecast-damage-chart-container">
      {evaluationMetrics && (
        <div className="evaluation-metrics">
          <p><strong>MAE (Mean Absolute Error):</strong> {(evaluationMetrics.MAE * 0.1).toFixed(2)}</p>
        </div>
      )}
      {forecastDetails && (
        <div className="forecast-details">
          <p><strong>Leaf Disease Loss:</strong> {(forecastDetails.leaf_disease_loss * 100).toFixed(2)}%</p>
          <p><strong>Branch Disease Loss:</strong> {(forecastDetails.branch_disease_loss * 100).toFixed(2)}%</p>
          <p><strong>Total Disease Loss:</strong> {(totalDiseaseLoss).toFixed(2)}%</p>
        </div>
      )}

      <Line data={chartData} options={options} />

      {/* Refresh Button */}
      <div className="refresh-button-container">
        <button className="refresh-button" onClick={handleRefresh}>Refresh Data</button>
      </div>
    </div>
  );
};

export default ForecastDamage;
