

document.addEventListener("DOMContentLoaded", function() {
    // Get references to each canvas element
    const canvas1 = document.getElementById('Forecasted_Downfall_Canvas');
    const canvas2 = document.getElementById('Soil_Moisture_Canvas');

    // Define data for each graph
    const data1 = {
        labels: ["Initial"],
        datasets: [{
            label: 'Forecasted Downfall (units)',
            data: [0],
            borderWidth: 5,
            borderColor: '#0094FF', // Set line color to blue
            fill: true,
        }]
    };

    const data2 = {
        labels: ["Initial"],
        datasets: [{
            label: 'Soil Moisture (Units)',
            data: [0],
            borderWidth: 5,
            borderColor: 'red', // Set line color to red
            fill: true,
        }]
    };


    // Create a separate line chart for each canvas element
    const chart1 = new Chart(canvas1, {
        type: 'line',
        data: data1,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#061a35',
                        lineWidth: 3,
                    }
                }
            },
            plugins: {
              legend: {
                labels: {
                  boxWidth: 0
                }
              }
            },
        }
    });

    const chart2 = new Chart(canvas2, {
        type: 'line',
        data: data2,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#061a35',
                        lineWidth: 3,
                    }
                },
            },
            plugins: {
              legend: {
                labels: {
                  boxWidth: 0
                }
              }
            },
          }
        });
});

    // Function to update chart data
    function updateChartData(chart, newData) {
        if (!newData || newData.length === 0) {
            console.error('Received empty or undefined data:', newData);
            return;
        }
    
        // Cap the data array length at 20 elements
        const maxDataLength = 20;
    
        // Check if the data array for the chart exceeds the maximum length
        if (chart.data.labels.length >= maxDataLength) {
            // Remove the first element from the data array
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => {
                datasetx.data.shift(); // Remove the first element from each dataset
            });
        }
    
        // Get the current time for the x-axis label
        const currentTime = new Date();
        const hours = currentTime.getHours().toString().padStart(2, '');
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        const seconds = currentTime.getSeconds().toString().padStart(2, '0');
        const timeLabel = `${hours}:${minutes}:${seconds}`;
    
        chart.data.labels.push(timeLabel); // Add the time label to the x-axis
        chart.data.datasets.forEach((dataset, index) => {
            if (newData[index] !== undefined) {
                dataset.data.push(newData[index]); // Add new data to the dataset
            } else {
                console.error(`Received undefined data for dataset ${index}.`);
            }
        });
    
        chart.update(); // Update the chart with the new data and labels
    }
    



    // Function to handle received data and update charts
    function updateCharts(data) {
      // Check if the data array is not empty and if it has exactly one element
      if (data && Array.isArray(data) && data.length === 1) {
          const innerData = data[0]; // Extract the inner array
          if (innerData.length === 5) {
              // Update each chart with corresponding data
              updateChartData(chart1, [innerData[3]]); 
              updateChartData(chart2, [innerData[4]]);       
          } else {
              console.error('Received invalid data:', innerData);
          }
      } else {
          console.error('Received invalid data:', data);
      }
    }



    // EventSource to receive formatted data
    const eventSource = new EventSource('/formattedData');
    eventSource.onmessage = function(event) {
        const eventData = JSON.parse(event.data);
        console.log('Received data:', eventData); // Log received data
        updateCharts(eventData || [0, 0, 0, 0]); // Default to an array with three zeros if eventData is null or undefined
    };


