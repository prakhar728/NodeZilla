import React, { useCallback, useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { GetOperatorData } from '../services/nodezilla';

const LineComponent = ({ operatorAddress }) => {
    const [operatorData, setOperatorData] = useState([]);
    const [avsName, setAvsName] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [timestamps, settimestamps] = useState([]);
    const [datasets, setdatasets] = useState([]);


    ChartJS.register(...registerables);

    const options = {
        responsive: true,
        plugins: {
            legend: {
            position: 'top',
            },
            title: {
            display: true,
            text: 'TVL Data Over Time',
            },
        },
        scales: {
            xAxis: {
            title: {
                display: true,
                text: 'Timestamp',
            },
            },
            yAxis: {
            title: {
                display: true,
                text: 'TVL',
            },
            },
        },
    };

    const fetchOperatorsData = useCallback(async (operatorAddress) => {
    try {
        setLoading(true);
        const data = await GetOperatorData(operatorAddress);

        setOperatorData(data);
    } catch (error) {
        console.error("Error fetching operators' data:", error);
    } finally {
        setLoading(false);
    }
    }, []);

    useEffect(() => {
        if (operatorAddress) {
          fetchOperatorsData(operatorAddress);
        }
    }, [operatorAddress, fetchOperatorsData]);


    useEffect(() => {
        if (operatorData) {
          let time_series = operatorData.time_series;
      
          if (time_series && time_series.length) {
            let values = time_series.map(t => {
              let val = t['value']
              val['timestamp'] = t['timestamp'];
              delete val['total_TVL']
              return val;
            });
    
            const notNeeded = ['operator_contract_address', 'operator_name', 'num_stakers', 'timestamp'];
    
            // Extracting labels
            const ex = time_series[0];
            const value = ex['value'];
            const keys = Object.keys(value)
            const labels = keys.filter(k => !notNeeded.includes(k));
    
            // Extracting time series values
            const datasets = labels.map((key, index) => ({
              label: key,
              data: values.map(entry => {
                let d = entry[key]
                delete d['timestamp']
                delete d['num_stakers']
                return d
              }),
              borderColor: `hsl(${index * 40}, 70%, 50%)`, // Generate a color based on index
              backgroundColor: `hsla(${index * 40}, 70%, 50%, 0.2)`,
              fill: false,
            }));
    
            setdatasets(datasets)
    
            // Extracting timestamps
            let ts = time_series.map(t => formatDate(t['value']['timestamp']));
            settimestamps(ts);
          }
        } 
      }, [operatorData])

    const formatDate = (dateString) => {
        if (!dateString) return 'Invalid Date';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
    if (timestamps && timestamps.length) {
        let cData = {
        labels: timestamps,
        datasets: datasets,
        }

        setChartData(cData);
    }
    }, [timestamps])

  return (
    <>
    {chartData && 
        <Line data={chartData} options={options} />
    }
    </>
  )
}

export default LineComponent