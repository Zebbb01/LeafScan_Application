import React, { useState, useEffect, useRef } from 'react';
import Spinner from '../Spinner/SpinnerSticky';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import './ForecastLossGraph.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ForecastLossGraph = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [forecastDetails, setForecastDetails] = useState(null);
    const chartRef = useRef(null);

    // Format dates into 'YYYYQ#'
    const formatDatesToQuarters = (dates) => {
        return dates.map((date) => {
            const [year, month] = date.split('-').map(Number);
            const quarter = Math.ceil(month / 3);
            return `${year}Q${quarter}`;
        });
    };

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bar-forecast-losses`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to fetch data');

            const forecastResponse = await fetch('/api/forecast-losses');
            const forecastData = await forecastResponse.json();
            setForecastDetails(forecastData);

            setChartData({
                labels: formatDatesToQuarters(data.forecast_dates),
                datasets: [
                    {
                        label: 'Expected Production',
                        data: data.expected_production,
                        backgroundColor: '#F1C232',
                    },
                    {
                        label: 'Adjusted Production',
                        data: data.adjusted_production,
                        backgroundColor: '#34A853',
                    },
                    {
                        label: 'Loss Production Impact',
                        data: data.loss_production_impact,
                        backgroundColor: '#EA4335',
                    },
                ],
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <Spinner />;
    if (error) return <div>Error: {error}</div>;

    const getSeverityLevel = (severityRange) => {
        const severityValue = parseInt(severityRange, 10);
        if (severityValue >= 1 && severityValue <= 3) return 'Low';
        if (severityValue >= 4 && severityValue <= 6) return 'Moderate';
        if (severityValue >= 7 && severityValue <= 10) return 'Severe';
        return 'Unknown';
    };

    return (
        <div className="ForecastLossGraph-container">
            <div className="ForecastLossGraph-chart">
                <div className="chart-container" ref={chartRef}>
                    {forecastDetails && forecastDetails.severity_range && forecastDetails.severity_range.length > 0 ? (
                        <div className="forecast-details">
                            <p>
                                <strong>VSD Disease Loss:</strong>{' '}
                                {forecastDetails.severity_range[0] || 'N/A'}
                            </p>
                            <p>
                                <strong>Severity Level:</strong>{' '}
                                {getSeverityLevel(forecastDetails.severity_range[0]) || 'N/A'}
                            </p>
                        </div>
                    ) : (
                        <p>No forecast details available.</p>
                    )}
    
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Forecasted Production Loss and Adjusted Output Due to Vascular Streak Dieback (VSD) Over the Next 8 Quarters (2 Years)',
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (tooltipItem) =>
                                            `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(2)}`,
                                    },
                                },
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Quarter', // Label for X-axis
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Production (Metric Tons)', // Label for Y-axis
                                    },
                                },
                            },
                        }}
                    />
                </div>
                <div className="refresh-button-container">
                    <button className="refresh-button" onClick={handleRefresh}>
                        Refresh Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForecastLossGraph;
