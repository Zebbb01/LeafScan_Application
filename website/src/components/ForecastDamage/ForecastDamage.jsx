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

  // Function to convert date to quarterly format
  const convertToQuarterlyFormat = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth(); // Months are 0-indexed
    const quarter = Math.floor(month / 3) + 1; // Calculate the quarter
    return `${year}Q${quarter}`;
  };

  // Function to get severity level based on severity range
  const getSeverityLevel = (severityRange) => {
    const severityValue = parseInt(severityRange); // Convert the severity range (e.g. "5%" -> 5)
    if (severityValue >= 1 && severityValue <= 3) return 'Low';
    if (severityValue >= 4 && severityValue <= 6) return 'Moderate';
    if (severityValue >= 7 && severityValue <= 10) return 'Severe';
    return 'Mixed';
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

      // Map the dates and transform production data
      const forecastLabels = data.forecast_dates.map(convertToQuarterlyFormat);
      const rawLabels = rawProductionData?.map(item => convertToQuarterlyFormat(item.date)) || [];

      const forecastData = data.next_8_quarters_forecast.map(value => parseFloat(value.toFixed(2)));
      const lossImpactData = data.actual_losses.map(value => parseFloat(value.toFixed(2)));
      const adjustedData = data.adjusted_production.map(value => parseFloat(value.toFixed(2)));

      const rawValues = rawProductionData?.map(item => item.value) || [];
      const combinedAdjustedProduction = [...rawValues, ...adjustedData];

      setChartData({
        labels: [...rawLabels, ...forecastLabels],
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
            data: combinedAdjustedProduction,
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="forecast-error">Error: {error}</div>;

  const evaluationMetrics = forecastDetails ? forecastDetails.evaluation_metrics : null;

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Impact of Vascular Streak Dieback (VSD) Disease on Cacao Production: Forecasted Damage',
        font: {
          size: 14,
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
          <p><strong>VSD Disease Loss:</strong> {forecastDetails.severity_range[0]}</p>
          <p><strong>Severity Level:</strong> {getSeverityLevel(forecastDetails.severity_range[0])}</p>
        </div>
      )}

      <Line data={chartData} options={options} />

      <div className="refresh-button-container">
        <button className="refresh-button" onClick={handleRefresh}>Refresh Data</button>
      </div>
    </div>
  );
};

export default ForecastDamage;
