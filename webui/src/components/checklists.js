
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

export const ChecklistContext = React.createContext();
export function Checklists(props){

  const forceUpdate = useForceUpdate();
  const checklistContext = useContext(ChecklistContext);
  const [checklistFormData, setChecklistFormData] = useState([]);

  const [checklistFormMessage, setChecklistFormMessage] = useState([]);
  const [addChecklistFormData, setAddChecklistFormData] = useState({"limit_timechecklist": "days"});
  const [showAdd, setShowAdd] = useState(false);


  useEffect(() => {


      //this will run every second
      const interval = setInterval(() => {

        let formMessage = checklistFormMessage.map((obj) => {
          return {};

        })

        setChecklistFormMessage(formMessage);

      }, 6000);
      return () => clearInterval(interval);

  }, []);


  useEffect(() => {
    let formData = checklistContext.data;
    formData.map((obj) => {
      return {...obj};
    })
    setChecklistFormData(formData);

  }, []);


  const handleChangeChecklist = (event) => {

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
        value = !checklistFormData[index]["active"];
      }


      let formData = checklistFormData;
      formData[index][key] = value;
      setChecklistFormData(formData);
      forceUpdate();
    }



  }

  const handleSubmitChangeChecklist = (event) => {
    event.preventDefault();
    const index = parseInt(event.target.attributes.index.nodeValue);

    const obj = checklistFormData[index];

    let formMessage = checklistFormMessage; 


    httpPut(`${BACKEND_URL}/checklist/${obj.id}/`, obj).then((data) => {
      checklistContext.setData(checklistFormData);
      let element = <span className="text-success"><AiOutlineCheck /></span>
      formMessage[index] = {message: element};
      forceUpdate();

      setChecklistFormMessage(formMessage);       
    }).catch((err) => {
      let element = React.createElement("span", {"className": "text-danger mt-2"}, err.error );
      formMessage[index] = {message: element};;

      forceUpdate();
      setChecklistFormMessage(formMessage);       
    });




  }

  const handleDeleteChecklist = (event) => {
    const index = parseInt(event.target.attributes.index.nodeValue);
    let formData = checklistFormData;
    const obj = formData[index];
    httpDelete(`${BACKEND_URL}/checklist/${obj.id}/`);

    delete formData[index];
    checklistContext.setData(formData);
    setChecklistFormData(formData);
    forceUpdate();
  }



  const handleShowAdd = (event) => {
    setAddChecklistFormData({"limit_timechecklist": "days"});
    setShowAdd(!showAdd);
  }

  const handleSubmitAdd = (event) => {
    event.preventDefault();
    let obj = addChecklistFormData;

    if (obj.active == undefined)
    {
      obj.active = false;
    }
    
    httpPost(BACKEND_URL + '/checklist/', obj);

    setShowAdd(false);
    window.location.reload();

  }



  const handleChangeAddChecklist = (event) => {



    const key = event.target.name;
    let val = event.target.value;
    if (key == "active"){
      val = !addChecklistFormData["active"]
    }


    if (val == undefined)
    {
      val = event.target.attributes.value.nodeValue;
    }

    setAddChecklistFormData({...addChecklistFormData, [key]: val} );

  }







  return (
    <>
    <div className="d-flex">
      <div className="bg-dark" style={{width:"20%"}}></div>
      <div className="bg-dark" style={{width: "60%", padding:"50px"}}>
        <Button variant="success" onClick={handleShowAdd}>Add</Button>

        <ul style={{listStyleType: "none"}}>
          { checklistFormData && checklistFormData.length > 0 && checklistFormData.map((obj, idx) => {

            return (
              <li style={{borderBottom: "solid 1px gray", paddingBottom:"20px"}}>

              <Form index={idx} className="text-light" onSubmit={handleSubmitChangeChecklist}>
                <Form.Group className="mt-3">
                  <Form.Label><h5>{checklistContext.data[idx].name}</h5></Form.Label>
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
                        <Form.Check index={idx} type="checkbox" name={key} checked={obj[key]} label={key} onChange={handleChangeChecklist}></Form.Check>
                      </Form.Group>
                    )
                  }



                  return (
                    <>
                      <Form.Label>{key}</Form.Label>
                      <Form.Group className="mb-3">
                        <Form.Control index={idx} style={{width: "40%"}} type="text" as={key == "description" ? "textarea" : "input"} name={key} value={obj[key]} onChange={handleChangeChecklist}/>
                      </Form.Group>
                    </>
                  )



                })}
                <Form.Group className="mt-3">
                  <Button variant="info" type="submit">Update</Button>
                  <Button style={{marginLeft:"10px"}} variant="danger" index={idx} onClick={handleDeleteChecklist}>Delete</Button>
                </Form.Group>

                <Form.Group className="mt-3">
                  { checklistFormMessage[idx] != undefined &&  checklistFormMessage[idx].message }
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
        <Modal.Title>Add checklist</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmitAdd}>
        <Modal.Body className="bg-dark text-white">

          <Form.Label>Name</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="text" name="name" onChange={handleChangeAddChecklist}/>
          </Form.Group>

          <Form.Label>Description</Form.Label>
          <Form.Group className="mb-3 d-flex">
              <Form.Control style={{width: "40%"}} type="text" as="textarea" name="description" onChange={handleChangeAddChecklist}/>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Check type="checkbox" name="active" checked={addChecklistFormData["active"]} label="Active" onChange={handleChangeAddChecklist}></Form.Check>
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

