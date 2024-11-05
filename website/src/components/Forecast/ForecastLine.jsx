import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import './ForecastLine.css';  // Ensure you import the CSS file here

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const ForecastLine = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mae, setMae] = useState(null);  // Add a state for MAE

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/prediction', { withCredentials: true });
        const contentType = response.headers.get('content-type');
  
        if (!response.ok || !contentType.includes('application/json')) {
          throw new Error('Failed to fetch data or response is not JSON');
        }
  
        const data = await response.json();
  
        if (data.error) {
          throw new Error(data.error);
        }
  
        const labels = data.actual.map(item => item['Date']);
        const actualProductions = data.actual.map(item => item['Production']);
        const predictions = data.forecast.map(item => item['Production']);
        const allLabels = [...labels, ...data.dates];
        const lowerCI = data.lower_CI;
        const upperCI = data.upper_CI;
  
        const alignedPredictions = [...Array(labels.length).fill(null), ...predictions];

        // Create the line connecting the last actual point and first predicted point
        const connectingLine = [
          { x: labels[labels.length - 1], y: actualProductions[actualProductions.length - 1] },
          { x: data.dates[0], y: predictions[0] }
        ];

        setChartData({
          labels: allLabels,
          datasets: [
            {
              label: 'Actual Production',
              data: actualProductions.map((y, index) => ({ x: labels[index], y })),
              backgroundColor: 'blue',
              borderColor: 'blue',
              borderWidth: 3,
              fill: false,
              tension: 0.1,
              spanGaps: true,
            },
            {
              label: 'Predicted Production',
              data: alignedPredictions.map((y, index) => ({ x: allLabels[index], y })),
              backgroundColor: 'orange',
              borderColor: 'orange',
              borderWidth: 3,
              fill: false,
              tension: 0.1,
              spanGaps: true,
            },
            {
              label: 'Start of Prediction',
              data: connectingLine,
              backgroundColor: 'green',
              borderColor: 'green',
              borderWidth: 3,
              fill: false,
              tension: 0.1,
              spanGaps: true,
            },
            {
              label: 'Lower CI',
              data: lowerCI.map((y, index) => ({ x: data.dates[index], y })),
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 0.2)',
              fill: '+1',
              pointRadius: 0,
              showLine: true,
            },
            {
              label: 'Upper CI',
              data: upperCI.map((y, index) => ({ x: data.dates[index], y })),
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 0.2)',
              fill: '-1',
              pointRadius: 0,
              showLine: true,
            }
          ]
        });
        setMae(data.mae);  // Set the MAE value
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="forecast-chart-container">
      <div className="mae-display">
        <strong>Mean Absolute Error (MAE):</strong> {mae !== null ? mae : 'N/A'}
      </div>
      <Line 
        data={chartData} 
        options={{
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Year-Quarter',
              },
              type: 'category',
            },
            y: {
              title: {
                display: true,
                text: 'Production (Metric Tons)',
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => tooltipItems[0].label,
                label: (tooltipItem) => `Production: ${tooltipItem.raw.y}`,
              },
            }
          }
        }} 
      />
    </div>
  );  
};

export default ForecastLine;
