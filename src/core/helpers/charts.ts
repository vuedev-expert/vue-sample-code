import {ActionStatusColor} from "@/core/models/action.model";
import {Risk, RiskStatusColor, RiskStatusText} from "@/core/models/risk.model";
import {LegalRegister} from "@/core/models/legislation.model";
import Highcharts from "highcharts";
import { RiskMatrixExposureLevel } from "@/core/models/risk-matrix.model";

const monthOrder: string[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
type RiskStatusType = {
    createdAt?: string | Date,
    status: string
}
type LegisLibType = {
    createdAt?: string | Date,
    orgControls: any[]
}
type LegisCountType = { [key: string]: { withCtrl:number, withoutCtrl:number } }

export function addGaugeLabels(exposureLevels :RiskMatrixExposureLevel[]) {
    const gaugeLabels = exposureLevels?.map(exposure => exposure.name)
    gaugeLabels.forEach((label :string, i :number) => {
        const riskLegend = document.getElementById(`${label}Risk`)
        const riskText = document.getElementById(`${label}RiskLine`)
        const ctrlLegend = document.getElementById(`${label}Ctrl`)
        const ctrlText = document.getElementById(`${label}CtrlLine`)
        if (riskLegend && riskText && ctrlLegend && ctrlText) {
            riskLegend.style.backgroundColor = gaugeChartOptions.yAxis.plotBands[i].color
            riskText.innerText = gaugeChartOptions.yAxis.plotBands[i].label
            ctrlLegend.style.backgroundColor = gaugeChartOptions.yAxis.plotBands[i].color
            ctrlText.innerText = gaugeChartOptions.yAxis.plotBands[i].label
        }
    })
}

export function calculateActionData(actionData :any) {
    actionData = actionData.filter((action :any) => {
        if (action.key !== 'IN_REVIEW') return action
    })
    const labels = actionData.map((item :any) => item.key)
    return {
        labels,
        colors: labels.map((val :any) => ActionStatusColor[val]),
        values: actionData.map((item :any) => item.value),
    }
}

function filteringRisks(risks :RiskStatusType[], selectedFilter :number | string) {
    let label :string[] = [], data :any = []
    let sortedData :any, prevMonth :string
    const statuses = ['Total Risks', 'OPEN', 'AWAITING_REVIEW','ACCEPTED', 'NOT_ACCEPTED', 'CLOSED', 'DRAFT']
    if (selectedFilter == 0) {
        const monthCounts = risks.reduce((acc :any, item :any) => {
            const month = new Date(item.createdAt).toLocaleString('default', { month: 'long' });
            const status = item.status;
            if (!acc[month]) acc[month] = { total: 0 };  // If month does not exist in the accumulator object, create it
            if (!acc[month][status]) acc[month][status] = 0;  // If status does not exist in the month object, create it
            acc[month][status]++;  // Increment the count for the given status in the given month
            return acc;
        }, {});

        const sortedData = Object.entries(monthCounts)
            .sort(([month1], [month2]) => monthOrder.indexOf(month1.slice(0, 3).toUpperCase()) - monthOrder.indexOf(month2.slice(0, 3).toUpperCase()))
            .reduce((acc :any, [key, value] : [string, any]) => {
                acc[key.slice(0, 3).toUpperCase()] = value;
                acc[key.slice(0, 3).toUpperCase()]['total'] = Object.values(value).reduce((a :any, b :any) => a + b, 0)
                return acc;
            }, {});

        label = Object.keys(sortedData)
        data = statuses.map((status :string, index) => {
            let dataArr = Object.keys(sortedData).map(month => {
                if (index === 0) return sortedData[month]['total'] || 0
                return sortedData[month][status] || 0
            })
            if (dataArr.every(value => value === 0)) dataArr = []
            if (index === 0) {
                return {
                    fill: false,
                    pointRadius: new Array(dataArr.length).fill(0),
                    pointStyle: 'circle',
                    lineTension: 0.5,
                    data: dataArr,
                    label: 'Total Risks',
                    backgroundColor: '#3459AB',
                    borderColor: '#3459AB',
                }
            }
            return {
                fill: false,
                pointRadius: new Array(dataArr.length).fill(0),
                pointStyle: 'circle',
                lineTension: 0.5,
                data: dataArr,
                label: RiskStatusText[status as keyof typeof RiskStatusText],
                backgroundColor: RiskStatusColor[status as keyof typeof RiskStatusColor],
                borderColor: RiskStatusColor[status as keyof typeof RiskStatusColor],
            };
        });
        const currIndex = monthOrder.indexOf(label[0])
        if (currIndex > -1 && label.length <= 2) {
            if (currIndex  === 0) prevMonth = monthOrder[11]
            else prevMonth = monthOrder[currIndex - 1]
            label.unshift(prevMonth)
            data.forEach((obj :any) => obj.data.unshift(0))
        }
    }
    else if (selectedFilter == 1) {
        const yearCounts = risks.reduce((acc :any, item :any) => {
            const year = new Date(item.createdAt).getFullYear().toString()
            const status = item.status;
            if (!Object.prototype.hasOwnProperty.call(acc, year)) acc[year] = { total: 0 }
            if (!acc[year][status]) acc[year][status] = 0;
            acc[year][status]++;
            return acc
        }, {});

        if (Object.keys(yearCounts).length < 2) {
            sortedData = Object.entries(yearCounts)
                .reduce((acc: any, [key, value]: [string, any]) => {
                    acc[key] = value;
                    acc[key]['total'] = Object.values(value).reduce((a: any, b: any) => a + b, 0)
                    return acc;
                }, {});
        } else {
            sortedData = Object.entries(yearCounts)
                .sort(([month1], [month2]) => month2.localeCompare(month1))
                .reduce((acc: any, [key, value]: [string, any]) => {
                    acc[key] = value;
                    acc[key]['total'] = Object.values(value).reduce((a: any, b: any) => a + b, 0)
                    return acc;
                }, {});
        }
        label = Object.keys(sortedData)
        data = statuses.map((status :string, index) => {
            let dataArr = Object.keys(sortedData).map(year => {
                if (index === 0) return sortedData[year]['total'] || 0
                return sortedData[year][status] || 0
            })
            if (dataArr.every(value => value === 0)) dataArr = []
            if (index === 0) {
                return {
                    fill: false,
                    pointRadius: new Array(dataArr.length).fill(0),
                    pointStyle: 'circle',
                    lineTension: 0.5,
                    data: dataArr,
                    label: 'Total Risks',
                    backgroundColor: '#3459AB',
                    borderColor: '#3459AB',
                }
            }
            return {
                fill: false,
                pointRadius: new Array(dataArr.length).fill(0),
                pointStyle: 'circle',
                lineTension: 0.5,
                data: dataArr,
                label: RiskStatusText[status as keyof typeof RiskStatusText],
                backgroundColor: RiskStatusColor[status as keyof typeof RiskStatusColor],
                borderColor: RiskStatusColor[status as keyof typeof RiskStatusColor],
            };
        });
        if (label.length < 2) {
            prevMonth = (parseInt(label[0]) - 1).toString()
            label.unshift(prevMonth)
            data.forEach((obj :any) => obj.data.unshift(0))
        }
    }
    else if (selectedFilter == 2) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // Get current month (1-indexed)
        const filteredData = risks.filter((obj :any) => {
            const createdAtDate = new Date(obj.createdAt);
            return createdAtDate.getMonth() + 1 === currentMonth; // Compare month with current month
        });
        const weekCounts = filteredData.reduce((acc :any, obj :any) => {
            const createdAtDate = new Date(obj.createdAt);
            const weekNumber = Math.ceil(createdAtDate.getDate() / 7)
            const weekLabel = `Week ${weekNumber}`
            const status = obj.status
            if (!Object.prototype.hasOwnProperty.call(acc, weekLabel)) acc[weekLabel] = { total: 0 }
            if (!acc[weekLabel][status]) acc[weekLabel][status] = 0;
            acc[weekLabel][status]++;
            return acc
        }, {});

        if (Object.keys(weekCounts).length < 2) {
            sortedData = Object.entries(weekCounts)
                .reduce((acc: any, [key, value]: [string, any]) => {
                    acc[key] = value;
                    acc[key]['total'] = Object.values(value).reduce((a: any, b: any) => a + b, 0)
                    return acc;
                }, {});
        } else {
            sortedData = Object.entries(weekCounts)
                .sort(([week1], [week2]) => week1.localeCompare(week2))
                .reduce((acc: any, [key, value]: [string, any]) => {
                    acc[key] = value;
                    acc[key]['total'] = Object.values(value).reduce((a: any, b: any) => a + b, 0)
                    return acc;
                }, {});
        }
        label = Object.keys(sortedData)
        data = statuses.map((status :string, index) => {
            let dataArr = Object.keys(sortedData).map(week => {
                if (index === 0) return sortedData[week]['total'] || 0
                return sortedData[week][status] || 0
            })
            if (dataArr.every(value => value === 0)) dataArr = []
            if (index === 0) {
                return {
                    fill: false,
                    pointRadius: new Array(dataArr.length).fill(0),
                    pointStyle: 'circle',
                    lineTension: 0.5,
                    data: dataArr,
                    label: 'Total Risks',
                    backgroundColor: '#3459AB',
                    borderColor: '#3459AB',
                }
            }
            return {
                fill: false,
                pointRadius: new Array(dataArr.length).fill(0),
                pointStyle: 'circle',
                lineTension: 0.5,
                data: dataArr,
                label: RiskStatusText[status as keyof typeof RiskStatusText],
                backgroundColor: RiskStatusColor[status as keyof typeof RiskStatusColor],
                borderColor: RiskStatusColor[status as keyof typeof RiskStatusColor],
            };
        });
        if (label.length === 1) {
            label.unshift("")
            data.forEach((obj: any) => obj.data.unshift(0))
        }
    }
    return {
        label,
        data
    }
}

export function calculateLegalRegister(legislations :LegalRegister[], selectedFilter :number | string) {
    const legislationsMap :LegisLibType[] = legislations.map(({ createdAt, orgControls }:LegalRegister) => ({ createdAt, orgControls }))
    const result = filteringLegislations(legislationsMap, selectedFilter)
    let chartData :any = []
    chartData = [
        {
            fill:false,
            pointRadius: new Array(5).fill(0),
            pointStyle: 'circle',
            lineTension: 0.5,
            label: 'Registered',
            backgroundColor: '#3AA0FF',
            borderColor: '#3AA0FF',
            data: result.data
        },
    ]

    if (result.label?.length < 2) {
        if (selectedFilter == 0) {
            const currIndex = monthOrder.indexOf(result.label[0])
            let prevMonth :string = ''
            if (currIndex > -1) {
                if (currIndex  === 0) prevMonth = monthOrder[11]
                else prevMonth = monthOrder[currIndex - 1]
                result.label.unshift(prevMonth)
                result.data.unshift(0)
            }
        }
        if (selectedFilter == 1) {
            let prevYear: string = ''
            prevYear = (parseInt(result.label[0]) - 1).toString()
            result.label.unshift(prevYear)
            chartData[0].data.unshift(0)
        }
        if (selectedFilter == 2) {
            result.label.unshift("")
            result.data.unshift(0)
        }
    }

    return {
        months: result.label || [],
        data: chartData || []
    }
}

function filteringLegislations(legislations :LegisLibType[], selectedFilter :number | string) {
    let label :string[] = [], data :number[] = [], sortedData :any = []
    if (selectedFilter == 0) {
        const monthCounts :LegisCountType = legislations.reduce((acc :any, legis :any) => {
            const month = new Date(legis.createdAt).toLocaleString('default', { month: 'long' })
            if (!acc[month]) acc[month] = { withCtrl: 0, withoutCtrl: 0 }
            acc[month].withCtrl++
            // else acc[month].withoutCtrl++
            return acc
        }, {});

        sortedData = Object.entries(monthCounts)
            .sort(([month1], [month2]) => monthOrder.indexOf(month1.slice(0, 3).toUpperCase()) - monthOrder.indexOf(month2.slice(0, 3).toUpperCase()))
            .reduce((acc :any, [key, value] : [string, any]) => {
                acc[key.slice(0, 3).toUpperCase()] = value
                return acc;
            }, {});
        data = Object.values(sortedData).map((monthData :any) => monthData.withCtrl || 0)
        label = Object.keys(sortedData)
    }
    else if (selectedFilter == 1) {
        const yearCounts :LegisCountType = legislations.reduce((acc :any, legis :any) => {
            const year = new Date(legis.createdAt).getFullYear().toString()
            if (!Object.prototype.hasOwnProperty.call(acc, year)) acc[year] = { withCtrl: 0, withoutCtrl: 0 }
            // else acc[year].withoutCtrl++
            acc[year].withCtrl++
            return acc
        }, {});

        if (Object.keys(yearCounts).length > 1) {
            sortedData = Object.keys(yearCounts).sort((a: string, b: string) => b.localeCompare(a))
        } else  sortedData = Object.keys(yearCounts)
        data = Object.values(yearCounts).map((yearData :any) => yearData.withCtrl || 0)
        label = sortedData
    }
    else if (selectedFilter == 2) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // Get current month (1-indexed)
        const filteredData = legislations.filter((obj :any) => {
            const createdAtDate = new Date(obj.createdAt);
            return createdAtDate.getMonth() + 1 === currentMonth; // Compare month with current month
        });

        const weekCounts :LegisCountType = filteredData.reduce((acc :any, obj :any) => {
            const createdAtDate = new Date(obj.createdAt);
            const weekNumber = Math.ceil(createdAtDate.getDate() / 7)
            const weekLabel = `Week ${weekNumber}`
            if (!Object.prototype.hasOwnProperty.call(acc, weekLabel)) acc[weekLabel] = { withCtrl: 0, count: 0 }
            // else acc[weekLabel].withoutCtrl++
            acc[weekLabel].withCtrl++
            return acc
        }, {});

        let sortedWeeks :LegisCountType = {}
        if (Object.keys(weekCounts).length > 1) {
            sortedData = Object.keys(weekCounts).sort()
            sortedData.forEach((key: string) => sortedWeeks[key] = weekCounts[key])
        } else {
            sortedWeeks = weekCounts
            sortedData = Object.keys(weekCounts)
        }
        data = Object.values(sortedWeeks).map((weekData :any) => weekData.withCtrl || 0)
        label = sortedData
    }
    return {
        data,
        label
    }
}

export function calculateRiskRegister(risks :Risk[], selectedFilter :number | string) {
    const risksMap :RiskStatusType[]  = risks.map(({ createdAt, status }:Risk) => ({ createdAt, status }))
    // const removedStatuses :string[] = []
    // const statusesData = risksMap.filter((item :RiskStatusType) => !removedStatuses.includes(item.status))
    let result :{ label: string[], data: any[] } = { label: [], data: [] }
    if (risksMap?.length) result  = filteringRisks(risksMap, selectedFilter)
    return {
        labels: result.label || [],
        data: result.data || []
    }
}

export function calculateGaugeChart(exposureLevels :any) {
    let result :any = []
    const expoLen = exposureLevels.length * exposureLevels.length
    result = exposureLevels.map((exposure :any) => ({
        from: exposure.fromValue,
        to: exposure.toValue,
        color: exposure.color,
        thickness: 35,
        label: exposure.name
    }))
    const toIntervals = result.map((data :any) => data.to)
    const fromIntervals = result.map((data :any) => data.from)
    if (Math.max(...toIntervals) !== expoLen) {
        result.push({
            from: Math.max(...toIntervals),
            to: expoLen,
            color: '#d7d5d5',
            thickness: 35,
            label: 'Blank'
        })
    }
    toIntervals.push(expoLen)
    toIntervals.unshift(fromIntervals[0])
    gaugeChartOptions.yAxis.tickPositions = toIntervals
    gaugeChartOptions.yAxis.min = Math.min(...fromIntervals)
    gaugeChartOptions.yAxis.max = expoLen
    gaugeChartOptions.yAxis.plotBands = result
}

export const gaugeChartOptions = {
    credits: { enabled: false },
    chart: {
        type: 'gauge',
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false,
        height: 250,
        margin: [0, 15, 25, 15]
    },
    legend: {
        enabled: true, // make sure the legend is enabled
        labelFormatter: function() {
            return 'pop'; // set the label to the series name
        }
    },
    title: {
        text: '',
        style: {
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontSize: '16px',
            lineHeight: '24px',
            fontWeight: '500',
            color: ''
        },
        x: -65, y: 20
    },
    pane: {
        startAngle: -90,
        endAngle: 89.9,
        background: null,
        center: ['50%', '70%'],
        size: '110%'
    },
    yAxis: {
        min: 1,
        max: 100,
        tickPixelInterval: 'auto',
        tickPositions: [],
        tickColor: '#FFFFFF',
        tickLength: 10,
        tickWidth: 0,
        minorTickInterval: null,
        labels: {
            distance: -45,
            style: { fontSize: '10px' }
        },
        plotBands: [{
            from: 0,
            to: 100,
            color: '#969897',
            thickness: 35,
            label: 'Low',
        }]
    },
    series: [
        {
            name: 'Score',
            data: [0],
            tooltip: { valueSuffix: '' },
            dataLabels: {
                useHTML: true,
                format: '<div style="text-align: center;">' +
                    '<span class="score-count">{y}</span>' +
                    '<span class="score">Score</span>' +
                    '</div>',
                borderWidth: 0,
                color:
                    (Highcharts.defaultOptions.title &&
                        Highcharts.defaultOptions.title.style &&
                        Highcharts.defaultOptions.title.style.color) ||
                    '#333333',
                style: { fontSize: '16px' }
            },
            dial: {
                radius: '50%',
                backgroundColor: 'gray',
                baseWidth: 10,
                baseLength: '0%',
                rearLength: '0%'
            },
            pivot: { backgroundColor: 'gray', radius: 5 }
        }
    ]
}

export const riskDeptChartOptions = {
    credits: { enabled: false },
    legend: {
        align: 'right',
        verticalAlign: 'top',
        layout: 'horizontal',
        y: -40
    },
    chart: {
        type: 'column',
        style: {
            borderRadius: '6px',
            background: '#FFFFFF',
            boxShadow: '0px 4px 20px rgba(13, 10, 44, 0.08)',
            padding: '0'
        },
        height: 344
    },
    title: {
        text: '&nbsp;',
        useHTML: true,
        align: 'high',
    },
    yAxis: {
        tickInterval: 2,
        labels: {
            style: {
                fontFamily: 'Poppins',
                fontStyle: 'normal',
                fontSize: '14px',
                fontWeight: '400',
                color: '#615E83'
            }
        },
        title: { text: '' },
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat:
            '<div style="display: flex; justify-content: space-between;"><span style="color:{series.color};">{series.name}: </span>' +
            '<span><b>{point.y}</b></span>' +
            '</div>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
}

export const actionChartOptions = {
    responsive: true,
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            usePointStyle: true,
            // pointStyleWidth: 12, pointStyleHeight: 12,
            padding: 20
        }
    },
    plugins: {
        title: {
            display: true,
            text: 'Action Management',
            position: 'top',
            margin: {
                left: -10
            }
        }
    },
    maintainAspectRatio: true,
    tooltips: {
        callbacks: {
            label: function (tooltipItem: any, data: any) {
                const dataset = data.datasets[tooltipItem.datasetIndex]
                const label = data.labels[tooltipItem.index]
                const value = dataset.data[tooltipItem.index]
                return label + ': ' + value + '%'
            }
        }
    }
}

export const legislationUpdatePieChart = {
    ...actionChartOptions,
    plugins: {
        title: {
            display: false
        }
    }
}

export const legStackedBarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    height: 340,
    layout: {
        padding: {
            left: 10,
            right: 10,
            top: 30,
            bottom: 4
        }
    },
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                usePointStyle: true,
                padding: 20
            }
        }
    },
    scales: {
        x: {
            stacked: true,
            gridLines: {
                display: false
            }
        },
        y: {
            stacked: true,
            ticks: {
                min: 0,
                max: 25,
                stepSize: 5
            }
        }
    },
    borderRadius: 7
}

export const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    tooltips: {
        mode: 'nearest',
        intersect: false,
    },
    hover: {
        mode: 'nearest',
        intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontColor: 'black',
          colors: ['#3459AB', '#2BA676', '#E95380'],
          padding: 20
        }
      }
    },
    height: 490,
    scales: {
        x: {
            grid: {
                display: false
            }
        },
        y: {
            ticks: {
                min: 0,
                max: 100,
                stepSize: 5,
                precision: 0,
                callback: function (value:any) {
                    if (Number.isInteger(value)) {
                        return value.toString();
                    } else {
                        return '';
                    }
                }
            },
        }
    }
}

