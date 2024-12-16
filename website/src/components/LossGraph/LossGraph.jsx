import React, { useState, useEffect, useRef } from 'react';
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
    const chartRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/production-losses');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch data');

            const forecastResponse = await fetch('/api/forecast-losses');
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

            if (filteredData.dates.length > 0) {
                setChartData({
                    labels: filteredData.dates,
                    datasets: [
                        {
                            label: 'Production (Raw)',
                            data: filteredData.production_raw,
                            backgroundColor: '#5a9',
                            borderColor: '#4d8',
                            borderWidth: 1,
                            barThickness: 'flex',
                        },
                        {
                            label: 'Loss',
                            data: filteredData.adjusted_production,
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

    // Initial data fetch when the component mounts
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

    if (loading) return <div className="bar-chart loading">Loading...</div>;
    if (error) return <div className="bar-chart error">Error: {error}</div>;

    if (!chartData) return null; // Do not render the graph if no data

    const getSeverityLevel = (severityRange) => {
        const severityValue = parseInt(severityRange); // Convert the severity range (e.g. "5%" -> 5)
        if (severityValue >= 1 && severityValue <= 3) return 'Low';
        if (severityValue >= 4 && severityValue <= 6) return 'Moderate';
        if (severityValue >= 7 && severityValue <= 10) return 'Severe';
        return 'Mixed';
    };

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

        <div className="LossGraph-container">
            
            <div className="LossGraph-chart">
                <div className="chart-container" ref={chartRef}>
                    {/* Display VSD Details */}
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
                                    display: true, // Keep legend to distinguish datasets
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
                                        text: 'Production (in units)',
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

                
            </div>{/* Refresh Button */}
                <div className="refresh-button-container">
                    <button className="refresh-button" onClick={fetchData}>Refresh Data</button>
                </div>
        </div>
        </>
    );
};

export default LossGraph;
