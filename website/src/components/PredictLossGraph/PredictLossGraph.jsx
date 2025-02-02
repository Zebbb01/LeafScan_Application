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
import './PredictLossGraph.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PredictLossGraph = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [forecastDetails, setForecastDetails] = useState(null);
    const chartRef = useRef(null);

    // Fetch data from backend
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bargraph-losses`);
            const data = await response.json();

            if (!response.ok || !data.dates || data.dates.length === 0) {
                setChartData(null); // Hide the chart
                setError(data.error || 'No forecast data available.');
                return;
            }
            const forecastResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/forecast-losses`);
            const forecastData = await forecastResponse.json();
            setForecastDetails(forecastData);

            setChartData({
                labels: data.dates,
                datasets: [
                    {
                        label: 'Expected Production',
                        data: data.expected_production,
                        backgroundColor: '#32CD32',
                    },
                    {
                        label: 'Adjusted Production',
                        data: data.adjusted_production,
                        backgroundColor: '#87CEEB',
                    },
                ],
            });

        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
            setChartData(null); // Hide the chart
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current && chartRef.current.chart) {
                chartRef.current.chart.resize();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Helper function to get severity level
    const getSeverityLevel = (severityRange) => {
        const severityValue = parseInt(severityRange, 10); // Parse as integer
        if (severityValue >= 1 && severityValue <= 3) return 'Low';
        if (severityValue >= 4 && severityValue <= 6) return 'Moderate';
        if (severityValue >= 7 && severityValue <= 10) return 'Severe';
        return 'Mixed';
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Forecasted Impact of Vascular Streak Dieback (VSD) Disease on Cacao Production (2024 – 2026)',
            },
            legend: {
                display: true,
                position: 'top',
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
                    text: 'Quarter',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Production (Metric Tons)',
                },
                beginAtZero: true,
                ticks: {
                    callback: (value) => value.toFixed(2),
                },
            },
        },
    };

    if (loading) {
        return <Spinner />;
    }
    
    // Hide the specific error message "No future data available for forecasting."
    if (error && error !== "No future data available for forecasting.") {
        return <div className="bar-chart error">Error: {error}</div>;
    }
    
    // No data available
    if (!chartData) {
        return;
    }    

    return (
        <>
    <div className="PredictLossGraph-description">
                <h2>Forecasted Impact of VSD Disease on Cacao Production (2024–2026)</h2>
                <p>
                    This bar graph illustrates the forecasted impact of Vascular Streak Dieback (VSD) Disease on cacao production over the next two years (2024–2026). 
                    It showcases expected production values, adjusted figures accounting for potential losses, and highlights the need for strategies to mitigate these impacts.
                </p>
            </div>
        <div className="PredictLossGraph-container">
            

            <div className="PredictLossGraph-chart">
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
                    <Bar data={chartData} options={chartOptions} />
                </div>
                <div className="refresh-button-container">
                    <button className="refresh-button" onClick={fetchData}>
                        Refresh Data
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export default PredictLossGraph;
