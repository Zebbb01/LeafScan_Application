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
import './LossGraph.css'; // Reuse BarGraph's CSS

// Register necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LossGraph = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [forecastDetails, setForecastDetails] = useState(null);
    const [startQuarter, setStartQuarter] = useState('All');
    const [endQuarter, setEndQuarter] = useState('All');
    const chartRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/production-losses`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch data');

            const forecastResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/forecast-losses`);
            const forecastData = await forecastResponse.json();
            setForecastDetails(forecastData);

            const filteredData = data.dates.reduce((acc, date, index) => {
                const year = new Date(date).getFullYear();
                const quarter = Math.floor(new Date(date).getMonth() / 3) + 1;
                const formattedDate = `${year}Q${quarter}`;

                if (year > 2024 || (year === 2024 && quarter >= 2)) {
                    acc.dates.push(formattedDate);
                    acc.production_raw.push(data.production_raw[index]);
                    acc.adjusted_production.push(data.adjusted_production[index]);
                }
                return acc;
            }, { dates: [], production_raw: [], adjusted_production: [] });

            // Apply filters based on selected start and end quarters
            let filteredDates = filteredData.dates;
            let filteredRawProduction = filteredData.production_raw;
            let filteredAdjustedProduction = filteredData.adjusted_production;

            if (startQuarter !== 'All') {
                const startIdx = filteredDates.indexOf(startQuarter);
                filteredDates = filteredDates.slice(startIdx);
                filteredRawProduction = filteredRawProduction.slice(startIdx);
                filteredAdjustedProduction = filteredAdjustedProduction.slice(startIdx);
            }

            if (endQuarter !== 'All') {
                const endIdx = filteredDates.indexOf(endQuarter);
                filteredDates = filteredDates.slice(0, endIdx + 1);
                filteredRawProduction = filteredRawProduction.slice(0, endIdx + 1);
                filteredAdjustedProduction = filteredAdjustedProduction.slice(0, endIdx + 1);
            }

            if (filteredDates.length > 0) {
                setChartData({
                    labels: filteredDates,
                    datasets: [
                        {
                            label: 'Production (Raw)',
                            data: filteredRawProduction,
                            backgroundColor: '#5a9',
                            borderColor: '#4d8',
                            borderWidth: 1,
                            barThickness: 'flex',
                        },
                        {
                            label: 'Loss',
                            data: filteredAdjustedProduction,
                            backgroundColor: '#e74c3c',
                            borderColor: '#d62c1a',
                            borderWidth: 1,
                            barThickness: 'flex',
                        },
                    ],
                });
            } else {
                setChartData(null); // No data to show
            }

            setLoading(false);
        } catch (err) {
            setError(err.message);
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

    const handleStartQuarterChange = (event) => {
        setStartQuarter(event.target.value);
    };

    const handleEndQuarterChange = (event) => {
        setEndQuarter(event.target.value);
    };

    const getSeverityLevel = (severityRange) => {
        const severityValue = parseInt(severityRange); // Convert the severity range (e.g. "5%" -> 5)
        if (severityValue >= 1 && severityValue <= 3) return 'Low';
        if (severityValue >= 4 && severityValue <= 6) return 'Moderate';
        if (severityValue >= 7 && severityValue <= 10) return 'Severe';
        return 'Mixed';
    };

    if (loading) return <Spinner />;
    if (error) return <div className="bar-chart error">Error: {error}</div>;

    if (!chartData) return null; // Do not render the graph if no data

    return (
        <>
            <div className="LossGraph-description">
                <h2>Production Against Loss Due to VSD Disease</h2>
                <p>
                    This graph compares raw Cacao Fruit Production values to adjusted values that reflect
                    losses caused by Vascular Streak Dieback (VSD) Disease. Use this chart to understand the
                    impact of these losses on overall production, focusing on 2024 and future projections.
                </p>
                <p>
                    By analyzing this data, stakeholders can develop targeted strategies to minimize
                    disease impact and improve yield over time.
                </p>
            </div>
            <div className="graph-header">
                <div className="quarter-filter-container">
                    <div className="quarter-filter">
                        <label>Start Quarter/Year: </label>
                        <select value={startQuarter} onChange={handleStartQuarterChange}>
                            <option value="Start" disabled>Start</option>
                            <option value="All">All</option>
                            {chartData?.labels?.map((quarter, index) => (
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
                            {chartData?.labels?.map((quarter, index) => (
                                <option key={index} value={quarter}>
                                    {quarter}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="filter-button"
                        onClick={fetchData}
                        aria-label="Apply Filters for Start and End Quarter/Year"
                    >
                        Apply Filter
                    </button>
                </div>
                </div>
            <div className="LossGraph-container">
                
                <div className="LossGraph-chart">
                    <div className="chart-container" ref={chartRef}>
                        {forecastDetails && (
                            <div className="forecast-details">
                                <p><strong>VSD Disease Loss:</strong> {forecastDetails.severity_range[0]}</p>
                                <p><strong>Severity Level:</strong> {getSeverityLevel(forecastDetails.severity_range[0])}</p>
                            </div>
                        )}
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    title: {
                                        display: true,
                                        text: 'Production Against Loss Due to Vascular Streak Dieback (VSD) (2024 and Beyond)',
                                    },
                                    legend: {
                                        display: true,
                                        position: 'top',
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: (tooltipItem) =>
                                                `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(2)}`, // 2 decimal precision
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
                                            callback: (value) => value.toFixed(2), // 2 decimal precision for y-axis
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                <div className="refresh-button-container">
                    <button className="refresh-button" onClick={fetchData}>Refresh Data</button>
                </div>
            </div>
        </>
    );
};

export default LossGraph;
