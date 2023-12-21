
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

export const ScaleContext = React.createContext();
export function Scales(props){

  const forceUpdate = useForceUpdate();
  const scaleContext = useContext(ScaleContext);
  const [scaleFormData, setScaleFormData] = useState([]);

  const [scaleFormMessage, setScaleFormMessage] = useState([]);
  const [addScaleFormData, setAddScaleFormData] = useState({"limit_timescale": "days"});
  const [showAdd, setShowAdd] = useState(false);


  useEffect(() => {


      //this will run every second
      const interval = setInterval(() => {

        let formMessage = scaleFormMessage.map((obj) => {
          return {};

        })

        setScaleFormMessage(formMessage);

      }, 6000);
      return () => clearInterval(interval);

  }, []);


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

    let formMessage = scaleFormMessage; 


    httpPut(`${BACKEND_URL}/scale/${obj.id}/`, obj).then((data) => {
      scaleContext.setData(scaleFormData);
      let element = <span className="text-success"><AiOutlineCheck /></span>
      formMessage[index] = {message: element};
      forceUpdate();

      setScaleFormMessage(formMessage);       
    }).catch((err) => {
      let element = React.createElement("span", {"className": "text-danger mt-2"}, err.error );
      formMessage[index] = {message: element};;

      forceUpdate();
      setScaleFormMessage(formMessage);       
    });




  }

  const handleDeleteScale = (event) => {
    const index = parseInt(event.target.attributes.index.nodeValue);
    let formData = scaleFormData;
    const obj = formData[index];
    httpDelete(`${BACKEND_URL}/scale/${obj.id}/`);

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
    
    httpPost(BACKEND_URL + '/scale/', obj);

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

                <Form.Group className="mt-3">
                  { scaleFormMessage[idx] != undefined &&  scaleFormMessage[idx].message }
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

