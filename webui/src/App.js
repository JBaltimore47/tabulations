import logo from './logo.svg';
import './App.css';

import React,{useState, useContext, useEffect, useCallback, useLayoutEffect} from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Routes,
  Link,
  NavLink,
  useRouteMatch,
  useParams,
  useNavigate,
  Outlet
} from "react-router-dom";


import { BlockPicker, SketchPicker } from "react-color";
// import 'draft-js/dist/Draft.css';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import '../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';


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

import BootstrapSelect from 'react-bootstrap-select-dropdown';

import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from "moment";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

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


/*



REFACTOR 1#:

0. Rewrite and oversee the fetch calls
1. Group project by pages, with related contexts in the same files.
2. Go through and simplify the code
3. Store all the web reources locally
4. Shove it into an electron app (?)





*/

const BACKEND_URL = "http://127.0.0.1:8000";

function MyNavbar(props){
  return (
  <>
    <Navbar bg="dark" variant="dark" expand="md" className="d-flex justify-content-between">

      <Navbar.Brand className="text-light" href="/home"><h1>Tabulations</h1></Navbar.Brand>

      <Nav variant="pills" className="d-flex justify-content-around pl-4" style={{paddingRight: "20px", width: "50%"}}>

      <div className="d-flex justify-content-around w-100 ms-2">



        <div className="d-flex justify-content-begin">
        <Nav.Link className="align-self-center" href="/activities">Activities</Nav.Link>
        <Nav.Link className="align-self-center" href="/times">Times</Nav.Link>
        <Nav.Link className="align-self-center" href="/counts">Counts</Nav.Link>
        <Nav.Link className="align-self-center" href="/scales">Scales</Nav.Link>
        </div>

        <div className="d-flex">
          <Nav.Link className="align-self-center text-light" href="/editor">Time editor</Nav.Link>
          <Nav.Link className="align-self-center text-light" href="/dashboard">Dashboard</Nav.Link>

        </div>


      </div>
      </Nav>


    </Navbar>
  </>
);
}

const updateActivity = (obj) => {
  delete obj["timeScaleIsShown"];
  const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body:  JSON.stringify(obj)

  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/activity/${obj.id}/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });



}

const getActivities = () => {

  const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },

  };
  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + '/activity/?format=json', requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });

}

const deleteActivity = (id) => {
  const requestOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/activity/${id}/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return true;
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });



}

const addActivity = (obj) => {




  const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body:  JSON.stringify(obj)

  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/activity/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });



}




const ActivityContext = React.createContext();
const CountContext = React.createContext();
const TimeContext = React.createContext();
const ScaleContext = React.createContext();
const DayContext = React.createContext();
const JournalContext = React.createContext();
const JournalEntryContext = React.createContext();


const ReloadAppContext = React.createContext();

function useForceUpdate(){
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update state to force render
    // An function that increment 👆🏻 the previous state like here
    // is better than directly setting `value + 1`
}

function Activities(props)
{

  const forceUpdate = useForceUpdate();
  const activityContext = useContext(ActivityContext);
  let activities = activityContext.data;


  const [timeScaleIsShown, setTimeScaleIsShown] = useState(false);
  const [activityFormData, setActivityFormData] = useState([]);
  const [activityFormMessage, setActivityFormMessage] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [addActivityFormData, setAddActivityFormData] = useState({active: false, positive: false});


  useEffect(() => {
    let formData = activities.map((obj) => {
      return {...obj, timeScaleIsShown: false};
    })
    setActivityFormData(formData);
  }, []);


  /*
  0. Retrieve activities
  1. Create a button for adding activites
  2. Display every activity with a form for changing and add delete option

  */
  //

  useEffect(() => {


      //this will run every second
      const interval = setInterval(() => {

        let formMessage = activityFormMessage.map((obj) => {
          return {};

        })

        setActivityFormMessage(formMessage);

      }, 6000);
      return () => clearInterval(interval);

  }, []);



  const handleChangeActivity = (event) => {

    if (!(event.target == undefined))
    {
      const index = parseInt(event.target.attributes.index.nodeValue);
      let key = event.target.name;
      let value = event.target.value;

      if (key == "active" || key == "positive")
      {
        value = !activityFormData[index][key];
      }

      // if (key == "minimum" || key == "maximum")
      // {
      //   value = parseInt(value)*60; //Convert to minutes
      // }

      if (value == undefined)
      {
        value = event.target.attributes.value.nodeValue;
      }

      let formData = activityFormData;
      formData[index][key] = value;
      setActivityFormData(formData);
      forceUpdate();
    }



  }

  const handleSubmitActivity = (event) => {
    event.preventDefault();
    const index = parseInt(event.target.attributes.index.nodeValue);

    const obj = activityFormData[index];

    let formMessage = activityFormMessage;
    if (updateActivity(obj)){
      activityContext.setData(activityFormData);
      let element = React.createElement("span", {"className": "text-success"}, "Succesfully updated!");
      formMessage[index] = {message: element};
      forceUpdate();

      setActivityFormMessage(formMessage);
    }else {
      let element = React.createElement("span", {"className": "text-danger mt-2"}, "Failed to update!" );
      formMessage[index] = {message: element};;

      forceUpdate();
      setActivityFormMessage(formMessage);
    }
  }

  const handleDeleteActivity = (event) => {
    const index = parseInt(event.target.attributes.index.nodeValue);
    let formData = activityFormData;
    const obj = formData[index];
    deleteActivity(obj.id);

    delete formData[index];
    activityContext.setData(formData);
    setActivityFormData(formData);
    forceUpdate();
  }


  const handleShowAdd = (event) => {
    setAddActivityFormData({"limit_timescale": "days"});
    setShowAdd(!showAdd);
  }

  const handleSubmitAdd = (event) => {
    event.preventDefault();

    let obj = addActivityFormData;

    if (obj.active == undefined)
    {
      obj.active = false;
    }

    if (obj.positive == undefined){
      obj.positive = false;
    }

    // Default colors
    obj.primary_color = "#4A90E2";
    obj.secondary_color = "#000000";



    addActivity(obj);

    setShowAdd(false);
    // window.location.reload();

  }

  const handleChangeAddActivity = (event) => {



    const key = event.target.name;
    let val = event.target.value;
    if (key == "active" || key == "positive"){
      val = !addActivityFormData[key]
    }

    if (val == undefined)
    {
      val = event.target.attributes.value.nodeValue;
    }

    setAddActivityFormData({...addActivityFormData, [key]: val} );

  }

  const selectTimeScaleToggleHandler = (isOpen, metadata, idx) => {

    let formData = activityFormData;
    formData[idx]["timeScaleIsShown"] = !formData[idx]["timeScaleIsShown"];
    setActivityFormData(formData);
    forceUpdate();


  }

  const selectTimeScaleAddToggleHandler = (isOpen, metadata) => {

    setTimeScaleIsShown(!timeScaleIsShown);

  }

  // const handleSetPrimaryColor = (event) => {}

  return (
    <>
    <div className="d-flex">
      <div className="bg-dark" style={{width:"20%"}}></div>
      <div className="bg-dark" style={{width: "60%", padding:"50px"}}>
        <Button variant="success" onClick={handleShowAdd}>Add</Button>

        <ul style={{listStyleType: "none"}}>
          { activityFormData && activityFormData.length > 0 && activityFormData.map((obj, idx) => {
            return (
              <li style={{borderBottom: "solid 1px gray", paddingBottom:"20px"}}>

              <Form index={idx} className="text-light" onSubmit={handleSubmitActivity}>
                <Form.Group className="mt-3">
                  <Form.Label><h5>{activities[idx].name}</h5></Form.Label>
                </Form.Group>

                { Object.keys(obj).map((key) => {

                  if (key == 'id' || key == 'timeScaleIsShown')
                  {
                    return;
                  }
                  if (typeof(obj[key]) == 'string' || typeof(obj[key]) == 'number')
                  {

                    if (key == 'primary_color' || key == 'secondary_color'){
                      return (
                        <>
                          <Form.Label>{key}</Form.Label>

                          <Form.Group className="mb-3 mt-3 d-flex">
                            <SketchPicker
                              style={{backgroundColor: activityFormData[idx][key]}}
                              color={obj[key]}
                              onChange={(color) => {
                                let formData = activityFormData;
                                formData[idx][key] = color.hex;
                                forceUpdate();
                                setActivityFormData(formData);
                                // setBlockPickerColor(color.hex);
                              }}
                            />

                          </Form.Group>
                         </>
                      )
                    }

                    if (key == 'minimum' || key == 'maximum')
                    {
                      return (
                        <>
                          <Form.Label>{key}</Form.Label>
                          <Form.Group className="mb-3 d-flex">
                            <Form.Control style={{width: "40%"}} type="text" name={key} index={idx} value={obj[key]} onChange={handleChangeActivity}/>
                            <div className="d-flex align-items-center" style={{marginLeft:"10px"}}><span> h</span></div>
                          </Form.Group>
                         </>
                      )
                    }else {

                      if (key == "description")
                      {
                        return (
                        <>
                        <Form.Label>{key}</Form.Label>
                        <Form.Group className="mb-3 d-flex">
                            <Form.Control style={{width: "40%"}} type="text" as="textarea" name={key} index={idx} value={obj[key]} onChange={handleChangeActivity}/>
                        </Form.Group>
                        </>
                      )
                      }

                      if (key == "limit_timescale")
                      {
                          return (
                            <>
                            <Form.Label>{key}</Form.Label>
                            <Form.Group className="mb-3">
                              <Dropdown show={obj["timeScaleIsShown"]} onToggle={(isOpen, metadata) => selectTimeScaleToggleHandler(isOpen, metadata, idx)}>
                                <Dropdown.Toggle variant="light" id="dropdown-basic">
                                  {obj["limit_timescale"]}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {["days", "weeks", "months"].map((ts) => {
                                      return (
                                        <Dropdown.Item index={idx} name="limit_timescale" value={ts} onClick={handleChangeActivity} className="d-flex justiy-content-between">
                                        {ts}
                                        </Dropdown.Item>
                                      )
                                    })}


                                </Dropdown.Menu>
                              </Dropdown>
                            </Form.Group>

                            </>
                          )
                      }else {
                      return (
                        <>
                        <Form.Label>{key}</Form.Label>
                        <Form.Group className="mb-3 d-flex">
                            <Form.Control style={{width: "40%"}} type="text" name={key} index={idx} value={obj[key]} onChange={handleChangeActivity}/>
                        </Form.Group>
                        </>
                      );
                    }
                    }

                  }

                  if (typeof(obj[key]) == 'boolean')
                  {
                    return (
                      <Form.Group className="mt-3">
                        <Form.Check index={idx} type="checkbox" name={key} checked={obj[key]} label={key} onChange={handleChangeActivity}></Form.Check>
                      </Form.Group>
                    )
                  }



                })}
                <Form.Group className="mt-3">
                  <Button variant="info" type="submit">Update</Button>
                  <Button style={{marginLeft:"10px"}} variant="danger" index={idx} onClick={handleDeleteActivity}>Delete</Button>
                </Form.Group>

                <Form.Group className="mt-3">
                  { activityFormMessage[idx] != undefined &&  activityFormMessage[idx].message }
                </Form.Group>
              </Form>

              </li>
            )
          }) }
        </ul>
      </div>
      <div className="bg-dark" style={{width:"20%"}}></div>
    </div>


    <Modal show={showAdd} onHide={handleShowAdd} centered>
      <Modal.Header className="bg-dark text-white" closeButton>
        <Modal.Title>Add activity</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmitAdd}>
        <Modal.Body className="bg-dark text-white">

          <Form.Label>Name</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="text" name="name" onChange={handleChangeAddActivity}/>
          </Form.Group>

          <Form.Label>Description</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="text" as="textarea" name="description" onChange={handleChangeAddActivity}/>
          </Form.Group>


          <Form.Label>Minimum hours</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="float" name="minimum" onChange={handleChangeAddActivity}/>
          </Form.Group>

          <Form.Label>Maximum hours</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="float" name="maximum" onChange={handleChangeAddActivity}/>
          </Form.Group>

          <Form.Label>Limit timescale</Form.Label>
          <Form.Group className="mb-3">
            <Dropdown show={timeScaleIsShown} onToggle={(isOpen, metadata) => selectTimeScaleAddToggleHandler(isOpen, metadata)}>
              <Dropdown.Toggle variant="light" id="dropdown-basic">
                {addActivityFormData["limit_timescale"] == undefined ? "days" : addActivityFormData["limit_timescale"]}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                  {["days", "weeks", "months"].map((ts) => {
                    return (
                      <Dropdown.Item name="limit_timescale" value={ts} onClick={handleChangeAddActivity} className="d-flex justiy-content-between">
                      {ts}
                      </Dropdown.Item>
                    )
                  })}


              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>



          <Form.Group className="mt-3">
            <Form.Check type="checkbox" name="active" checked={addActivityFormData["active"]} label="Active" onChange={handleChangeAddActivity}></Form.Check>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Check type="checkbox" name="positive" checked={addActivityFormData["positive"]} label="Positive" onChange={handleChangeAddActivity}></Form.Check>
          </Form.Group>


        </Modal.Body>

        <Modal.Footer className="bg-dark text-white">
          <Button variant="primary" type="submit">Add</Button>
          <Button variant="warning" onClick={handleShowAdd}>Close</Button>
        </Modal.Footer>
      </Form>
    </Modal>

    </>

  )


}


// const AgentContext = React.createContext();
// const UserContext = React.createContext();
// const GroupContext = React.createContext();
// const CompilationContext = React.createContext();
// const SessionUserContext = React.createContext();


const getCounts = () => {



  const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },

  };

  return new Promise ((resolve, reject) => {
    fetch(BACKEND_URL + '/count/?format=json', requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });



}
const updateCount = (obj) => {
  delete obj["timeScaleIsShown"];
  const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body:  JSON.stringify(obj)

  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/count/${obj.id}/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });



}
const deleteCount = (id) => {
  const requestOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/count/${id}/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return true;
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });



}
const addCount = (obj) => {



  const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body:  JSON.stringify(obj)

  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/count/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });



}
function Counts(props){
  /*

    name = models.CharField(max_length=256)
    limit = models.IntegerField()
    limit_timescale = models.CharField(max_length=256)    #Does the limit apply for a day, week or month?
    description = models.CharField(max_length=512)
    active = models.BooleanField()

  */
  const forceUpdate = useForceUpdate();
  const countContext = useContext(CountContext);
  const [countFormData, setCountFormData] = useState([]);

  const [timeScaleIsShown, setTimeScaleIsShown] = useState(false);
  const [addCountFormData, setAddCountFormData] = useState({"limit_timescale": "days"});
  const [showAdd, setShowAdd] = useState(false);


  useEffect(() => {
    let formData = countContext.data;
    formData.map((obj) => {
      return {...obj, timeScaleIsShown: false};
    })
    setCountFormData(formData);

  }, []);


  const handleChangeCount = (event) => {

    if (!(event.target == undefined))
    {
      const index = parseInt(event.target.attributes.index.nodeValue);
      let key = event.target.name;
      let value = event.target.value;


      if (value == undefined)
      {
        value = event.target.attributes.value.nodeValue;
      }




      if (key == "active")
      {
        value = !countFormData[index]["active"];
      }





      let formData = countFormData;
      formData[index][key] = value;
      setCountFormData(formData);
      forceUpdate();
    }



  }

  const handleSubmitChangeCount = (event) => {
    event.preventDefault();
    const index = parseInt(event.target.attributes.index.nodeValue);

    const obj = countFormData[index];

    updateCount(obj);
    countContext.setData(countFormData);
  }

  const handleDeleteCount = (event) => {
    const index = parseInt(event.target.attributes.index.nodeValue);
    let formData = countFormData;
    const obj = formData[index];
    deleteCount(obj.id);

    delete formData[index];
    countContext.setData(formData);
    setCountFormData(formData);
    forceUpdate();
  }



  const handleShowAdd = (event) => {
    setAddCountFormData({"limit_timescale": "days"});
    setShowAdd(!showAdd);
  }

  const handleSubmitAdd = (event) => {
    event.preventDefault();
    let obj = addCountFormData;

    if (obj.active == undefined)
    {
      obj.active = false;
    }


    addCount(obj);

    setShowAdd(false);
    // window.location.reload();

  }



  const handleChangeAddCount = (event) => {



    const key = event.target.name;
    let val = event.target.value;
    if (key == "active"){
      val = !addCountFormData["active"]
    }


    if (val == undefined)
    {
      val = event.target.attributes.value.nodeValue;
    }

    setAddCountFormData({...addCountFormData, [key]: val} );

  }

  const selectTimeScaleToggleHandler = (isOpen, metadata, idx) => {

    let formData = countFormData;
    formData[idx]["timeScaleIsShown"] = !formData[idx]["timeScaleIsShown"];
    setCountFormData(formData);
    forceUpdate();


  }


  const selectTimeScaleAddToggleHandler = (isOpen, metadata) => {

    setTimeScaleIsShown(!timeScaleIsShown);

  }

  return (
    <>
    <div className="d-flex">
      <div className="bg-dark" style={{width:"20%"}}></div>
      <div className="bg-dark" style={{width: "60%", padding:"50px"}}>
        <Button variant="success" onClick={handleShowAdd}>Add</Button>

        <ul style={{listStyleType: "none"}}>
          { countFormData && countFormData.length > 0 && countFormData.map((obj, idx) => {

            return (
              <li style={{borderBottom: "solid 1px gray", paddingBottom:"20px"}}>

              <Form index={idx} className="text-light" onSubmit={handleSubmitChangeCount}>
                <Form.Group className="mt-3">
                  <Form.Label><h5>{countContext.data[idx].name}</h5></Form.Label>
                </Form.Group>

                { Object.keys(obj).map((key) => {
                  if (key == 'id' || key == 'timeScaleIsShown')
                  {
                    return;
                  }

                  if (key == 'limit')
                  {
                    return (
                      <>
                        <Form.Label>{key}</Form.Label>
                        <Form.Group className="mb-3">
                          <Form.Control index={idx} style={{width: "40%"}} type="number" name={key} value={obj[key]} onChange={handleChangeCount}/>
                        </Form.Group>
                      </>
                    )
                  }

                  if (key == "limit_timescale")
                  {
                    return (
                      <>
                      <Form.Label>{key}</Form.Label>
                      <Form.Group className="mb-3">
                        <Dropdown show={obj["timeScaleIsShown"]} onToggle={(isOpen, metadata) => selectTimeScaleToggleHandler(isOpen, metadata, idx)}>
                          <Dropdown.Toggle variant="light" id="dropdown-basic">
                            {obj["limit_timescale"]}
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                              {["days", "weeks", "months"].map((ts) => {
                                return (
                                  <Dropdown.Item index={idx} name="limit_timescale" value={ts} onClick={handleChangeCount} className="d-flex justiy-content-between">
                                  {ts}
                                  </Dropdown.Item>
                                )
                              })}


                          </Dropdown.Menu>
                        </Dropdown>
                      </Form.Group>

                      </>
                    )
                  }

                  if (typeof(obj[key]) == 'boolean')
                  {
                    return (
                      <Form.Group className="mt-3">
                        <Form.Check index={idx} type="checkbox" name={key} checked={obj[key]} label={key} onChange={handleChangeCount}></Form.Check>
                      </Form.Group>
                    )
                  }



                  return (
                    <>
                      <Form.Label>{key}</Form.Label>
                      <Form.Group className="mb-3">
                        <Form.Control index={idx} style={{width: "40%"}} type="text" name={key} value={obj[key]} onChange={handleChangeCount}/>
                      </Form.Group>
                    </>
                  )



                })}
                <Form.Group className="mt-3">
                  <Button variant="info" type="submit">Update</Button>
                  <Button style={{marginLeft:"10px"}} variant="danger" index={idx} onClick={handleDeleteCount}>Delete</Button>
                </Form.Group>

              </Form>

              </li>

            )
          }) }
        </ul>
      </div>
      <div className="bg-dark" style={{width:"20%"}}></div>
    </div>

    <Modal show={showAdd} onHide={handleShowAdd} centered>
      <Modal.Header className="bg-dark text-white" closeButton>
        <Modal.Title>Add count</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmitAdd}>
        <Modal.Body className="bg-dark text-white">

          <Form.Label>Name</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="text" name="name" onChange={handleChangeAddCount}/>
          </Form.Group>

          <Form.Label>Description</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="text" as="textarea" name="description" onChange={handleChangeAddCount}/>
          </Form.Group>


          <Form.Label>Limit</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="number" name="limit" onChange={handleChangeAddCount}/>
          </Form.Group>

          <Form.Label>Limit timescale</Form.Label>
          <Form.Group className="mb-3">
            <Dropdown show={timeScaleIsShown} onToggle={(isOpen, metadata) => selectTimeScaleAddToggleHandler(isOpen, metadata)}>
              <Dropdown.Toggle variant="light" id="dropdown-basic">
                {addCountFormData["limit_timescale"] == undefined ? "days" : addCountFormData["limit_timescale"]}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                  {["days", "weeks", "months"].map((ts) => {
                    return (
                      <Dropdown.Item name="limit_timescale" value={ts} onClick={handleChangeAddCount} className="d-flex justiy-content-between">
                      {ts}
                      </Dropdown.Item>
                    )
                  })}


              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>



          <Form.Group className="mt-3">
            <Form.Check type="checkbox" name="active" checked={addCountFormData["active"]} label="Active" onChange={handleChangeAddCount}></Form.Check>
          </Form.Group>


        </Modal.Body>

        <Modal.Footer className="bg-dark text-white">
          <Button variant="primary" type="submit">Add</Button>
          <Button variant="warning" onClick={handleShowAdd}>Close</Button>
        </Modal.Footer>
      </Form>
    </Modal>



    </>
  )
}



const addTime = (obj) => {



    const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body:  JSON.stringify(obj)

    };

    return new Promise ((resolve, reject) => {

      fetch(BACKEND_URL + `/time/?format=json`, requestOptions)
          .then( (response) => {
            if ([200, 204].includes(response.status)){
              return response.json()
            }else {
              return false;
            }

          }).then((data) => {

            if (data){
              resolve(data);


            //Fix this
            }else {
              reject({error: "invalid response recieved"})
            }


          //Network / socket related errors
          }).catch ((errmsg) => {

            // this.setState({error: errmsg.toString() });
            reject({error: errmsg.toString() });
          });

    });



}

const updateTime = (obj) => {
  const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body:  JSON.stringify(obj)

  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/time/${obj.id}/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject(false)
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });


}

const deleteTime = (id) => {
  const requestOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/time/${id}/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return true;
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });

}


function Times(props)
{
  const forceUpdate = useForceUpdate();
  const timeContext = useContext(TimeContext);
  let times = timeContext.data;


  const [timeScaleIsShown, setTimeScaleIsShown] = useState(false);
  const [timeFormData, setTimeFormData] = useState([]);
  const [timeFormMessage, setTimeFormMessage] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [addTimeFormData, setAddTimeFormData] = useState({active: false});

  // useEffect(() => {
  //
  //
  //     //this will run every second
  //     const interval = setInterval(() => {
  //
  //       let formMessage = timeFormMessage.map((obj) => {
  //         return {};
  //
  //       })
  //
  //       setTimeFormMessage(formMessage);
  //
  //     }, 6000);
  //     return () => clearInterval(interval);
  //
  // }, []);
  //



  useEffect(() => {
    let formData = times.map((obj) => {

      let newObj = {};
      Object.keys(obj).forEach((key) => {

        if (key == 'minimum' || key == 'maximum')
        {

          let n = obj[key];
          let h = Math.floor(n);

          //Convert hour-decimal to minutes
          let m = (n - h)*60;


          // If decimalis above 0.5 it means we round upwards, usually it's 0.99998
          // while if its under, it's usually 0.0000000001
          if ((m - Math.floor(m)) > 0.5){
            m = Math.ceil(m);
          }else {
            m = Math.floor(m);
          }


          let hour, minute;

          if ((h > 24) || (h == 24 && m > 0))
          {
            h = 0;
          }

          if (h < 10){
            hour = `0${h}`;
          }else {
            hour = `${h}`;
          }
            
          //remove this 
          if (m == 0){
            minute = "00";
          }

          if (m < 10){
            minute = `0${m}`;
          }else {
            minute = `${m}`;
          }

          // delete obj[key];
          newObj[key] = `${hour}:${minute}`;
      }else {
        newObj[key] = obj[key];
      }
    });

    return {...newObj, timeScaleIsShown: false};

  });
  setTimeFormData(formData);
}, []);


  /*
  0. Retrieve times
  1. Create a button for adding activites
  2. Display every Time with a form for changing and add delete option

  */
  //



  const handleChangeTime = (event) => {

    if (!(event.target == undefined))
    {
      const index = parseInt(event.target.attributes.index.nodeValue);
      let key = event.target.name;
      let value = event.target.value;

      if (key == "active")
      {
        value = !timeFormData[index]["active"];
      }


      if (value == undefined)
      {
        value = event.target.attributes.value.nodeValue;
      }

      let formData = timeFormData;
      formData[index][key] = value;
      setTimeFormData(formData);
      forceUpdate();
    }



  }

  const handleSubmitTime = (event) => {
    event.preventDefault();
    const index = parseInt(event.target.attributes.index.nodeValue);

    const obj = timeFormData[index];


    // Convert times into their decimal format

    let newObj = {};
    let err = false;
    Object.keys(obj).forEach((key) => {
      let formMessage = timeFormMessage;
      if (key == 'minimum' || key == 'maximum')
      {
        let val = obj[key];
        let hm = val.split(":");
        //Display error message
        if (hm.length != 2){
          let element = React.createElement("span", {"className": "text-danger"}, "Invalid time format, must be (hh:mm)");
          formMessage[index] = {message: element};
          forceUpdate();
          setTimeFormMessage(formMessage);
          err = true;
        }else {
          let hour = hm[0];
          let minute = hm[1];
          let h, m;
          let hFloat;

          for (let i = 0; i < hour.length; i++)
          {
            let char = hour[i];
            if (isNaN(char)){
              let element = React.createElement("span", {"className": "text-danger"}, "Hour is invalid");
              formMessage[index] = {message: element};
              forceUpdate();
              setTimeFormMessage(formMessage);
              err = true;
            }
          }


          for (let i = 0; i < minute.length; i++)
          {
            let char = minute[i];
            if (isNaN(char)){
              let element = React.createElement("span", {"className": "text-danger"}, "Minute is invalid");
              formMessage[index] = {message: element};
              forceUpdate();
              setTimeFormMessage(formMessage);
              err = true;
            }
          }

          if (hour[0] == '0')
          {
            h = parseInt(hour[1]);
          }else {
            h = parseInt(hour);
          }

          if (minute[0] == '0')
          {
            m = parseInt(minute[1]);
          }else {
            m = parseInt(minute);
          }

          hFloat = h + (m/60);
          newObj[key] = hFloat;
        }


        // delete obj[key];
    }else {
      newObj[key] = obj[key];
    }
  });



    if (!err){

      let formMessage = timeFormMessage;
      updateTime(newObj)
        .then((data) => {
          let element = React.createElement("span", {"className": "text-success"}, "Succesfully updated!");
          formMessage[index] = {message: element};
          setTimeFormMessage(formMessage);
          forceUpdate();
          timeContext.setData(timeFormData);
        })
        .catch((err) => {
          let element = React.createElement("span", {"className": "text-danger"}, "Failed to update!");
          formMessage[index] = {message: element};
          forceUpdate();
          setTimeFormMessage(formMessage);
        })


    }


  }

  const handleDeleteTime = (event) => {
    const index = parseInt(event.target.attributes.index.nodeValue);
    let formData = timeFormData;
    const obj = formData[index];
    deleteTime(obj.id);

    delete formData[index];
    timeContext.setData(formData);
    setTimeFormData(formData);
    forceUpdate();
  }


  const handleShowAdd = (event) => {
    setAddTimeFormData({"limit_timescale": "days"});
    setShowAdd(!showAdd);
  }

  const handleSubmitAdd = (event) => {
    event.preventDefault();

    let obj = addTimeFormData;

    //convert times
    let newObj = {};
    let err = false;
    Object.keys(obj).forEach((key) => {

      if (key == 'minimum' || key == 'maximum')
      {
        let val = obj[key];
        let hm = val.split(":");
        //Display error message
        if (hm.length != 2){
          err = true;
        }else {
          let hour = hm[0];
          let minute = hm[1];
          let h, m;
          let hFloat;

          for (let i = 0; i < hour.length; i++)
          {
            let char = hour[i];
            if (isNaN(char)){
              err = true;
            }
          }


          for (let i = 0; i < minute.length; i++)
          {
            let char = minute[i];
            if (isNaN(char)){
              err = true;
            }
          }

          if (hour[0] == '0')
          {
            h = parseInt(hour[1]);
          }else {
            h = parseInt(hour);
          }

          if (minute[0] == '0')
          {
            m = parseInt(minute[1]);
          }else {
            m = parseInt(minute);
          }

          hFloat = h + (m/60);
          newObj[key] = hFloat;
        }


        // delete obj[key];
      }else {
        newObj[key] = obj[key];
      }
    });


    if (newObj.active == undefined)
    {
      newObj.active = false;
    }

    addTime(newObj);

    setShowAdd(false);
    window.location.reload();

  }

  const handleChangeAddTime = (event) => {



    const key = event.target.name;
    let val = event.target.value;
    if (key == "active"){
      val = !addTimeFormData["active"]
    }

    if (val == undefined)
    {
      val = event.target.attributes.value.nodeValue;
    }

    setAddTimeFormData({...addTimeFormData, [key]: val} );

  }

  const selectTimeScaleToggleHandler = (isOpen, metadata, idx) => {

    let formData = timeFormData;
    formData[idx]["timeScaleIsShown"] = !formData[idx]["timeScaleIsShown"];
    setTimeFormData(formData);
    forceUpdate();


  }

  const selectTimeScaleAddToggleHandler = (isOpen, metadata) => {

    setTimeScaleIsShown(!timeScaleIsShown);

  }

  return (
    <>
    <div className="d-flex">
      <div className="bg-dark" style={{width:"20%"}}></div>
      <div className="bg-dark" style={{width: "60%", padding:"50px"}}>
        <Button variant="success" onClick={handleShowAdd}>Add</Button>

        <ul style={{listStyleType: "none"}}>
          { timeFormData && timeFormData.length > 0 && timeFormData.map((obj, idx) => {
            return (
              <li style={{borderBottom: "solid 1px gray", paddingBottom:"20px"}}>

              <Form index={idx} className="text-light" onSubmit={handleSubmitTime}>
                <Form.Group className="mt-3">
                  <Form.Label><h5>{times[idx].name}</h5></Form.Label>
                </Form.Group>

                { Object.keys(obj).map((key) => {

                  if (key == 'id' || key == 'timeScaleIsShown')
                  {
                    return;
                  }
                  if (typeof(obj[key]) == 'string' || typeof(obj[key]) == 'number')
                  {

                    if (key == 'minimum' || key == 'maximum')
                    {


                      return (
                        <>
                          <Form.Label>{key}</Form.Label>
                          <Form.Group className="mb-3 d-flex">
                            <Form.Control style={{width: "40%"}} type="text" name={key} index={idx} value={obj[key]} onChange={handleChangeTime}/>
                          </Form.Group>
                         </>
                      );
                    }else {

                      if (key == "description")
                      {
                        return (
                        <>
                        <Form.Label>{key}</Form.Label>
                        <Form.Group className="mb-3 d-flex">
                            <Form.Control style={{width: "40%"}} type="text" as="textarea" name={key} index={idx} value={obj[key]} onChange={handleChangeTime}/>
                        </Form.Group>
                        </>
                      )
                      }

                      if (key == "limit_timescale")
                      {
                          return (
                            <>
                            <Form.Label>{key}</Form.Label>
                            <Form.Group className="mb-3">
                              <Dropdown show={obj["timeScaleIsShown"]} onToggle={(isOpen, metadata) => selectTimeScaleToggleHandler(isOpen, metadata, idx)}>
                                <Dropdown.Toggle variant="light" id="dropdown-basic">
                                  {obj["limit_timescale"]}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {["days", "weeks", "months"].map((ts) => {
                                      return (
                                        <Dropdown.Item index={idx} name="limit_timescale" value={ts} onClick={handleChangeTime} className="d-flex justiy-content-between">
                                        {ts}
                                        </Dropdown.Item>
                                      )
                                    })}


                                </Dropdown.Menu>
                              </Dropdown>
                            </Form.Group>

                            </>
                          )
                      }else {
                      return (
                        <>
                        <Form.Label>{key}</Form.Label>
                        <Form.Group className="mb-3 d-flex">
                            <Form.Control style={{width: "40%"}} type="text" name={key} index={idx} value={obj[key]} onChange={handleChangeTime}/>
                        </Form.Group>
                        </>
                      );
                    }
                    }

                  }

                  if (typeof(obj[key]) == 'boolean')
                  {
                    return (
                      <Form.Group className="mt-3">
                        <Form.Check index={idx} type="checkbox" name={key} checked={obj[key]} label={key} onChange={handleChangeTime}></Form.Check>
                      </Form.Group>
                    )
                  }



                })}
                <Form.Group className="mt-3">
                  <Button variant="info" type="submit">Update</Button>
                  <Button style={{marginLeft:"10px"}} variant="danger" index={idx} onClick={handleDeleteTime}>Delete</Button>
                </Form.Group>

                <Form.Group className="mt-3">
                  { timeFormMessage[idx] != undefined && timeFormMessage[idx].message }
                </Form.Group>
              </Form>

              </li>

            )
          }) }
        </ul>
      </div>
      <div className="bg-dark" style={{width:"20%"}}></div>
    </div>


    <Modal show={showAdd} onHide={handleShowAdd} centered>
      <Modal.Header className="bg-dark text-white" closeButton>
        <Modal.Title>Add time</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmitAdd}>
        <Modal.Body className="bg-dark text-white">

          <Form.Label>Name</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="text" name="name" onChange={handleChangeAddTime}/>
          </Form.Group>


          <Form.Label>Minimum time (hh:mm)</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="float" name="minimum" onChange={handleChangeAddTime}/>
          </Form.Group>

          <Form.Label>Maximum time (hh:mm)</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="float" name="maximum" onChange={handleChangeAddTime}/>
          </Form.Group>

          <Form.Label>Description</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="text" as="textarea" name="description" onChange={handleChangeAddTime}/>
          </Form.Group>



          <Form.Group className="mt-3">
            <Form.Check type="checkbox" name="active" checked={addTimeFormData["active"]} label="Active" onChange={handleChangeAddTime}></Form.Check>
          </Form.Group>


        </Modal.Body>

        <Modal.Footer className="bg-dark text-white">
          <Button variant="primary" type="submit">Add</Button>
          <Button variant="warning" onClick={handleShowAdd}>Close</Button>
        </Modal.Footer>
      </Form>
    </Modal>

    </>

  );


}



const getTimes = () => {
  const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },

  };

  return new Promise ((resolve, reject) => {
    fetch(BACKEND_URL + '/time/?format=json', requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });



}


const getScales = () => {
  const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },

  };

  return new Promise ((resolve, reject) => {
    fetch(BACKEND_URL + '/scale/?format=json', requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }
        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });


}



const updateScale = (obj) => {

  const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body:  JSON.stringify(obj)

  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/scale/${obj.id}/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject(false)
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });



}

const deleteScale = (id) => {
  const requestOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/scale/${id}/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return true;
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });
}

const addScale = (obj) => {

  const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body:  JSON.stringify(obj)

  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/scale/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });




}

function Scales(props){

  const forceUpdate = useForceUpdate();
  const scaleContext = useContext(ScaleContext);
  const [scaleFormData, setScaleFormData] = useState([]);

  const [addScaleFormData, setAddScaleFormData] = useState({"limit_timescale": "days"});
  const [showAdd, setShowAdd] = useState(false);


  useEffect(() => {
    let formData = scaleContext.data;
    formData.map((obj) => {
      return {...obj};
    })
    setScaleFormData(formData);

  }, []);


  const handleChangeScale = (event) => {

    if (!(event.target == undefined))
    {
      const index = parseInt(event.target.attributes.index.nodeValue);
      let key = event.target.name;
      let value = event.target.value;


      if (value == undefined)
      {
        value = event.target.attributes.value.nodeValue;
      }


      if (key == "active")
      {
        value = !scaleFormData[index]["active"];
      }


      let formData = scaleFormData;
      formData[index][key] = value;
      setScaleFormData(formData);
      forceUpdate();
    }



  }

  const handleSubmitChangeScale = (event) => {
    event.preventDefault();
    const index = parseInt(event.target.attributes.index.nodeValue);

    const obj = scaleFormData[index];

    updateScale(obj);
    scaleContext.setData(scaleFormData);
  }

  const handleDeleteScale = (event) => {
    const index = parseInt(event.target.attributes.index.nodeValue);
    let formData = scaleFormData;
    const obj = formData[index];
    deleteScale(obj.id);

    delete formData[index];
    scaleContext.setData(formData);
    setScaleFormData(formData);
    forceUpdate();
  }



  const handleShowAdd = (event) => {
    setAddScaleFormData({"limit_timescale": "days"});
    setShowAdd(!showAdd);
  }

  const handleSubmitAdd = (event) => {
    event.preventDefault();
    let obj = addScaleFormData;

    if (obj.active == undefined)
    {
      obj.active = false;
    }

    addScale(obj);

    setShowAdd(false);
    window.location.reload();

  }



  const handleChangeAddScale = (event) => {



    const key = event.target.name;
    let val = event.target.value;
    if (key == "active"){
      val = !addScaleFormData["active"]
    }


    if (val == undefined)
    {
      val = event.target.attributes.value.nodeValue;
    }

    setAddScaleFormData({...addScaleFormData, [key]: val} );

  }







  return (
    <>
    <div className="d-flex">
      <div className="bg-dark" style={{width:"20%"}}></div>
      <div className="bg-dark" style={{width: "60%", padding:"50px"}}>
        <Button variant="success" onClick={handleShowAdd}>Add</Button>

        <ul style={{listStyleType: "none"}}>
          { scaleFormData && scaleFormData.length > 0 && scaleFormData.map((obj, idx) => {

            return (
              <li style={{borderBottom: "solid 1px gray", paddingBottom:"20px"}}>

              <Form index={idx} className="text-light" onSubmit={handleSubmitChangeScale}>
                <Form.Group className="mt-3">
                  <Form.Label><h5>{scaleContext.data[idx].name}</h5></Form.Label>
                </Form.Group>

                { Object.keys(obj).map((key) => {

                  if (key == 'id')
                  {
                    return;
                  }

                  if (typeof(obj[key]) == 'boolean')
                  {
                    return (
                      <Form.Group className="mt-3">
                        <Form.Check index={idx} type="checkbox" name={key} checked={obj[key]} label={key} onChange={handleChangeScale}></Form.Check>
                      </Form.Group>
                    )
                  }



                  return (
                    <>
                      <Form.Label>{key}</Form.Label>
                      <Form.Group className="mb-3">
                        <Form.Control index={idx} style={{width: "40%"}} type="text" as={key == "description" ? "textarea" : "input"} name={key} value={obj[key]} onChange={handleChangeScale}/>
                      </Form.Group>
                    </>
                  )



                })}
                <Form.Group className="mt-3">
                  <Button variant="info" type="submit">Update</Button>
                  <Button style={{marginLeft:"10px"}} variant="danger" index={idx} onClick={handleDeleteScale}>Delete</Button>
                </Form.Group>

              </Form>

              </li>

            )
          }) }
        </ul>
      </div>
      <div className="bg-dark" style={{width:"20%"}}></div>
    </div>

    <Modal show={showAdd} onHide={handleShowAdd} centered>
      <Modal.Header className="bg-dark text-white" closeButton>
        <Modal.Title>Add scale</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmitAdd}>
        <Modal.Body className="bg-dark text-white">

          <Form.Label>Name</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="text" name="name" onChange={handleChangeAddScale}/>
          </Form.Group>

          <Form.Label>Description</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="text" as="textarea" name="description" onChange={handleChangeAddScale}/>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Check type="checkbox" name="active" checked={addScaleFormData["active"]} label="Active" onChange={handleChangeAddScale}></Form.Check>
          </Form.Group>

        </Modal.Body>

        <Modal.Footer className="bg-dark text-white">
          <Button variant="primary" type="submit">Add</Button>
          <Button variant="warning" onClick={handleShowAdd}>Close</Button>
        </Modal.Footer>
      </Form>
    </Modal>



    </>
  )


}


const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);




const formatName = (name, count) => `${name} ID ${count}`;



const addDay = (obj) => {


  const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body:  JSON.stringify(obj)

  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/day/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 201, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });


}
const updateDay = (obj) => {
  const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body:  JSON.stringify(obj)

  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/day/${obj.id}/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });

}
const deleteDay = async (id) => {
  const requestOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
  };

  return new Promise ((resolve, reject) => {

    fetch(BACKEND_URL + `/day/${id}/?format=json`, requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return true;
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });
}


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




const getDateStrFormat = (dateObj) => {
  return `${dateObj.getDate()}/${dateObj.getMonth()+1}/${dateObj.getFullYear()}`;
}

//Converts floating point hours to a military-time string, 4.5 -> 04:30
const hoursToTimeStr = (n) => {
  let h = Math.floor(n);

  //Convert hour-decimal to minutes
  let m = (n - h)*60;


  // If decimalis above 0.5 it means we round upwards, usually it's 0.99998
  // while if its under, it's usually 0.0000000001
  if ((m - Math.floor(m)) > 0.5){
    m = Math.ceil(m);
  }else {
    m = Math.floor(m);
  }


  let hour, minute;

  if ((h > 24) || (h == 24 && m > 0))
  {
    h = 0;
  }

  if (h < 10){
    hour = `0${h}`;
  }else {
    hour = `${h}`;
  }

  if (m == 0){
    minute = "00";
  }
  if (m < 10){
    minute = `0${m}`;
  }else {
    minute = `${m}`;
  }

  return `${hour}:${minute}`;

}

//Converts military-time into floating point hours, 16:45 -> 16.75
const timeStrToHours = (val) => {
  let err;
  let hm = val.split(":");
  //Display error message
  if (hm.length != 2){
    err = true;
  }else {
    let hour = hm[0];
    let minute = hm[1];
    let h, m;
    let hFloat;

    for (let i = 0; i < hour.length; i++)
    {
      let char = hour[i];
      if (isNaN(char)){
        err = true;
      }
    }


    for (let i = 0; i < minute.length; i++)
    {
      let char = minute[i];
      if (isNaN(char)){
        err = true;
      }
    }

    if (hour[0] == '0')
    {
      h = parseInt(hour[1]);
    }else {
      h = parseInt(hour);
    }

    if (minute[0] == '0')
    {
      m = parseInt(minute[1]);
    }else {
      m = parseInt(minute);
    }

    hFloat = h + (m/60);
    if (err)
    {
      hFloat = 0.0;
    }

    return hFloat;
  }


}


function TimeEditor(props){





  const activityContext = useContext(ActivityContext);
  const timeContext = useContext(TimeContext);
  const countContext = useContext(CountContext);
  const scaleContext = useContext(ScaleContext);
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
  const [changeDayData, setChangeDayData] = useState({"scales": {}, "counts": {}, "times":{}});
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
        addDay(obj).then((resData) => {
          let newDays = days;
          newDays[idx] = resData;
          setDays(newDays);
        })
      }else {
        updateDay(obj);
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
        newDays.push({"date": getDateStrFormat(start), "scales": {}, "times": {},"counts": {}, "activities": [{...event, start, end}] });
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
        newDays.push({"date": getDateStrFormat(start), "scales": {}, "times": {},"counts": {}, "activities": [{...event, start, end, allDay}] });
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
        newDays.push({"date": getDateStrFormat(start), "scales": {}, "times": {},"counts": {}, "activities": [{...event, id}] });
        setDays(newDays);
      }




    },
    [draggedEvent, counters, setDraggedEvent, setCounters, newEvent]
  )

  const deleteEventFromDay = async (eventId, selectedDay) => {

    return new Promise((resolve, reject) => {
      let data = {"scales": {}, "counts": {}, "times": {}, "activities": []};
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
          data["counts"] = obj.counts;
          data["times"] = obj.times;

        }


      })

      let dayData = days;

      updateDay(data).then((retData) => {
        dayData[index] = data;
        setDays(dayData);
        resolve();
      });


    })



  }

  const addEventToDay = (event, selectedDay) => {


    return new Promise((resolve, reject) => {
      let data = {"scales": {}, "counts": {}, "times": {}, "activities": []};
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
          data["counts"] = obj.counts;
          data["times"] = obj.times;

        }


      })

      let dayData = days;

      if (newDay){
        addDay(data).then((returnData) => {
          dayData.push(returnData);
          setDays(dayData);

          resolve();
        });
      }else {
        updateDay(data).then((retData) => {
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
      setChangeDayData({"scales": {}, "counts": {}, "times":{}});
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
      items[key] = value;


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
      addDay(data);
    }else {
      updateDay(data);
    }



    setChangeDayData({"scales": {}, "counts": {}, "times":{}});
    setShowChangeDay(!showChangeDay);







  }

  const handleDeleteDay = (event) => {

    let id = event.target.name;
    if (id != null){
      deleteDay(id).then(() => {
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
        setChangeDayData({"scales": {}, "counts": {}, "times":{}});


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
      <h4>Activities</h4>

      {activityContext.data.map((obj, idx) => {
        if (obj.active){
          return (
            <div

              draggable="true"
              key={obj.name}
              onDragStart={() =>
                handleDragStart({ name: obj.name })
              }
              className="mt-3 d-flex justify-content-center"
              style={{borderRadius: "5px", textAlign: "center", backgroundColor: obj.primary_color, width: "40%", minHeight: "40px", maxHeight: "auto"}}
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

        <div style={{width: "40%"}}>
        <Form.Group>
          <Form.Label><h5>Counts</h5></Form.Label>
        </Form.Group>
        { countContext.data && countContext.data.length > 0 && countContext.data.map((obj, idx) => {

          if (obj.active){
            return (
              <>
                <Form.Label>{obj.name}</Form.Label>

                <Form.Group className="mb-3">
                  <Form.Control style={{width: "80%"}} type="text" name={obj.name} value={changeDayData["counts"][obj.name]} itemType="counts" onChange={handleChangeDay}/>

                </Form.Group>


              </>
            );
          }

        }) }

        <Form.Group className="mt-3">
          <Form.Label><h5>Scales (1-10)</h5></Form.Label>
        </Form.Group>

        { scaleContext.data && scaleContext.data.length > 0 && scaleContext.data.map((obj, idx) => {
          // <p className="text-info mt-2">{obj.description}</p>

          if (obj.active){
            return (
              <>
                <Form.Label>{obj.name}</Form.Label>

                <Form.Group className="mb-3">
                  <Form.Control style={{width: "80%"}} type="text" name={obj.name} value={changeDayData["scales"][obj.name]} itemType="scales" onChange={handleChangeDay}/>
                </Form.Group>
              </>
            );
          }

        }) }

        <Form.Group className="mt-3">
          <Form.Label><h5>Times (hh:mm)</h5></Form.Label>
        </Form.Group>

        { timeContext.data && timeContext.data.length > 0 && timeContext.data.map((obj, idx) => {
          // <p className="text-info mt-2">{obj.description}</p>

          if (obj.active){

            return (
              <>
                <Form.Label>{obj.name}</Form.Label>

                <Form.Group className="mb-3">
                  <Form.Control style={{width: "80%"}} type="text" name={obj.name} value={changeDayData["times"][obj.name]} itemType="times" onChange={handleChangeDay}/>
                </Form.Group>
              </>
            );

          }

        }) }

        <p className="mt-3 text-info">Submitting this will add the above items and the activities you have added to the day</p>
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






const getDays = async () => {



  const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },

  };

  return new Promise ((resolve, reject) => {
    fetch(BACKEND_URL + '/day/?format=json', requestOptions)
        .then( (response) => {
          if ([200, 204].includes(response.status)){
            return response.json()
          }else {
            return false;
          }

        }).then((data) => {

          if (data){
            resolve(data);


          //Fix this
          }else {
            reject({error: "invalid response recieved"})
          }


        //Network / socket related errors
        }).catch ((errmsg) => {

          // this.setState({error: errmsg.toString() });
          reject({error: errmsg.toString() });
        });

  });

}

function swap(arr,xp, yp)
{
    var temp = arr[xp];
    arr[xp] = arr[yp];
    arr[yp] = temp;
}


function selectionSortArr(arr,  n){
    var i, j, min_idx;

    // One by one move boundary of unsorted subarray
    for (i = 0; i < n-1; i++)
    {
        // Find the minimum element in unsorted array
        min_idx = i;
        for (j = i + 1; j < n; j++)
        if (arr[j] > arr[min_idx])
            min_idx = j;

        // Swap the found minimum element with the first element
        swap(arr,min_idx, i);

    }
}

function selectionSort(keys, arr,  n){
    var i, j, min_idx;

    // One by one move boundary of unsorted subarray
    for (i = 0; i < n-1; i++)
    {
        // Find the minimum element in unsorted array
        min_idx = i;
        for (j = i + 1; j < n; j++)
        if (arr[j] > arr[min_idx])
            min_idx = j;

        // Swap the found minimum element with the first element
        swap(arr,min_idx, i);
        swap(keys,min_idx, i);

    }
}

function Dashboard(props){

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

        dayContext.data.forEach((dObj) => {


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

        currObj["timeseries"] = new TimeSeries(timeSeries);
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

        dayContext.data.forEach((dObj) => {

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
                        interpolation="curveBasis"
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



//
// const MyInput = () => {
//   const [value, setValue] = useState('');
//   const onChange = (evt) => setValue(evt.target.value);
//
//   return <input value={value} onChange={onChange} />;
// };
//
// function MyEditor(props){

//
//
//
//   return (
//     <Editor editorState={editorState} onChange={setEditorState}/>
//   );
//
// }

function Journals(props){
    const [editorState, setEditorState] = useState(
      () => EditorState.createEmpty(),
    );


    const journalContext = useContext(JournalContext);
    const journalEntryContext = useContext(JournalEntryContext);
    const [currentJournal, setCurrentJournal] = useState({});



    useEffect(() => {

      if (journalContext.data.length > 0){
        setCurrentJournal(journalContext.data[0]);
      }


    }, []);

    /*

    Journals are meant to be a nice way to keep any number and types of different journals. You create a journal
    and then you are able add, update and delete entries in it. the entries themselves are "appended" to the days that
    you wrote them. Each journal entry will have it's own page and will be edited with a nice editor.


    Best ever: https://jpuri.github.io/react-draft-wysiwyg/#/docs


    TODO:

    0. "Journal view"
    1. Journal page mechanics
    2. Display journal entries in time editor

    */

  const onChangeEditor = (contentState) => {
    setEditorState(contentState);
  }


  const onSelectJournal = (event) => {
    let journal = journalContext.data.find((obj) => obj.id == event.currentTarget.attributes.name.nodeValue);
    setCurrentJournal(journal);
  }

  return (
    <>

    <div className="d-flex">
      <div style={{width: "20%", height: "100vh", borderRight: "1px solid grey"}} className="bg-dark text-light">
          { journalContext.data && journalContext.data.length > 0 && journalContext.data.map((obj) => {
            return <Button onClick={onSelectJournal} name={obj.id} variant="dark"><p className="text-light">{obj.name}</p></Button>;
          }) }
      </div>
      <div style={{height:"100vh", width: "80%"}}>
      <h1 className="bg-dark text-light" style={{marginBottom: "0px", paddingLeft: "10px"}}>{currentJournal.name}</h1>
        <Editor
        wrapperClassName="bg-dark h-100"
        editorClassName="bg-dark text-light p-5"
        toolbarClassName="bg-dark border-dark"
        onContentStateChange={onChangeEditor}
        />
      </div>

    </div>
    </>
  )
}


function getJournals(){
    const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },

    };

    return new Promise ((resolve, reject) => {
      fetch(BACKEND_URL + '/journal/?format=json', requestOptions)
          .then( (response) => {
            if ([200, 204].includes(response.status)){
              return response.json()
            }else {
              return false;
            }

          }).then((data) => {

            if (data){
              resolve(data);


            //Fix this
            }else {
              reject({error: "invalid response recieved"})
            }


          //Network / socket related errors
          }).catch ((errmsg) => {

            // this.setState({error: errmsg.toString() });
            reject({error: errmsg.toString() });
          });

    });




}


function getJournalEntries(){
    const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },

    };

    return new Promise ((resolve, reject) => {
      fetch(BACKEND_URL + '/journal_entry/?format=json', requestOptions)
          .then( (response) => {
            if ([200, 204].includes(response.status)){
              return response.json()
            }else {
              return false;
            }

          }).then((data) => {

            if (data){
              resolve(data);


            //Fix this
            }else {
              reject({error: "invalid response recieved"})
            }


          //Network / socket related errors
          }).catch ((errmsg) => {

            // this.setState({error: errmsg.toString() });
            reject({error: errmsg.toString() });
          });

    });




}


function App() {

  const forceUpdate = useForceUpdate();
  const [activities, setActivities] = useState([]);
  const [counts, setCounts] = useState([]);
  const [times, setTimes] = useState([]);
  const [scales, setScales] = useState([]);
  const [days, setDays] = useState([]);
  const [journals, setJournals] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(( ) => {

    getActivities().then((data) => {
      setActivities(data);

      getCounts().then((countData) => {
        setCounts(countData);

        getTimes().then((timeData) => {
          setTimes(timeData);

          getScales().then((scaleData) => {
            setScales(scaleData);

            getDays().then((dayData) => {
              setDays(dayData);

              getJournals().then((journalData) => {
                setJournals(journalData);

                getJournalEntries().then((journalEntryData) => {
                  setJournalEntries(journalEntryData);
                  setIsLoading(false);

                })

              })


            })

          })

        })

      })


    })

  }, []);

  if (!isLoading){

    return (
      <>
      <JournalContext.Provider value={{"data": journals, "setData": setJournals}}>
      <JournalEntryContext.Provider value={{"data": journalEntries, "setData": setJournalEntries}}>

      <ActivityContext.Provider value={{"data": activities, "setData": setActivities}}>
      <CountContext.Provider value={{"data": counts, "setData": setCounts}}>
      <TimeContext.Provider value={{"data": times, "setData": setTimes}}>
      <ScaleContext.Provider value={{"data": scales, "setData": setScales}}>
      <DayContext.Provider value={{"data": days, "setData": setDays}}>

      <ReloadAppContext.Provider value={{"reload": forceUpdate}}>


      <Router>

        <MyNavbar />

        <Routes>
          <Route index path="/editor" element={<TimeEditor/>} />
          <Route path="/activities" element={<Activities/>} />
          <Route path="/times" element={<Times/>} />
          <Route path="/counts" element={<Counts/>} />
          <Route path="/scales" element={<Scales/>} />
          <Route path="/dashboard" element={<Dashboard/>} />

        </Routes>

      </Router>

    </ReloadAppContext.Provider>


    </DayContext.Provider>
    </ScaleContext.Provider>
    </TimeContext.Provider>
    </CountContext.Provider>
    </ActivityContext.Provider>
    </JournalEntryContext.Provider>
    </JournalContext.Provider>


    </>

    );


  }

}






export default App;
