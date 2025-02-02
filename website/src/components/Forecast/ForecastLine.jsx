import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import './ForecastLine.css';  // Ensure you import the CSS file here
import Spinner from '../Spinner/SpinnerSticky';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const ForecastLine = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mae, setMae] = useState(null);  // Add a state for MAE

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/prediction`, { withCredentials: true });
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
  
        const alignedPredictions = [...Array(labels.length).fill(null), ...predictions];

        // Create the line connecting the last actual point and first predicted point
        const combinedAdjustedProduction = [...actualProductions, ...predictions];

        setChartData({
          labels: allLabels,
          datasets: [
            {
              label: 'Actual Production',
              data: actualProductions.map((y, index) => ({ x: labels[index], y })), // Ensure proper x-y structure
              backgroundColor: 'blue',
              borderColor: 'blue',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointRadius: 0,          // Points are hidden by default
              pointHoverRadius: 5,     // Points become visible on hover
              showLine: true,          // Ensure the line is rendered
            },
            {
              label: 'Predicted Production',
              data: combinedAdjustedProduction.map((y, index) => ({ x: allLabels[index], y })), // Proper x-y structure
              backgroundColor: 'green',
              borderColor: 'green',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointRadius: 0,
              pointHoverRadius: 5,
              borderDash: [10, 5],
            },
          ],                   
        });
        setMae(data.mae);  // Set the MAE value
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);  // Fetch data on component mount

  if (loading) return <Spinner />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="chart-container">
      <div className="forecast-chart-container">
        <div className="mae-display">
          <strong>Mean Absolute Error (MAE): </strong> {mae !== null ? mae : 'N/A'}
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
              title: {
                display: true,
                text: 'Cacao Fruit Production Forecast',
                font: {
                  size: 16,
                },
              },
              legend: {
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true,  // Use point style for better legend toggle behavior
                },
              },
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
                  title: function (tooltipItems) {
                    return tooltipItems[0].label;
                  },
                  label: function (tooltipItem) {
                    return `Production: ${tooltipItem.raw.y.toFixed(2)} Metric Tons`;
                  },
                },
              },
            },
            hover: {
              mode: 'nearest',
              intersect: false,
            },
            events: ['mousemove', 'mouseout', 'click'], // Events to listen for hover behavior
          }}          
        />

      </div>
      <p>This graph visualizes cacao fruit production trends over the years, highlighting patterns of growth and decline that are crucial for assessing the long-term health of cacao farming. By analyzing historical data, stakeholders can better forecast future production, anticipate challenges like climate change or market shifts, and make informed decisions to optimize resource management. This data-driven approach helps farmers and researchers adjust strategies for sustainability and productivity, ultimately supporting better planning for future production cycles in the cacao industry.</p>
    </div>
  );  
};

export default ForecastLine;
