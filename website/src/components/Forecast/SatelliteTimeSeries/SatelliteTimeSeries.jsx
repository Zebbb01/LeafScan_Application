import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import './SatelliteTimeSeries.css';

const SatelliteTimeSeries = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/satellite-data', { withCredentials: true });
                if (!response.ok) throw new Error('Network response was not ok.');

                const data = await response.json();

                if (data.error) throw new Error(data.error);

                // Process data for Plotly
                const productionData = data.map(item => {
                    return {
                        type: 'box',
                        y: [
                            item['min'],
                            item['25%'],
                            item['50%'],
                            item['75%'],
                            item['max']
                        ],
                        name: item['Year'].toString(),
                        boxmean: true,
                    };
                });
                setChartData(productionData);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="satellite-chart loading">Loading...</div>;
    if (error) return <div className="satellite-chart error">Error: {error}</div>;

    return (
        <div className="satellite-chart">
            <h2>Yearly Variations in Cacao Production: Insights from Satellite Data Analysis</h2>
            <div className="chart-container">
            <Plot
    data={chartData}
    layout={{
        title: 'Cacao Production by Year',
        xaxis: { title: 'Year' },
        yaxis: { title: 'Production' },
        boxmode: 'group',
        margin: { t: 40, b: 60, l: 60, r: 40 },
        autosize: true,
    }}
    config={{
        scrollZoom: false, // Disable scroll zooming
        displayModeBar: true, // You can set this to false if you want to hide the toolbar
    }}
    onHover={() => {}}
    style={{ width: "100%", height: "100%" }}
/>

            </div>
        </div>
    );
};

export default SatelliteTimeSeries;