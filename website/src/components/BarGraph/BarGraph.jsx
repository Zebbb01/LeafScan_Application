import { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2'; // Import Bar chart from react-chartjs-2
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './BarGraph.css';
import Spinner from '../Spinner/SpinnerSticky';

// Register necessary chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarGraph = () => {
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null);  // Reference to the chart container

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/production_by_year`);
                if (!response.ok) throw new Error('Network response was not ok.');

                const data = await response.json();
                if (data.error) throw new Error(data.error);

                // Prepare data for Chart.js
                const productionData = {
                    labels: data.map(item => item.Year),
                    datasets: [{
                        label: 'Production',
                        data: data.map(item => item.Production),
                        backgroundColor: '#5a9',
                        borderColor: '#4d8',
                        borderWidth: 1,
                        barThickness: 'flex', // Makes bars responsive
                    }],
                };
                setChartData(productionData);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Force chart resize when window resizes (no need for manual resize if responsive is set)
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

    if (loading) return <Spinner />;
    if (error) return <div className="bar-chart error">Error: {error}</div>;

    return (
        <div className="bargraph-container">
            <div className="bargraph-description">
                <h2>Cacao Fruit Production</h2>
                <p>This graph showcases all cacao fruit production per the years, providing a clear visual representation of how production has changed over time. By examining this data, we can observe patterns such as increasing or decreasing yields, which are crucial for assessing the long-term viability of cacao farming.</p>
                <p>Such insights are essential for farmers, researchers, and stakeholders to understand how production has been affected by various factors over time.</p>
            </div>
            <div className="bargraph-chart">
                <div className="chart-container" ref={chartRef}>
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'All Cacao Fruit Production Per Year',
                                },
                                legend: {
                                    display: false, // Disable legend if not needed
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (tooltipItem) => `Production: ${tooltipItem.raw.toFixed(2)}`, // Limit decimal to 2 in tooltip
                                    },
                                },
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Year',
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Production (Metric Tons)',
                                    },
                                    beginAtZero: true, // Ensure y-axis starts at 0
                                    ticks: {
                                        callback: (value) => value.toFixed(2), // Limit y-axis ticks to 2 decimal places
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default BarGraph;
