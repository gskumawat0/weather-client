import React, {Component} from 'react';
import { apiCall } from "../services/api";
import Chart from "chart.js";
import moment from 'moment';

class Charts extends Component{
    ChartRef = React.createRef();
    state={
        intervalId: '',
        cityName: 'Jaipur',
        data: {
            tempArr: [],
            humidityArr: [],
            pressureArr: []
        }
    }
    componentDidMount(){
        let intervalId = setInterval(this.getWeatherData, 60000);

        this.setState([
            intervalId
        ])
    }

    componentWillUnmount(){
        clearInterval(this.state.intervalId);
    }

    getWeatherData = ()=>{
        let {REACT_APP_WEATHER_APP_ID: APPID} = process.env;
        let {cityName} = this.state
        let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName},IN&APPID=${APPID}`;

        apiCall('get', apiUrl, undefined)
        .then((data)=>{
            if(data.cod !== 200){
                throw Error(data.message)
            }
            let {name: cityName, main: {temp, pressure, humidity}} = data;
            this.insertData({cityName, humidity, temp, pressure})
        })
        .catch((err)=>{
            console.log(err)
        })
    }

    insertData = ({cityName, humidity, temp,pressure})=>{
        let {data } = this.state;
        let pressureArr = this.newData(pressure * 0.00098692326671601, data.pressureArr) //in atms
        let tempArr = this.newData(temp - 273.15 , data.tempArr) //in celsius
        let humidityArr = this.newData(humidity, data.humidityArr)

        this.setState({
            cityName,
            data: {
                pressureArr, humidityArr, tempArr
            }
        })
    }

    newData = (data, dataArr)=>{
        if(dataArr.length === 30){
            let arr = [data, ...dataArr.slice(0,-1)];
            return arr;
        }
        else{
            return [data, ...dataArr]
        }
    }

    handleChange = (e)=>{
        let {name, value} = e.target;
        this.setState({
            [name]: value
        })
    }

    submitCity = (e)=>{
        e.preventDefault();
        this.setState({
            data: {
                tempArr: [],
                pressureArr: [],
                humidityArr: []
            }
        })
        this.getWeatherData();
    }

    getXAxisLabels = ()=>{
        let labels = [];
        let date = moment();
        for (let i = 0; i < 20; i++){
            labels.push(date.subtract(i * 10, 'seconds').valueOf())
        }
        return labels;
    }

    createChart = ()=>{
        if(this.chart){
            this.chart.destroy();
        }
        let chartContext = this.ChartRef.current.getContext('2d');
        let {tempArr, pressureArr, humidityArr} = this.state.data;
        let xAxisLabels = this.getXAxisLabels()
        // console.log(tempArr)
        // debugger
        this.chart =  new Chart(chartContext, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'temperature (c)',
                        data: tempArr,
                        borderColor: '#FC427B',
                        fill: false,
                        lineTension: 0.5
                    },
                    {
                        label: 'pressure (atm)',
                        data: pressureArr,
                        borderColor: '#6D214F',
                        fill: false,
                        lineTension: 0.5

                    },
                    {
                        label: 'humidity (%)',
                        data: humidityArr,
                        borderColor: '#182C61',
                        fill: false,
                        lineTension: 0.5

                    }
                ],
                labels: xAxisLabels
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 200
                        },
                        
                    }],
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'minute',
                            tooltipFormat: 'LLLL',
                            stepSize: 1
                            
                        },
                        ticks: {
                            // max: Date.now(),
                            // min: moment().subtract(30, 'minutes').valueOf()
                        },
                        bounds: 'labels',
                    }]
                },
                ticks: {
                    reverse: false,
                    stepSize: 1
                },
            }
        });
    }

    render(){
        let {cityName} = this.state;
        return (
            <div className='w-50 mx-auto mt-5'>
                <div>
                    <form onSubmit={this.submitCity}>
                        <div className="form-group row">
                            <label htmlFor="city" className="col-sm-2 col-form-label">Enter Your City: </label>
                            <div className="col-sm-8">
                                <input type="text" className="form-control" id="city" placeholder="your city"  name='cityName'
                                onChange={this.handleChange} value={cityName} />
                            </div>
                            <div className='col-sm-2'>
                                <button type='submit' className='btn btn-primary '>submit</button>
                            </div>
                        </div>
                    </form>
                </div>
                <div>
                    <canvas id='category' ref={this.ChartRef} />
                    { this.ChartRef.current ? this.createChart() : null}
                </div>

            </div>
        )
    }
}

export default Charts;