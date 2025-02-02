import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import './ReportData.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportTable = ({ csvUploaded, severityChanged, setSeverityChanged }) => {
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [isReadyToDownload, setIsReadyToDownload] = useState(false); // State to track if report is ready
    const tableRef = useRef(null);

    const fetchReportData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/report_data`, { method: 'GET' });
            const result = await response.json();
    
            if (!response.ok) {
                throw new Error(result.error || 'Error fetching report data');
            }
            setReportData(result);
            setShowTable(true); // Show table after fetching data
            setIsReadyToDownload(true); // Mark report as ready for download
            setSeverityChanged(false); // Reset severityChanged state
        } catch (err) {
            setError(err.message);
            toast.error(`Error fetching report data: ${err.message}`, {
                position: 'top-center',
                autoClose: 2000,
                theme: 'colored',
            });
        }
    };

    const handleDownloadPdf = async () => {
        if (!tableRef.current) return;
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.width;
    
            const topMargin = 15; 
            const leftMargin = 15;
            const rightMargin = 15;
            const contentWidth = pageWidth - leftMargin - rightMargin;
    
            // Title
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            const title = "Cacao Fruit Production Damage Impact Report";
            const titleWidth = pdf.getTextWidth(title);
            pdf.text(title, (pageWidth - titleWidth) / 2, topMargin);
    
            // Add a line under the title
            pdf.setLineWidth(0.5);
            pdf.line(leftMargin, topMargin + 5, pageWidth - rightMargin, topMargin + 5);
    
            // Metadata
            const { severity_label, severity_value, loss_percentage, data, next_8_quarters_forecast, adjusted_production, actual_losses } = reportData;
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
    
            // Left-aligned text
            pdf.text(`Severity Level: ${severity_label}`, leftMargin, topMargin + 15);
            pdf.text(`Loss Percentage: ${loss_percentage}%`, leftMargin, topMargin + 23);
    
            // Right-aligned text
            const rightTextStart = pageWidth - rightMargin;
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Loss Measured`, rightTextStart, topMargin + 15, { align: 'right' });
    
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Low   =     1% - 3%`, rightTextStart, topMargin + 20, { align: 'right' });
            pdf.text(`Moderate   =     4% - 6%`, rightTextStart, topMargin + 24, { align: 'right' });
            pdf.text(`Severe   =   7% - 10%`, rightTextStart, topMargin + 28, { align: 'right' });
    
            // Data Table
            const tableData = data.map(row => [
                row.date,
                row.value.toFixed(2),
                row.adjusted_production.toFixed(2),
                row.loss.toFixed(2),
            ]);
            const tableColumns = ["Date", "Raw Production", "Adjusted Production", "Actual Losses"];
            pdf.autoTable({
                startY: topMargin + 30,
                head: [tableColumns],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontSize: 10 },
                bodyStyles: { fontSize: 10, cellPadding: 3 },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                styles: { halign: 'center', valign: 'middle' },
                margin: { left: leftMargin, right: rightMargin },
            });
    
            // Next Quarters Forecast Table
            if (next_8_quarters_forecast && next_8_quarters_forecast.length > 0) {
                pdf.addPage();
                pdf.setFontSize(14);
                const forecastTitle = "Next 8 Quarters Forecast";
                pdf.text(forecastTitle, (pageWidth - pdf.getTextWidth(forecastTitle)) / 2, topMargin);
    
                const forecastData = next_8_quarters_forecast.map((forecast, index) => [
                    forecastDates[index],
                    forecast.toFixed(2),
                    adjusted_production[index]?.toFixed(2),
                    actual_losses[index]?.toFixed(2),
                ]);
                
                const forecastColumns = ["Date", "Expected Production", "Adjusted Production", "Actual Losses"];
                pdf.autoTable({
                    startY: topMargin + 10,
                    head: [forecastColumns],
                    body: forecastData,
                    theme: 'striped',
                    headStyles: { fillColor: [39, 174, 96], textColor: [255, 255, 255], fontSize: 10 },
                    bodyStyles: { fontSize: 10, cellPadding: 3 },
                    alternateRowStyles: { fillColor: [245, 245, 245] },
                    styles: { halign: 'center', valign: 'middle' },
                    margin: { left: leftMargin, right: rightMargin },
                });
            }
    
            // Footer
            const pageCount = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.setTextColor(150);
                pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pdf.internal.pageSize.height - 10, { align: 'center' });
            }
    
            // Save PDF
            pdf.save('ProductionLossReport.pdf');
        } catch (error) {
            toast.error('Failed to generate PDF.', {
                position: 'top-center',
                autoClose: 2000,
                theme: 'colored',
            });
        }
    };
    

    useEffect(() => {
        fetchReportData();
    }, [csvUploaded, severityChanged]);  // Fetch data when CSV is uploaded or severity changes

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!reportData) {
        return null;
    }

    const { severity_label, severity_value, loss_percentage, data, next_8_quarters_forecast, adjusted_production, actual_losses } = reportData;

    const lastDate = data[data.length - 1].date;
    const startDate = new Date(lastDate);
    if (startDate.getMonth() === 0) {
        startDate.setFullYear(startDate.getFullYear());
        startDate.setMonth(3);
    } else {
        startDate.setMonth(startDate.getMonth() + 3);
    }

    const forecastDates = [];
    for (let i = 0; i < 8; i++) {
        const forecastDate = new Date(startDate);
        forecastDate.setMonth(forecastDate.getMonth() + i * 3);
        const formattedDate = forecastDate.toISOString().split('T')[0];
        forecastDates.push(formattedDate);
    }

    return (
        <>
            <div className="table-actions">
                {isReadyToDownload && !severityChanged && (
                    <button onClick={handleDownloadPdf} className="download-button">
                        Download Report as PDF
                    </button>
                )}
            </div>

            {showTable && (
                <div className="report-table-container">
                    <div ref={tableRef}>
                        <h2>Production Loss Report</h2>
                        <p><strong>Severity Level:</strong> {severity_label} (Value: {severity_value})</p>
                        <p><strong>Loss Percentage:</strong> {loss_percentage}%</p>

                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Raw Production</th>
                                    <th>Adjusted Production</th>
                                    <th>Loss</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.date}</td>
                                        <td>{row.value.toFixed(2)}</td>
                                        <td>{row.adjusted_production.toFixed(2)}</td>
                                        <td>{row.loss.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {next_8_quarters_forecast && (
                            <>
                                <h3>Next 8 Quarters Forecast</h3>
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Expected Production</th>
                                            <th>Adjusted Production</th>
                                            <th>Actual Losses</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {next_8_quarters_forecast.map((forecast, index) => (
                                            <tr key={index}>
                                                <td>{forecastDates[index]}</td>
                                                <td>{forecast.toFixed(2)}</td>
                                                <td>{adjusted_production[index]?.toFixed(2)}</td>
                                                <td>{actual_losses[index]?.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ReportTable;