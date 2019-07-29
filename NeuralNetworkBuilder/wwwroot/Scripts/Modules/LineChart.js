/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

function LineChart() {
    var canvas = null;
    var chart = null;

    /**
     * gets the chart settings
     * @rreturns {ChartSettings} chartsettings
     * */
    var getChartSettings = function () {
        return {
            type: 'line',
            showTooltips: true,
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Error',
                        fill: false,
                        backgroundColor: '#1648ee',
                        borderColor: '#1648ee',
                        data: [],
                        borderWidth: 3
                    }
                ]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Training Error'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    bodyFontStyle: 'bold',
                    custom: function (tooltip) {
                        if (!tooltip) return;
                        // disable displaying the color box;
                        tooltip.displayColors = false;
                    },
                    callbacks: {
                        title: function (tooltipItems, data) {
                            return '';
                        },
                        label: function (tooltipItem, data) {
                            return 'Iteration: ' + tooltipItem.label;
                        },
                        afterLabel: function (tooltipItem, data) {
                            return 'Error: ' + tooltipItem.value;
                        },

                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Iteration'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Error'
                        },
                        ticks: {
							/*min: 0,
							max: 100,*/

                            // forces step size to be 5 units
                            //stepSize: 5
                        }
                    }]
                }
            }
        }

    }

    /**
     * Updates the dataset
     * @param {any} label
     * @param {any} data
     */
    this.updateDataset = function (label, data) {
        chart.data.labels.push(label);
        chart.data.datasets[0].data.push(data);
        chart.update();
    }

    /**
     * Resets the chart
     * */
    this.reset = function () {
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.update();
    }

    /**
     * disposes the chart
     * */
    this.dispose = function () {
        chart.destroy();
    }

    /**
     * inits the chart
     * @param {DomObject} elment container to draw the chart into
     */
    this.init = function (elm) {
        canvas = elm;
        var ctx = canvas[0].getContext('2d');
        chart = new Chart(ctx, getChartSettings());
    }
}