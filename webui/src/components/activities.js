import React,{useState, useContext, useEffect, useCallback, useLayoutEffect} from 'react';
import { BlockPicker, SketchPicker } from "react-color";


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


export const ActivityContext = React.createContext();


export function Activities(props)
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


    delete obj["timeScaleIsShown"];

    httpPut(`${BACKEND_URL}/activity/${obj.id}/`, obj).then((data) => {
      activityContext.setData(activityFormData);
      let element = <span className="text-success"><AiOutlineCheck /></span>
      formMessage[index] = {message: element};
      forceUpdate();

      setActivityFormMessage(formMessage);       
    }).catch((err) => {
      let element = React.createElement("span", {"className": "text-danger mt-2"}, err.error );
      formMessage[index] = {message: element};;

      forceUpdate();
      setActivityFormMessage(formMessage);       
    });

  }

  const handleDeleteActivity = (event) => {
    const index = parseInt(event.target.attributes.index.nodeValue);
    let formData = activityFormData;
    const obj = formData[index];

    httpDelete(`${BACKEND_URL}/activity/${obj.id}/`);

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


    
    httpPost(BACKEND_URL + '/activity/', obj);


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

