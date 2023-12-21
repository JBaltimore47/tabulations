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
export const CountContext = React.createContext();

export function Counts(props){
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

  const [countFormMessage, setCountFormMessage] = useState([]);
  const [timeScaleIsShown, setTimeScaleIsShown] = useState(false);
  const [addCountFormData, setAddCountFormData] = useState({"limit_timescale": "days"});
  const [showAdd, setShowAdd] = useState(false);




  useEffect(() => {
      const interval = setInterval(() => {
        let formMessage = countFormMessage.map((obj) => {
          return {};

        })
        setCountFormMessage(formMessage);

      }, 6000);
      return () => clearInterval(interval);

  }, []);






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

    let formMessage = countFormMessage;
    delete obj["timeScaleIsShown"];

    httpPut(`${BACKEND_URL}/count/${obj.id}/`, obj).then((data) => {
      countContext.setData(countFormData);
      let element = <span className="text-success"><AiOutlineCheck /></span>
      formMessage[index] = {message: element};
      forceUpdate();
      setCountFormMessage(formMessage);      

    }).catch((err) => {
      let element = React.createElement("span", {"className": "text-danger mt-2"}, err.error );
      formMessage[index] = {message: element};;
      forceUpdate();
      setCountFormMessage(formMessage);       
    });




    countContext.setData(countFormData);
  }

  const handleDeleteCount = (event) => {
    const index = parseInt(event.target.attributes.index.nodeValue);
    let formData = countFormData;
    const obj = formData[index];

    httpDelete(`${BACKEND_URL}/count/${obj.id}/`);

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

    httpPost(BACKEND_URL + '/count/', obj)

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

                                        
                <Form.Group className="mt-3">
                  { countFormMessage[idx] != undefined &&  countFormMessage[idx].message }
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

