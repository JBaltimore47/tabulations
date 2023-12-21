import React,{useState, useContext, useEffect, useCallback, useLayoutEffect} from 'react';

import {
    
    httpPut,
    httpPost,
    httpDelete,
    useForceUpdate 
} from '../util.js';


import {
    AiOutlineCheck
} from 'react-icons/ai';

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


import { BACKEND_URL } from '../App.js';


export const TimeContext = React.createContext();


export function Times(props)
{
  const forceUpdate = useForceUpdate();
  const timeContext = useContext(TimeContext);
  let times = timeContext.data;


  const [timeScaleIsShown, setTimeScaleIsShown] = useState(false);
  const [timeFormData, setTimeFormData] = useState([]);
  const [timeFormMessage, setTimeFormMessage] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [addTimeFormData, setAddTimeFormData] = useState({active: false});

  useEffect(() => {


      //this will run every second
      const interval = setInterval(() => {

        let formMessage = timeFormMessage.map((obj) => {
          return {};

        })

        setTimeFormMessage(formMessage);

      }, 10000);
      return () => clearInterval(interval);

  }, []);




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
      httpPut(`${BACKEND_URL}/time/${newObj.id}/`, newObj)
      .then((data) => {
          let element = <span className="text-success"><AiOutlineCheck /></span>
          formMessage[index] = {message: element};
          setTimeFormMessage(formMessage);
          forceUpdate();
          timeContext.setData(timeFormData);
        })
      .catch((err) => {
          let element = React.createElement("span", {"className": "text-danger"}, err.error);
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
    
    httpDelete(`${BACKEND_URL}/time/${obj.id}/`);

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


    httpPost(BACKEND_URL + '/time/', newObj);
    //addTime(newObj);

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

