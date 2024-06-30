import React, { useCallback, useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { GetOperatorData } from '../services/nodezilla';

const PieChartComponent = ({ operatorAddress }) => {
  const [operatorData, setOperatorData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [totalTVL, setTotalTVL] = useState(0);

  ChartJS.register(...registerables);

  const fetchOperatorData = useCallback(async (address) => {
    try {
      setLoading(true);
      const data = await GetOperatorData(address);
      setOperatorData(data);
    } catch (error) {
      console.error("Error fetching operator's data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (operatorAddress) {
      fetchOperatorData(operatorAddress);
    }
  }, [operatorAddress, fetchOperatorData]);

  useEffect(() => {
    if (operatorData && operatorData.time_series) {
      const timeSeries = operatorData.time_series;

      if (timeSeries.length) {
        const latestEntry = timeSeries[timeSeries.length - 1].value;

        const labels = Object.keys(latestEntry).filter(key => key.endsWith('_TVL') && latestEntry[key] > 0 && key !== 'total_TVL');
        const data = labels.map(label => latestEntry[label]);

        const backgroundColor = labels.map((_, index) => `hsl(${index * 40}, 70%, 50%)`);
        const hoverBackgroundColor = labels.map((_, index) => `hsla(${index * 40}, 70%, 50%, 0.8)`);

        const totalTVL = data.reduce((acc, value) => acc + value, 0);
        setTotalTVL(totalTVL);

        setChartData({
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColor,
            hoverBackgroundColor: hoverBackgroundColor,
          }]
        });
      }
    }
  }, [operatorData]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `TVL Distribution (Total TVL: ${totalTVL})`,
      },
    },
  };

  return (
    <>
      {chartData && 
        <Pie data={chartData} options={options} />
      }
    </>
  );
};

export default PieChartComponent;
