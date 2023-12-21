
import React,{useState, useContext, useEffect, useCallback, useLayoutEffect} from 'react';

import {
    
    httpPut,
    httpPost,
    httpDelete,
    useForceUpdate, 
    selectionSort,
    getDateStrFormat,
    hoursToTimeStr,
    timeStrToHours
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


import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from "moment";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { BACKEND_URL } from '../App.js';

import { CountContext } from './counts.js';
import { ActivityContext } from './activities.js';
import { DayContext } from '../App.js';
import { TimeContext } from './times.js';
import { ScaleContext } from './scales.js';
import { ChecklistContext } from './checklists.js';


import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import dayjs from 'dayjs';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);




const formatName = (name, count) => `${name} ID ${count}`;


function CustomEventWrapper(props) {
  // Some data that you might have inserted into the event object
  // const eventDiv = React.cloneElement(props.children.props.children, {}, customDiv);
  // const wrapper = React.cloneElement(props.children, {}, eventDiv);
  return (
    <div>
    <p>{props.title}</p>
    <p>{props.event.note}</p>
    </div>
  );
}




export function TimeEditor(props){





  const activityContext = useContext(ActivityContext);
  const timeContext = useContext(TimeContext);
  const countContext = useContext(CountContext);
  const scaleContext = useContext(ScaleContext);
  const checklistContext = useContext(ChecklistContext);
  const dayContext = useContext(DayContext);

  /*
  Functionality:

  - Add/Change current day
  - Display timegraph of last month

  steps:
  0. Display current day form on the left


  Current day form:
  0. Make an option to select which day to change (by default the current day), check if DB has an entry for that day, if not then display empty form.
  1. Filter out all the active times, scales, counts and activities.
  2. No need to show the actual limits or anything, there will just be one form control per item, they will however be interpreted differently
     - The activities will be interpreted in normal floating point hours
     - The Time will be converted as above
     - The count and scale will be sent as is
  3. There will be a 'note' field under each day where you can write something specific to that day



  Functionality 2.0
  - Drag and drop configured activities


  TODO:
  0. Make sure that event data gets posted as soon as an event is added, resized, moved and when the note is changed, there's no latency issues to worry about anyway so why not.
  1. Make functions out of the hour-float to string (and vice-versa) procedures.
  2. Get started on the dashboard
  3. create a flag on events (planned) to mark if an event is actual or if its planned, so that you can also add planned actitivties.
     just add a flag to the showEventNote form and set planned events opacity to 0.5, eventually you could add a template for the "perfect day".
     see if you can change the "agenda" to only include planned events: https://github.com/jquense/react-big-calendar/issues/1147

  4. Make the active flag matters
  5. Instead of clicking the event and having a delete button, add a delete button (with secondary_color) on the event itself
  7. See if you can add a  "time pointer" just like there is a line pointing to the current time, this would be awesome for our time limits.
     Possibly we can have a panel with switches like "Show time limits", "Min and max", etc.

  8. Consider having a side-menu popup instead when you select a day, in order to show stats about actual/desired hours spent, etc. Only applicable on
     activities that have a daily timescale. Or you could add these when you hover over the day.

  9. Possibly adding a flag to each activity indicating that it is a negative or positive activity, i.e the user wants to spend as little/much time on it
     as possible, this would be used to if min or max is the desired hours.


  SERIOUS QUESTION: should we have an event model (with start-end time mapping) instead of a Day model?
  - activities could be written in terms of events
  - as well as Times
  - But not scales and not Counts

  it's probably best that we simply do as we planned.


  */



  const forceUpdate = useForceUpdate();

  let formats = {
    timeGutterFormat: 'HH:mm',
  }

  const [myEvents, setMyEvents] = useState([]);


  const [counters, setCounters] = useState({ item1: 0, item2: 0 })
  const [draggedEvent, setDraggedEvent] = useState()

  const [selectedEvent, setSelectedEvent] = useState({});
  const [showEventNote, setShowEventNote] = useState(false);
  const [currentDate, setCurrentDate] = useState();

  const [showChangeDay, setShowChangeDay] = useState(false);
  const [changeDayData, setChangeDayData] = useState({"scales": {}, "counts": {}, "times":{}, "checklists":{} });
  const [selectedDay, setSelectedDay] = useState("");
  const [days, setDays] = useState(dayContext.data);

  useEffect(() => {
    let eventArr = [];
    days.map((obj) => {
      if (obj == undefined){
        return;
      }
      if (obj.activities.length > 0)
      {
        obj.activities.map((event) => {
          let e = event;
          e.start = new Date(e.start);
          e.end = new Date(e.end);
          eventArr.push(e);
        })
      }

    })
    setMyEvents(eventArr);

  }, []);


  useEffect(() => {

    days.forEach((obj, idx) => {
      if (obj.id == undefined){
        httpPost(BACKEND_URL + '/day/', obj).then((resData) => {
          let newDays = days;
          newDays[idx] = resData;
          setDays(newDays);
        })
      }else {
        httpPut(`${BACKEND_URL}/day/${obj.id}/`, obj);
      }


    })

  }, [days]);

  const handleDragStart = useCallback((event) => setDraggedEvent(event), [])

  const resizeEvent = useCallback(
    ({ event, start, end }) => {
      setMyEvents((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {};
        const filtered = prev.filter((ev) => ev.id !== event.id);

        return [...filtered, { ...existing, start, end }]
      })


      let day = getDateStrFormat(start);

      // Remove old  one
      let newDays = days.map((obj, idx) => {
        let newActivities = obj.activities.filter((aObj, aIdx) => {
          if (aObj.id != event.id){
            return aObj;
          }
        })


        obj.activities = newActivities;
        return obj;

      });

      let found = false;
      newDays = newDays.map((obj, idx) => {

        if (obj.date == day){
          found = true;
          obj.activities.push({...event, start, end});
          return obj;
        }else {
          return obj;
        }
      })


      if (!found){
            newDays.push({"date": getDateStrFormat(start), "scales": {}, "checklists": {},"times": {},"counts": {}, "activities": [{...event, start, end}] });
      }

      setDays(newDays);


    },
    [setMyEvents, days, myEvents]
  )


  const moveEvent = useCallback(
    ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
      const { allDay } = event
      if (!allDay && droppedOnAllDaySlot) {
        event.allDay = true
      }

      let prevEvent;
      setMyEvents((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {};
        const filtered = prev.filter((ev) => ev.id !== event.id);

        return [...filtered, { ...existing, start, end, allDay }]
      });

      let day = getDateStrFormat(start);

      // Remove old  one
      let newDays = days.map((obj, idx) => {
        let newActivities = obj.activities.filter((aObj, aIdx) => {
          if (aObj.id != event.id){
            return aObj;
          }
        })


        obj.activities = newActivities;
        return obj;

      });

      let found = false;
      newDays = newDays.map((obj, idx) => {
        if (obj.date == day){
          found = true;
          obj.activities.push({...event, start, end, allDay});
          return obj;
        }else {
          return obj;
        }
      })


      if (!found){
        newDays.push({"date": getDateStrFormat(start), "scales": {}, "checklists":{}, "times": {},"counts": {}, "activities": [{...event, start, end, allDay}] });
      }

      setDays(newDays);

    },
    [setMyEvents, days, myEvents]
  )


  const newEvent = useCallback(
    (event, newId) => {
      let id;
      setMyEvents((prev) => {

        return [...prev, { ...event, id: newId }];
      });


    },
    [setMyEvents]
  )

  const onDropFromOutside = useCallback(
    ({ start, end, allDay: isAllDay }) => {
      if (draggedEvent === 'undroppable') {
        setDraggedEvent(null)
        return
      }

      const { name } = draggedEvent
      const event = {
        title: name,
        note: "",
        start,
        end,
        isAllDay,
      }
      setDraggedEvent(null)
      setCounters((prev) => {
        const { [name]: count } = prev
        return {
          ...prev,
          [name]: count + 1,
        }
      })

      const idList = myEvents.map((item) => item.id);
      let id;
      if (idList.length == 0)
      {
        id = 0;
      }else {
        id = Math.max(...idList) + 1;
      }

      newEvent(event, id);
      let day = getDateStrFormat(start);

      let found = false;
      let newDays = days.map((obj, idx) => {
        if (day == obj.date){
          obj["activities"].push({...event, id});
          found = true;
          return obj;
        }else {
          return obj;
        }

      })

      if (found){
        setDays(newDays);
      }else {
        newDays.push({"date": getDateStrFormat(start), "scales": {}, "checklists": {}, "times": {},"counts": {}, "activities": [{...event, id}] });
        setDays(newDays);
      }




    },
    [draggedEvent, counters, setDraggedEvent, setCounters, newEvent]
  )

  const deleteEventFromDay = async (eventId, selectedDay) => {

    return new Promise((resolve, reject) => {
      let data = {"scales": {}, "checklists": {},"counts": {}, "times": {}, "activities": []};
      data["date"] = selectedDay;

      //Get all events of this particular day
      let selectedDayActivities = [];

      let oldEventIdx;
      myEvents.forEach((obj, idx) => {
        let startDate = obj.start;
        let dateStr = `${startDate.getDate()}/${startDate.getMonth()+1}/${startDate.getFullYear()}`

        if (dateStr == selectedDay){

          if (eventId != obj.id){
            selectedDayActivities.push(obj);
          }
        }



      })

      data["activities"] = selectedDayActivities;

      //Is there entry for this day in backend?
      let newDay = true;
      let index;
      days.map((obj, idx) => {

        if (obj.date == data["date"]){
          newDay = false;
          index = idx;
          data["id"] = obj.id;
          data["scales"] = obj.scales;
          data["checklists"] = obj.checklists
          data["counts"] = obj.counts;
          data["times"] = obj.times;

        }


      })

      let dayData = days;
       // httpPut(`${BACKEND_URL}/day/${data.id}/`, data       
      httpPut(`${BACKEND_URL}/day/${data.id}/`, data).then((retData) => {
        dayData[index] = data;
        setDays(dayData);
        resolve();
      });


    })



  }

  const addEventToDay = (event, selectedDay) => {


    return new Promise((resolve, reject) => {
      let data = {"scales": {}, "checklists": {},"counts": {}, "times": {}, "activities": []};
      data["date"] = selectedDay;

      //Get all events of this particular day
      let selectedDayActivities = [];

      let oldEventIdx;
      myEvents.forEach((obj, idx) => {
        let startDate = obj.start;
        let dateStr = `${startDate.getDate()}/${startDate.getMonth()+1}/${startDate.getFullYear()}`

        if (dateStr == selectedDay){
          selectedDayActivities.push(obj);
        }



      })



      selectedDayActivities.push(event);






      data["activities"] = selectedDayActivities;

      //Is there entry for this day in backend?
      let newDay = true;
      let index;
      days.map((obj, idx) => {

        if (obj.date == data["date"]){
          newDay = false;
          index = idx;
          data["id"] = obj.id;
          data["scales"] = obj.scales;
          data["checklists"] = obj.checklists;
          data["counts"] = obj.counts;
          data["times"] = obj.times;

        }


      })

      let dayData = days;

      if (newDay){

        httpPost(BACKEND_URL + '/day/',data).then((resData) => {
          dayData.push(resData);
          setDays(dayData);

          resolve();
        });
      }else {
                        // httpPut(`${BACKEND_URL}/day/${data.id}/`, data) 
        httpPut(`${BACKEND_URL}/day/${data.id}/`, data).then((retData) => {
          dayData[index] = data;
          setDays(dayData);
          resolve();
        });
      }

    })

}


  const onSelectSlot = (slotInfo: {
    start: stringOrDate;
    end: stringOrDate;
    slots: Date[] | string[];
    action: 'select' | 'click' | 'doubleClick';
  }) => {

     let selected = getDateStrFormat(slotInfo.start);
     days.forEach((obj) => {

       let newObj = {};
       if (obj.date == selected){
         newObj["counts"] = obj.counts;
         newObj["scales"] = obj.scales;
         newObj["checklists"] = obj.checklists;

         newObj["times"] = structuredClone(obj.times);
         Object.keys(obj.times).map((key) => {
           let n = obj.times[key];
           newObj["times"][key] = hoursToTimeStr(n);

         })


         setChangeDayData(newObj);
       }
     })





     setSelectedDay(selected);
     setShowChangeDay(!showChangeDay);

  };


  const handleShowChangeDay = (event) => {
    if (showChangeDay == true){
      setChangeDayData({"scales": {}, "checklists": {},"counts": {}, "times":{}});
    }

    setShowChangeDay(!showChangeDay);


  }


  const handleChangeDay = (event) => {

    if (!(event.target == undefined))
    {
      // const index = parseInt(event.target.attributes.index.nodeValue);
      let key = event.target.name;
      let value = event.target.value;
      let itemType = event.target.attributes.itemType.nodeValue;

      if (value == undefined)
      {
        value = event.target.attributes.value.nodeValue;
      }

        
        

      let items = changeDayData[itemType];
      items[key] = itemType != "checklists" ? value : !items[key];
    

      setChangeDayData({...changeDayData, [itemType]: items});
      forceUpdate();
    }





  }

  const handleSubmitChangeDay = (event) => {
    event.preventDefault();


    let data = {};
    data["date"] = selectedDay;
    data["times"] = {};


    //findme
    let err = false;
    Object.keys(changeDayData.times).map((key) => {
      let val = changeDayData.times[key];
      data["times"][key] = timeStrToHours(val);
    })

    data["scales"] = changeDayData["scales"];
    data["counts"] = changeDayData["counts"];
    data["checklists"] = changeDayData["checklists"];


    //Get all events of this particular day
    let selectedDayActivities = [];
    myEvents.forEach((obj) => {
      let startDate = obj.start;
      let dateStr = `${startDate.getDate()}/${startDate.getMonth()+1}/${startDate.getFullYear()}`

      if (dateStr == selectedDay)
      {
        selectedDayActivities.push(obj);
      }

    })

    data["activities"] = selectedDayActivities;

    //
    let newDay = true;
    days.map((obj) => {
      if (obj.date == data["date"]){
        newDay = false;
        data["id"] = obj.id;
      }
    })

    if (newDay){
      //addDay(data);
      httpPost(BACKEND_URL + '/day/', data);
    }else {
      httpPut(`${BACKEND_URL}/day/${data.id}/`, data);
    }



    setChangeDayData({"scales": {}, "checklists": {},"counts": {}, "times":{}});
    setShowChangeDay(!showChangeDay);







  }

  const handleDeleteDay = (event) => {

    let id = event.target.name;
    if (id != null){
      httpDelete(`${BACKEND_URL}/day/${id}/`).then(() => {
        setShowChangeDay(!showChangeDay);
        let toDelete;
        let newData = days.filter((obj) => {
          if (obj.id != id){
            return obj;
          }else {
            toDelete = obj.date;
          }
        })

        forceUpdate();
        setDays(newData);


        let newEvents = myEvents.filter((obj) => {

            let eventDate  = `${obj.start.getDate()}/${obj.start.getMonth()+1}/${obj.start.getFullYear()}`;
            if (toDelete != eventDate){
              return obj;
            }

        })



        setMyEvents(newEvents);
        setChangeDayData({"scales": {}, "checklists": {},"counts": {}, "times":{}});


      })

    }

  }

  const eventPropGetter = (event, start, end, isSelected) => {
    let activity;
    activityContext.data.forEach((obj) => {
      if (obj.name == event.title){
        activity = obj;
      }
    })

    if (activity != undefined){

        let style = {
          backgroundColor: activity.primary_color,
          borderColor: activity.primary_color,
          color: activity.secondary_color
        }

        return {
          style: style
        }

    }

  }

  const handleEventSelection = (event) => {
    setSelectedEvent(event);
    setShowEventNote(!showEventNote);



  };

  const handleHideEventNote = (event) => {
    // addEventToDay(selectedEvent,  getDateStrFormat(selectedEvent.start));

    let newDays = days.map((obj) => {
      let newActivities = obj.activities.map((aObj) => {
        if (selectedEvent.id == aObj.id){
          aObj.note = selectedEvent.note;
          return aObj;
        }else {
          return aObj;
        }
      });
      obj.activities = newActivities;
      return obj;
    });

    setDays(newDays);

    setSelectedEvent({});
    setShowEventNote(!showEventNote);




  }


  const onChangeEventNote = (event) => {
    let val = event.target.value;

    let newEvents = myEvents.map((obj) => {
      if (obj.id == selectedEvent.id){
        obj.note = val;
        return obj;
      }else {
        return obj;
      }
    })


    setMyEvents(newEvents);

  }


  const handleDeleteEvent = (event) => {

    let newEvents = myEvents.filter((obj) => {
      if (obj.id != selectedEvent.id){
        return obj;
      }
    })

    let newDays = days.map((obj, idx) => {
      let newActivities = obj.activities.filter((aObj) => {
        if (selectedEvent.id != aObj.id){
          return aObj;
        }
      })

      obj.activities = newActivities;
      return obj;

    })


    setShowEventNote(!showEventNote);
    setSelectedEvent({});
    setMyEvents(newEvents);
    setDays(newDays);




  }

  return (
    <div className="d-flex">
    <div className="inner bg-dark text-light" style={{width:"20%", borderTop: "1px solid gray", padding: "20px"}}>
      <h4 style={{textAlign: "center"}}>Activities</h4>

      {activityContext.data.map((obj, idx) => {
        if (obj.active){
          return (
            <div

              draggable="true"
              key={obj.name}
              onDragStart={() =>
                handleDragStart({ name: obj.name })
              }
              className="d-flex justify-content-center"
              style={{textAlign: "center", backgroundColor: obj.primary_color, width: "100%", minHeight: "40px", maxHeight: "auto", padding: "10px", marginTop: "10px"}}
            >
            <p style={{color: obj.secondary_color, marginBottom: "0px", marginTop: "0px", textAlign: "center"}}>
              {obj.name}
            </p>
            </div>
          )
        }
      })

      }



    </div>

    <div className="App" style={{width:"80%"}}>
      <DnDCalendar

        defaultDate={moment().toDate()}
        formats={formats}
        defaultView="week"
        events={myEvents}
        localizer={localizer}

        components={{
          event: CustomEventWrapper
        }}

        onDropFromOutside={onDropFromOutside}
        onEventDrop={moveEvent}
        onEventResize={resizeEvent}
        eventPropGetter={eventPropGetter}
        onSelectEvent={handleEventSelection}

        selectable={true}
        onSelectSlot={onSelectSlot}

        resizable
        style={{ height: "100vh" }}
      />
    </div>

    <Modal
      show={showChangeDay}
      onHide={handleShowChangeDay}
      animation={false}
      dialogClassName="w-50 h-100"
      dialogAs="div"
      backdrop={true}
      backdropClassName="h-100 d-flex justify-content-end"
      className="d-flex justify-content-end"
      >

      <Modal.Header className="bg-dark text-white" closeButton>
        <Modal.Title>Edit day {selectedDay}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmitChangeDay}>
        <Modal.Body className="bg-dark text-white d-flex">

        <div style={{width: "40%", marginRight: "5%"}}>
        <div style={{marginTop: "50px", marginBottom: "50px", width: "400px"}}>

            { checklistContext.data && checklistContext.data.length > 0 && checklistContext.data.find((obj) => obj.active) &&
                <Form.Group>
                  <Form.Label><h5>Checklist</h5></Form.Label>
                </Form.Group>
            }

            { checklistContext.data && checklistContext.data.length > 0 && checklistContext.data.map((obj, idx) => {

              if (obj.active){
                console.log("CHECKLISTS: ", obj.name, changeDayData["checklists"][obj.name]);
                return (
                  <>

                    <Form.Group className="mb-3 d-flex flex-row">
                    <span style={{width: "80%"}}>{obj.name}</span> <Form.Check style={{width: "80%"}} type="checkbox" name={obj.name} checked={changeDayData["checklists"][obj.name] != undefined && changeDayData["checklists"][obj.name] || false} itemType="checklists" onChange={handleChangeDay}/>
                    </Form.Group>


                  </>
                );
              }

            }) }

        </div>

        { countContext.data && countContext.data.length > 0 && countContext.data.find((obj) => obj.active) &&
            <Form.Group>
              <Form.Label><h5>Counts</h5></Form.Label>
            </Form.Group>
        }

        { countContext.data && countContext.data.length > 0 && countContext.data.map((obj, idx) => {

          if (obj.active){
            return (
              <>
                <Form.Label>{obj.name}</Form.Label>

                <Form.Group className="mb-3">
                      <Form.Control style={{width: "80%"}} type="number" name={obj.name} value={changeDayData["counts"][obj.name]} itemType="counts" onChange={handleChangeDay}/>

                </Form.Group>


              </>
            );
          }

        }) }

        { scaleContext.data && scaleContext.data.length > 0 && scaleContext.data.find((obj) => obj.active) &&
            <Form.Group className="mt-3">
              <Form.Label><h5>Scales (1-100)</h5></Form.Label>
            </Form.Group>
        }

        { scaleContext.data && scaleContext.data.length > 0 && scaleContext.data.map((obj, idx) => {
          // <p className="text-info mt-2">{obj.description}</p>
        

          if (obj.active){
            return (
              <>
                <Form.Label>{obj.name}</Form.Label>
                <Form.Group className="mb-3">
                        
                        <Form.Range value={changeDayData["scales"][obj.name]} onChange={handleChangeDay} itemType="scales" name={obj.name}/>
                 </Form.Group>
                </>
            );
          }

        }) }

        { timeContext.data && timeContext.data.length > 0 && timeContext.data.find((obj) => obj.active) &&
            <Form.Group className="mt-3">
              <Form.Label><h5>Times (hh:mm)</h5></Form.Label>
            </Form.Group>
        }

        { timeContext.data && timeContext.data.length > 0 && timeContext.data.map((obj, idx) => {
          // <p className="text-info mt-2">{obj.description}</p>
          
          if (obj.active){
            console.log("DATE: ", selectedDay);
            console.log(obj.name, changeDayData["times"][obj.name]); 
            let now = dayjs(`${selectedDay} ${changeDayData["times"][obj.name]}`, "DD/MM/YYYY hh:mm");
            console.log(now);
            return (
              <>
             <Form.Label>{obj.name}</Form.Label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MobileTimePicker ampm={true} defaultValue={now} name={obj.name} className="bg-light form-control" onChange={(data, event) => {

            console.log(data, obj);
            let items = changeDayData["times"];
            let h = data["$H"];
            let m = data["$m"];

            h = h <= 9 ? `0${h}`: h;
            m = m <= 9 ? `0${m}`: m;
            items[obj.name] = `${h}:${m}`;
            console.log(items[obj.name]);

            
            //
            }}/>  
            </LocalizationProvider>

              </>
            );

          }

        }) }
        </div>

        <div className="mt-5 d-flex-inline">
          { days.length > 0 && days.map((obj) => {

            if (obj.date == selectedDay){
              return activityContext.data.map((aObj) => {
                let dailyTotal = 0;

                // 1. For every event matching the current activity, get the total hours spent.
                // 2. Once you have total hours for each day. Display that next to minimum hours

                obj.activities.forEach((event) => {
                  if (event.title == aObj.name){
                    let diffMs = event.end - event.start;
                    let diffH = ((diffMs/1000)/60)/60;

                    //Round to two decimals at max
                    diffH = Math.round(diffH * 10)/10;
                    dailyTotal+=diffH;
                  }

                });



                let displayColor = "text-muted";



                if (aObj.positive){


                  if (dailyTotal >= aObj.minimum && dailyTotal < aObj.maximum){
                    displayColor = "text-success"
                  }else {

                    if (dailyTotal >= (aObj.minimum)*0.75){
                      displayColor = "text-warning";
                    }else {
                      displayColor = "text-danger";
                    }

                    if (dailyTotal >= aObj.maximum && aObj.maximum > 0 ){
                      displayColor = "text-warning"
                    }

                  }

                  if (aObj.minimum == 0){
                    displayColor = "text-muted";
                  }

                  return <h4 className={"mt-1 " + displayColor}>{aObj.name}: {dailyTotal} / {aObj.minimum}h</h4>
                }else {

                  if (dailyTotal == aObj.maximum){
                    displayColor = "text-warning";
                  }

                  if (dailyTotal > aObj.maximum){
                    displayColor = "text-danger";
                  }

                  if (aObj.maximum == 0){
                    displayColor = "text-muted";
                  }

                  return <h4 className={"mt-1 " + displayColor}>{aObj.name}: {dailyTotal} / {aObj.maximum}h</h4>
                }




              })

            }

          }) }

        </div>
        </Modal.Body>

        <Modal.Footer className="bg-dark text-white">
          <Button variant="primary" type="submit" onClick={handleSubmitChangeDay}>Update</Button>
          {days.map((obj) => {
            if (obj != undefined){
              if (selectedDay == obj.date){
                return <Button variant="danger" onClick={handleDeleteDay} name={obj.id}>Clear day</Button>
              }
            }
            })}


        </Modal.Footer>
      </Form>
    </Modal>



    <Modal show={showEventNote} onHide={handleHideEventNote} centered>
      <Modal.Header className="bg-dark text-white" closeButton>
        <Modal.Title>Edit note</Modal.Title>
      </Modal.Header>

      <Form>
        <Modal.Body className="bg-dark text-white">
          <Form.Group>
            <Form.Label><h3>{selectedEvent.title}</h3></Form.Label>
          </Form.Group>
          <Form.Group className="mt-3">
              <Form.Control type="text" as="textarea" value={selectedEvent.note} onChange={onChangeEventNote} style={{minWidth: "200px", minHeight: "200px"}}/>
          </Form.Group>

        </Modal.Body>
        <Modal.Footer className="bg-dark text-white">
          <Button variant="primary" onClick={handleHideEventNote}>Close</Button>
          <Button variant="danger" onClick={handleDeleteEvent}>Delete event</Button>
        </Modal.Footer>
      </Form>
    </Modal>


    </div>
  )
}
                // <Form.Group className="mb-3">
                //   <Form.Control style={{width: "80%"}} type="text" name={obj.name} value={changeDayData["times"][obj.name]} itemType="times" onChange={handleChangeDay}/>
                // </Form.Group>
