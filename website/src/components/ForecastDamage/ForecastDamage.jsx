import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './ForecastDamage.css';
import Spinner from '../Spinner/SpinnerSticky';

const ForecastDamage = ({ isDataLoaded }) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastDetails, setForecastDetails] = useState(null);
  const [rawProductionData, setRawProductionData] = useState(null);
  const [startQuarter, setStartQuarter] = useState('All'); // State for start quarter/year
  const [endQuarter, setEndQuarter] = useState('All'); // State for end quarter/year
  const [endDate, setEndDate] = useState(null); // State for end date
  const [filteredLabels, setFilteredLabels] = useState([]); // Add state for filtered labels
  const [filteredRawValues, setFilteredRawValues] = useState([]); // Add state for filtered raw values
  const [baseLabels, setBaseLabels] = useState([]); // Base labels for filtering
  const [baseRawValues, setBaseRawValues] = useState([]); // Base raw values for filtering


  const fetchRawData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_production_data`);
      if (!response.ok) throw new Error('Failed to fetch raw production data');
      const data = await response.json();
      setRawProductionData(data.production);
    } catch (err) {
      setError(err.message);
    }
  };

  const getSeverityLevel = (severityRange) => {
    const severityValue = parseInt(severityRange); // Convert the severity range (e.g. "5%" -> 5)
    if (severityValue >= 1 && severityValue <= 3) return 'Low';
    if (severityValue >= 4 && severityValue <= 6) return 'Moderate';
    if (severityValue >= 7 && severityValue <= 10) return 'Severe';
    return 'Mixed';
  };



  const fetchForecastData = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch('/api/forecast-losses');
      if (!response.ok) throw new Error('Failed to fetch forecast data');
      const data = await response.json();
      setForecastDetails(data);
  
      const forecastLabels = data.forecast_dates.map(convertToQuarterlyFormat);
      const rawLabels = rawProductionData?.map(item => convertToQuarterlyFormat(item.date)) || [];
      const rawValues = rawProductionData?.map(item => item.value) || [];
  
      const allLabels = [...rawLabels, ...forecastLabels];
      const combinedAdjustedProduction = [...rawValues, ...data.adjusted_production];
  
      // Set base data
      setBaseLabels(allLabels);
      setBaseRawValues(combinedAdjustedProduction);
  
      // Set filtered data initially to show all
      setFilteredLabels(allLabels);
      setFilteredRawValues(rawValues);
  
      setChartData({
        labels: allLabels,
        datasets: [
          {
            label: 'Expected Production',
            data: [...Array(rawValues.length).fill(null), ...data.next_8_quarters_forecast.map(value => parseFloat(value.toFixed(2)))],
            backgroundColor: 'orange',
            borderColor: 'orange',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderDash: [10, 5],
          },
          {
            label: 'Adjusted Production',
            data: [...Array(rawValues.length).fill(null), ...data.adjusted_production.map(value => parseFloat(value.toFixed(2)))],
            backgroundColor: 'green',
            borderColor: 'green',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderDash: [10, 5],
          },
          {
            label: 'Loss Production Impact',
            data: [...Array(rawValues.length).fill(null), ...data.actual_losses.map(value => parseFloat(value.toFixed(2)))],
            backgroundColor: 'red',
            borderColor: 'red',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderDash: [10, 5],
          },
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
        ],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (isDataLoaded) fetchRawData();
  }, [isDataLoaded]);

  useEffect(() => {
    if (rawProductionData) fetchForecastData();
  }, [rawProductionData]);

  const applyFilters = () => {
    // Extract production data from forecastDetails
    const expectedProduction = [
      ...Array(baseRawValues.length - forecastDetails.next_8_quarters_forecast.length).fill(null),
      ...forecastDetails.next_8_quarters_forecast.map(value => parseFloat(value.toFixed(2)))
    ];
  
    const adjustedProduction = [
      ...Array(baseRawValues.length - forecastDetails.adjusted_production.length).fill(null),
      ...forecastDetails.adjusted_production.map(value => parseFloat(value.toFixed(2)))
    ];
  
    const lossProductionImpact = [
      ...Array(baseRawValues.length - forecastDetails.actual_losses.length).fill(null),
      ...forecastDetails.actual_losses.map(value => parseFloat(value.toFixed(2)))
    ];
  
    const startIndex = baseLabels.indexOf(startQuarter);
    const endIndex = endQuarter === 'All' ? baseLabels.length - 1 : baseLabels.indexOf(endQuarter);
  
    if (startIndex !== -1 && startIndex <= endIndex) {
      // Slice labels based on the selected indices
      const slicedLabels = baseLabels.slice(startIndex, endIndex + 1);
      const slicedRawValues = baseRawValues.slice(startIndex, endIndex + 2);
  
      const slicedExpectedProduction = expectedProduction.slice(startIndex, endIndex + 1);
      const slicedAdjustedProduction = adjustedProduction.slice(startIndex, endIndex + 1);
      const slicedLossProductionImpact = lossProductionImpact.slice(startIndex, endIndex + 1);
  
      // Find where Adjusted Production starts within the filtered data range
      const adjustedStartIndex = slicedLabels.indexOf(convertToQuarterlyFormat(forecastDetails.forecast_dates[0]));
  
      // Slice Production Data to stop before Adjusted Production starts
      const slicedProductionData = slicedRawValues.slice(0, adjustedStartIndex);
  
      setFilteredLabels(slicedLabels);
      setFilteredRawValues(slicedRawValues);
  
      setChartData({
        labels: slicedLabels,
        datasets: [
          {
            label: 'Expected Production',
            data: slicedExpectedProduction,
            backgroundColor: 'orange',
            borderColor: 'orange',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderDash: [10, 5],
          },
          {
            label: 'Adjusted Production',
            data: slicedAdjustedProduction,
            backgroundColor: 'green',
            borderColor: 'green',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderDash: [10, 5],
          },
          {
            label: 'Loss Production Impact',
            data: slicedLossProductionImpact,
            backgroundColor: 'red',
            borderColor: 'red',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderDash: [10, 5],
          },
          {
            label: 'Production Data',
            data: slicedProductionData, // Only show the production data up to Adjusted Production start
            backgroundColor: 'blue',
            borderColor: 'blue',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
          },
        ],
      });
    } else {
      console.error('Invalid start or end quarter selected.');
    }
  };
  

  const convertToQuarterlyFormat = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth(); // Months are 0-indexed
    const quarter = Math.floor(month / 3) + 1; // Calculate the quarter
    return `${year}Q${quarter}`;
  };
  
  if (loading) return <Spinner />;
  if (error) return <div className="forecast-error">Error: {error}</div>;

  const evaluationMetrics = forecastDetails ? forecastDetails.evaluation_metrics : null;

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Impact of Vascular Streak Dieback (VSD) Disease on Cacao Production: Forecasted Damage Over the Next 8 Quarters (2 Years)',
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
        title: { display: true, text: 'Production (Metric Tons)' },
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

  const handleStartQuarterChange = (event) => {
    setStartQuarter(event.target.value);
  };

  const handleEndQuarterChange = (event) => {
    setEndQuarter(event.target.value);
  };

return (
  <>
    <div className="graph-header">
      <div className="quarter-filter-container">
          <div className="quarter-filter">
            <label>Start Quarter/Year: </label>
            <select value={startQuarter} onChange={handleStartQuarterChange}>
              <option value="Start" disabled>Start</option>
              {rawProductionData?.map(item => convertToQuarterlyFormat(item.date))
                .map((quarter, index) => (
                  <option key={index} value={quarter}>
                    {quarter}
                  </option>
                ))}
            </select>
          </div>
          <div className="quarter-filter">
            <label>End Quarter/Year: </label>
            <select value={endQuarter} onChange={handleEndQuarterChange}>
              <option value="End" disabled>End</option>
              <option value="All">All</option>
              {rawProductionData?.map(item => convertToQuarterlyFormat(item.date))
                .map((quarter, index) => (
                  <option key={index} value={quarter}>
                    {quarter}
                  </option>
                ))}
            </select>
          </div>
          <button
            className="filter-button"
            onClick={applyFilters}
            aria-label="Apply Filters for Start and End Quarter/Year"
          >
            Apply Filter
          </button>
        </div>
      </div>
    <div className="forecast-damage-chart-container">
      {evaluationMetrics && (
        <div className="evaluation-metrics">
          <p>
            <strong>MAE (Mean Absolute Error):</strong> {(evaluationMetrics.MAE * 0.1).toFixed(2)}
          </p>
        </div>
      )}
      {forecastDetails && (
        <div className="forecast-details">
          <p>
            <strong>VSD Disease Loss:</strong> {forecastDetails.severity_range[0]}
          </p>
          <p>
            <strong>Severity Level:</strong> {getSeverityLevel(forecastDetails.severity_range[0])}
          </p>
        </div>
      )}

      <Line data={chartData} options={options} />

      <div className="refresh-button-container">
        <button className="refresh-button" onClick={handleRefresh}>
          Refresh Data
        </button>
      </div>
    </div>
  </>
);

};

export default ForecastDamage;
