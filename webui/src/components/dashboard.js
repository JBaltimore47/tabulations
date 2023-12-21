
import React,{useState, useContext, useEffect, useCallback, useLayoutEffect} from 'react';

import {
    
    httpPut,
    httpPost,
    httpDelete,
    selectionSort
} from '../util.js';

import {
  Button,
  Nav,
  Navbar,
  Container,
  Form,
  Row,
  Col,
  NavDropdown,
  Table,
  Dropdown,
  OverlayTrigger, //for popup texts
  Tooltip, //for "popup texts"
  Modal, //for popup options
  Spinner //for loading animations

} from "react-bootstrap";





import {
    Charts,
    ChartContainer,
    ChartRow,
    YAxis,
    LineChart,
    Baseline,
    BarChart,
    AreaChart,
    styler
} from "react-timeseries-charts";

import { TimeSeries, TimeRange } from "pondjs";

import { CountContext } from './counts.js';
import { ActivityContext } from './activities.js';
import { DayContext } from '../App.js';





export function Dashboard(props){

  let today = new Date();

  const countContext = useContext(CountContext);
  const activityContext = useContext(ActivityContext);
  const dayContext = useContext(DayContext);
  const [isLoading, setIsLoading] = useState(true);
  const [countTimeData, setCountTimeData] = useState([]);
  const [activityTimeData, setActivityTimeData] = useState([]);

  const [showAllActivities, setShowAllActivities] = useState(true);
  const [displaySelectActivities, setDisplaySelectActivities] = useState(false);
  const [displayTimeForm, setDisplayTimeForm] = useState({
    "to_date": `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`,
    "from_date": `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}` ,
    "timescale": "days"

  });


  const [displayTimeSeries, setDisplayTimeSeries] = useState();


  /*
  TODO:

  1. Scales timegraph
  2. Activities graph
  3. Give counts a random colors at creation and use it in the graph so it's constant
  4. Create a separate timerange independent of any of the counts
  5. Display upper count limits based on the timescale configured,


  TWO DIFFERENT OPTIONS: pick the time range (to date from date), and pick the scale to display it in (days, weeks or months)



  */

  useEffect(() => {


    let sortMap = {};
    dayContext.data.forEach((dObj, idx) => {

        let dateParts = dObj.date.split("/");
        let date = `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
        let ts = new Date(date).getTime();
        console.log(dObj);
        sortMap[idx] = ts;
    }) 
    console.log(sortMap);
    let indices = Object.keys(sortMap);
    let timestamps = Object.values(sortMap);

    selectionSort(indices, timestamps, timestamps.length);

    let sortedDayData = indices.reverse().map((idx) => {
        return dayContext.data[parseInt(idx)];
    })



    let activityData = [];
    activityContext.data.forEach((obj) => {

      let timeSeries = {
        "name": obj.name,
        "columns": ["index", "value"],
        "points": []
      };

      let currObj = {
        "name": obj.name,
        "max": obj.maximum,
        "min": obj.minimum,
        "display": showAllActivities,
        "activitySum": 0,
        "style": styler([
          {
            key: "value",
            color: obj.primary_color,
            secondary_color: obj.secondary_color,

            // area: {
            //     normal: {fill: obj.primary_color, stroke: "none", opacity: 0.75},
            //     highlighted: {fill: "red", stroke: "none", opacity: 0.75},
            //     selected: {fill: "red", stroke: "none", opacity: 0.75},
            //     muted: {fill: obj.primary_color, stroke: "none", opacity: 0.25}
            // },
            // line: {
            //     normal: {fill: obj.primary_color, stroke: "none", opacity: 0.75},
            //     highlighted: {fill: "black", stroke: "none", opacity: 0.75},
            //     selected: {fill: "black", stroke: "none", opacity: 0.75},
            //     muted: {fill: obj.primary_color, stroke: "none", opacity: 0.25}
            // }
          }])

      }


      if (obj.active){
        
        //1. Create key-val map with date timestamp mapped to index in the original array. 
        //2. selectionSort the array
        //3. Build the new dayData array
        //4. Continue as usual
        
        sortedDayData.forEach((dObj) => {


          let dateParts = dObj.date.split("/");
          let date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T00:00`;
          // let date = new Date(dateParts[2], dateParts[1]-1,  dateParts[0]);


          let activities = dObj.activities.filter((aObj) => aObj.title == obj.name);
          let activityH = 0;
          if (!(activities.length < 1)){

            activities.forEach((activity) => {
              let start = new Date(activity.start);
              let end = new Date(activity.end);

              let diffMs = end - start;
              let diffH = ((diffMs/1000)/60)/60;
              activityH += diffH;

            })



            currObj.activitySum += activityH;
            let arr = [date];
            arr.push(activityH);
            timeSeries.points.push(arr);



          }else {

            let arr = [date];
            arr.push(0);
            timeSeries.points.push(arr);


          }


        })
        console.log(timeSeries);
        try {
          let ts = new TimeSeries(timeSeries)
          currObj["timeseries"] = ts.fill({fieldSpec: ["value"], method: "zero"});
        } catch (error){
            alert(String(error));
        }
        activityData.push(currObj);

      }



    })

    // Sort activity data based on amount of hours spent on it (for the stacked chart to display in a good way)
    // let activitySums = activityData.map((obj) => obj.activitySum);

    // Create a mapping between name and activitySum
    let keyVal = {};
    activityData.forEach((obj) => {
      let name = obj["name"];
      keyVal[name] = obj.activitySum;
    });

    let keys = Object.keys(keyVal);
    let vals = Object.values(keyVal);

    selectionSort(keys, vals, vals.length );

    let activityData2 = [];
    keys.forEach((name) => {
      let activity = activityData.find((obj) => obj.name == name);
      activityData2.push(activity);
    })


    let countData = [];
    countContext.data.forEach((obj) => {

      let timeSeries = {
        "name": obj.name,
        "columns": ["time", "value"],
        "points": []
      };

      let randColor = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
      let randColor2 = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
      let currObj = {
        "name": obj.name,
        "limit": obj.limit,
        "style": styler([
          {
            key: "value",
            color: randColor

          }])

      }


      if (obj.active) {

        sortedDayData.forEach((dObj) => {

          let dateParts = dObj.date.split("/");
          // let date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T00:00`;
          let date = new Date(dateParts[2], dateParts[1]-1,  dateParts[0]);



          let arr = [date];
          if (dObj.counts[obj.name] != undefined){
            arr.push(parseInt(dObj.counts[obj.name]));
          }

          timeSeries.points.push(arr);

        })

        currObj["timeseries"] = new TimeSeries(timeSeries);

        countData.push(currObj);

      }



    })



    setDisplayTimeSeries(countData[0].timeseries)
    setCountTimeData(countData);
    setActivityTimeData(activityData2);
    setIsLoading(false);

  }, []);



  /*
  1. Have a timegraph, with option to show last week, last month and last year.
  2. Have a panel to the left that allows you to pick which activities, counts and scales are being displayed.
  3. In addition, theres going to be general stats for the selected time period, like how many hours you put in each activity, etc.
     How bad/good you are doing in terms of the limits you've set up.


  4. Probably we will need to have a different chart for activities, counts and scales, as they have different axis's. Possibly we can just
  display all three of them next to eachother.




  Most of the more advanced statistics will only be applicable on a weekly, monthly or yearly basis. This will simply be a dashboard to track your progress over time.
  https://software.es.net/react-timeseries-charts/#/
  https://software.es.net/react-timeseries-charts/#/example/baselines


  */



const handleChangeTimeForm = (event) => {
  let name = event.target.name;
  let val = event.target.value;
  setDisplayTimeForm({...displayTimeForm, [name]: val});
}

const handleSubmitTimeForm = (event) => {
  event.preventDefault();

  setIsLoading(true);
  // Build timeseries
  let _fromDate = displayTimeForm["from_date"].split("-");
  let _toDate = displayTimeForm["to_date"].split("-");

  let fromDate = new Date(_fromDate[0], _fromDate[1]-1, _fromDate[2]);
  let toDate = new Date(_toDate[0], _toDate[1]-1, _toDate[2]);




  let timeSeries = {
    "name": "displayTimeSeries",
    "columns": ["time"],
    "points": []
  };


  for (let currentDate = fromDate; currentDate <= toDate; currentDate.setDate(currentDate.getDate() + 1)) {
      let test = structuredClone(currentDate);
      // let curr = new Date(currentDate[2], currentDate[1]-1,  currentDate[0])
      timeSeries.points.push([test]);
  }


  let newTimeSeries = new TimeSeries(timeSeries);

  setDisplayTimeSeries(newTimeSeries);


  setIsLoading(false);

}



const selectActivityToggleHandler = (isOpen, metadata) => {
  if (metadata.source == "click" || metadata.source == "rootClose"){
    setDisplaySelectActivities(!displaySelectActivities);
  }

}

const onChangeSelectActivity = (event) => {

  let name = event.currentTarget.id;
  let newActivities = activityTimeData.map((obj) => {

    if (obj.name == name){
      obj.display = !obj.display;
      return obj;
    }else {
      return obj;
    }

  })


  setActivityTimeData(newActivities);


}

const onChangeSelectAllActivities = (event) => {

  let newActivities = activityTimeData.map((obj) => {

          obj.display = !showAllActivities;
          return obj;

  })

  setActivityTimeData(newActivities);
  setShowAllActivities(!showAllActivities);

}

if (!isLoading && countTimeData.length > 0 && activityTimeData.length > 0) {

  return (

    <>
    <div className="d-flex bg-dark" style={{width: "100%"}}>
    <div style={{height:"1000px", width: "30%",  padding: "20px"}} className="bg-dark text-light">
    <Form onSubmit={handleSubmitTimeForm}>
      <Form.Group>
        <Form.Label>From date: </Form.Label>
        <Form.Control className="bg-dark text-light" name="from_date" type="date" value={displayTimeForm["from_date"]} onChange={handleChangeTimeForm}/>
      </Form.Group>
      <Form.Group className="mt-3">
        <Form.Label>To date: </Form.Label>
        <Form.Control className="bg-dark text-light" name="to_date" type="date" value={displayTimeForm["to_date"]} onChange={handleChangeTimeForm}/>
      </Form.Group>

      <Form.Group className="mt-3">
        <Form.Control as="select" name="timescale" value={displayTimeForm["timescale"]} className="bg-dark text-light" onChange={handleChangeTimeForm}>
          <option value="days">days</option>
          <option value="weeks">weeks</option>
          <option value="months">months</option>
        </Form.Control>
      </Form.Group>

      <Form.Group className="mt-3">

      <Button variant="primary" type="submit">Apply</Button>

      </Form.Group>
    </Form>


    </div>

    <div id="chart_data" className="bg-dark d-flex-inline">
      <div>
      <h3 className="text-light">Counts</h3>

      <ChartContainer timeRange={displayTimeSeries.timerange()} format="%b '%d">

          <ChartRow height="400" width="800">
              <YAxis
                  id="num"
                  label="num (n)"
                  min={0} max={6}
                  width="60" format=".1f"
                  type="linear"
                  />
              <Charts>
                { countTimeData.map((key, idx) => {
                  return (
                    <LineChart
                        axis="num"
                        style={countTimeData[idx].style}
                        series={countTimeData[idx].timeseries}
                         />


                  )
                }) }
                { countTimeData.map((obj, idx) => {
                  let displayLimit = `${obj.name} (upper limit)`;
                  return (
                    <Baseline axis="num" style={countTimeData[idx].style} value={parseInt(countTimeData[idx].limit)} label={displayLimit} position="right"/>
                  )
                }) }

              </Charts>
          </ChartRow>
      </ChartContainer>

      <div className="d-flex justify-content-around" style={{width: "1000px"}}>

      { countTimeData.map ((obj, idx) => {
        return (
          <>
          <div className="d-flex">
          <div style={{width: "20px", height: "20px", backgroundColor: obj.style.columnStyles.value.color, marginRight: "10px"}}></div>
          <p className="text-light">{obj.name}</p>
          </div>
          </>
        )
      })}
      </div>
      </div>

      <div>
      <div className="d-flex justify-content-between">
      <h3 className="text-light">Activities</h3>
      <Dropdown show={displaySelectActivities} onToggle={(isOpen, metadata) => selectActivityToggleHandler(isOpen, metadata)}>
        <Dropdown.Toggle variant="warning" id="dropdown-basic">Display</Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={onChangeSelectAllActivities} className="d-flex justiy-content-between border-bottom">
            <Form.Check type="checkbox" checked={showAllActivities} label="Show all"></Form.Check>
          </Dropdown.Item>
          { activityTimeData.map((obj, idx) => {
            // style={{backgroundColor: obj.style.columnStyles.value.color, color: obj.style.columnStyles.value.secondary_color}}
              return (

                <Dropdown.Item onClick={onChangeSelectActivity}  id={obj.name} className="d-flex justiy-content-between">
                  <Form.Check type="checkbox" checked={obj["display"]} label={obj.name}></Form.Check>
                </Dropdown.Item>
              )


          })}

        </Dropdown.Menu>
      </Dropdown>
      </div>
      <ChartContainer timeRange={displayTimeSeries.timerange()} format="%b '%d" style={{marginRight: "50px"}}>



          <ChartRow height="600" width="400">
              <YAxis
                  id="hours"
                  label="hours (n)"
                  min={0}
                  max={16}
                  width="60"
                  type="linear"/>
              <Charts>
              { activityTimeData.map((obj, idx) => {
                if (obj.display){

                  return (
                    <AreaChart
                        axis="hours"
                        style={activityTimeData[idx].style}
                        series={activityTimeData[idx].timeseries}
                        interpolation="curveStepBefore"
                        highlight="black"
                        onHighLightChange={selection => {
                          console.log(selection);
                        }}
                        onSelectionChange={(selection, k) => {
                          console.log(selection, k)
                        }}
                    />
                  )
                }else {
                  return <></>;
                }

              })}
              </Charts>
          </ChartRow>
      </ChartContainer>
      <div className="d-flex justify-content-around">
      { activityTimeData.map ((obj, idx) => {
        if (obj.display){
          return (
            <>
            <div className="d-flex">
            <div style={{width: "20px", height: "20px", backgroundColor: obj.style.columnStyles.value.color, marginRight: "10px"}}></div>
            <p className="text-light">{obj.name}</p>
            </div>
            </>
          )
        }

      })}
      </div>
      </div>


    </div>

    </div>

    </>
  )

}



// <BarChart
// axis="Wanks"
// columns={["Wanks"]}
// series={wankData}
// style={style}
// />



}



