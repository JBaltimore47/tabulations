import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import { Chrono } from "react-chrono";
import '../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../custom_draft.css'


import React,{useState, useEffect, useContext} from 'react';

import {
  Button,
  Form,
  Card,
  Nav
} from "react-bootstrap";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import {
  FRONTEND_URL,
  BACKEND_URL
} from '../App.js';

import {
  httpPost,
  httpPut,
  httpDelete,
  useForceUpdate
} from '../util.js';

import {
    AiOutlineCheck
} from 'react-icons/ai';


export const JournalContext = React.createContext();
export const JournalEntryContext = React.createContext();


export function JournalEntry(props){
  


  const forceUpdate = useForceUpdate();
  const navigate = useNavigate();
  const journalEntryContext = useContext(JournalEntryContext);
  const entries = journalEntryContext.data;
  const [isLoading, setIsLoading] = useState(true);
  const [entry, setEntry] = useState({});
  const [title, setTitle] = useState("");
  const [ edit, setEdit ] = useState(false);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);
  const [ updateStatus, setUpdateStatus ] = useState(<></>);
  const [editorState, setEditorState] = useState(
  () => EditorState.createEmpty(),
  );
  const { entryId } = useParams();
    


  const onChangeEditor = (contentState) => {
    setHasBeenEdited(true);
    setEditorState(contentState);
  }

  useEffect(() => {
      //this will run every second
      const interval = setInterval(() => {
        if (hasBeenEdited){
          let obj = entry;
          obj.content = convertToRaw(editorState.getCurrentContent());
          obj.title = title;
          httpPut(`${BACKEND_URL}/journal_entry/${obj.id}/`, obj).then((obj) => {
            let element = <span className="text-success">Automatically saved<AiOutlineCheck /></span>
            setUpdateStatus(element);
            setHasBeenEdited(false);
          })
        }  
      }, 5000);

      return () => clearInterval(interval);
  })

  useEffect(() => {

    let obj = entries.find((obj) => obj.id == entryId);

    let contentState = convertFromRaw(obj.content);
    let editorState = EditorState.createWithContent(contentState);        
    setTitle(obj.title);
    setEntry(obj);
    setEditorState(editorState);
    setIsLoading(false);
  }, []);


  const onUpdate = (event) => {
    setHasBeenEdited(false);
    let obj = entry;
    obj.content = convertToRaw(editorState.getCurrentContent());
    obj.title = title;
    httpPut(`${BACKEND_URL}/journal_entry/${obj.id}/`, obj).then((obj) => {
      let element = <span className="text-success">Saved  <AiOutlineCheck /></span>
      setUpdateStatus(element);
    })

  }

  const onDelete = (event) => {
    httpDelete(`${BACKEND_URL}/journal_entry/${entry.id}/`);
    
    navigate(`/journals/${entry.journal_pk}`);
    window.location.reload();
  }
  if (!isLoading){
    return (
     <div style={{width:"100vw", height: "100vh"}} className="bg-dark text-light pt-3">
        <div className="d-flex justify-content-between pb-2">
          <div className="d-flex justify-content-begin w-50">

             <Form.Control style={{width: "50%", border: "none"}} onChange={(event) => { setTitle(event.target.value) }} className="bg-dark text-light mx-1 mb-1" type="text" value={title} />
             <Button className="mx-3" name="addEntry" onClick={onUpdate} variant="warning">Update</Button>
             <Button className="mx-3" name="addEntry" onClick={(event) => setEdit(!edit) } variant={!edit && "warning" || "primary"} >{ !edit && "Edit" || "View" }</Button>
             <Button className="mx-3" name="addEntry" onClick={onDelete} variant="danger">Delete</Button>
           </div>
          <div style={{marginRight: "100px"}}>
           { updateStatus }
          </div>
         </div> 
         <Editor
          wrapperClassName="bg-dark h-100"
          editorClassName="text-light p-5"
          editorState={editorState}
          onEditorStateChange={onChangeEditor}
          readOnly={!edit}
        />
     </div>
    )
  }
}



function JournalTimeline(props){
   const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];   

    /* 
    1. Build and display items from journalEntries - done
    2. Allow for entering Editor mode
    3. Filtering by date range. 
    
    function that handles timeline click: handleTimelineItemClick()
    we could either overwrite this function or we could add a double-click functionality (which would be so much cooler).
    Problem is we have to learn how it (and typescript) works.

    */
  //   const items = [{
  //     title: "May 1940",
  //     cardTitle: "Dunkirk",
  //     url: "http://www.history.com",
  //     cardSubtitle:"Men of the British Expeditionary Force (BEF) wade out to..",
  //     cardDetailedText: "Men of the British Expeditionary Force (BEF) wade out to..",
  //     media: {
  //       type: "IMAGE",
  //       source: {
  //         url: "http://someurl/image.jpg"
  //       }
  //     }
  //   }, 
  //   {
  //     title: "August 1942",
  //     cardTitle: "Dunkirk",
  //     url: "http://www.history.com",
  //     cardSubtitle:"Men of the British Expeditionary Force (BEF) wade out to..",
  //     cardDetailedText: "Men of the British Expeditionary Force (BEF) wade out to..",
  //     media: {
  //       type: "IMAGE",
  //       source: {
  //         url: "http://someurl/image.jpg"
  //       }
  //     }
  //   }
  // ];

     const forceUpdate = useForceUpdate();
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
    );
  
  
  
  let journalEntries = useContext(JournalEntryContext);
  let [entries, setEntries] = useState([]);
  console.log("JOURNAL: ", props.journal);
  useEffect(() => {

    let buildItems = async (entries) => {
      console.log(props.journal.id);
      let e = await journalEntries.data.filter((obj) => obj.journal_pk == props.journal.id);
      
      let itemsArr = await e.map((obj) => {
        let date = new Date(obj.created_at * 1000); 
        let text = "";
         
        for (let i = 0; i < obj.content.blocks.length; i++){
          let line = obj.content.blocks[i];
          if (line.text != ""){
            if (text.length < 50){
              text+=line.text;
            }else {
              break;
            }

          }
        }
        
        // let contentState = convertFromRaw(obj.content);
        // let editorState = EditorState.createWithContent(contentState);        
        let customNode = (
          <>
            <div onDoubleClick={(event) => { console.log ("test!")}}>
            <div  style={{minHeight: "90px"}}>
              <span className="text-dark">{ text }</span>
            </div>
            </div>
          </>
        )
        console.log("OBJECT: ", obj, date);
        let newObj = {
          title: `${obj.title} - ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
          cardTitle: obj.title,
          // cardDetailedText: text,
          url: `${FRONTEND_URL}/entries/${obj.id}`,
          timelineContent: customNode
         
        };
        

        return newObj;
      });
      setItems(itemsArr);
      setEntries(e);
      setIsLoading(false); 
    }

    buildItems();

    
  }, [props.journal]);
  
  console.log(entries);
  if (!isLoading){
    console.log("EDITORSTATE: ", editorState); 
    console.log("ITEMS: ", items);
    // let rawContent = convertToRaw(editorState.getCurrentContent());
    // const markup = draftToHtml(rawContent);  

     return (
     <>
     <div className="text-dark" style={{width: "100%", paddingtop: "20px"}}>
      <h3 style={{textAlign: "center"}}>{props.journal.name}</h3>
      <Chrono 
      //colors:
      //#FFCA2C
      //#4A90E2"
      //#31D2F2
      //#BB2D3B
      //#212529
      items={items}
      theme={{
        primary: "black",
        secondary: "#BB2D3B",
        cardBgColor: "#F8F9FA",
        cardForeColor: "violet",
        titleColor: "#F8F9FA",
        titleColorActive: "#F8F9FA",
        detailsColor: "#F8F9FA",
        nestedCardDetailsColor: "#F8F9FA"
      }}
      mode="VERTICAL" 

      />      
     </div>
    </>
    )   
  }

}



export function JournalSingular(props){
     
  const { journalId } = useParams();
  const [title, setTitle] = useState("");
  const journalContext = useContext(JournalContext);
  const journalEntryContext = useContext(JournalEntryContext);
  const [journal, setJournal] = useState({});
  const [action, setAction] = useState("showEntries");
  const [isLoading, setIsLoading] = useState(true);    
  const forceUpdate = useForceUpdate();

  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );

  useEffect(() => {

    if (journalContext.data.length > 0){
      let j = journalContext.data.find((obj) => obj.id == journalId);

      setJournal(j);
      setIsLoading(false);
    }else{
      console.log("NO DATA IN JOURNALCONTEXT");
    }

  }, []);



  const onChangeEditor = (contentState) => {
    setEditorState(contentState);
  }

  const onChangeAction = (event) => {
    let a = event.target.name;
    console.log(editorState);
    if (a == action && action == "addEntry"){
      let data = {
        title: title,
        detached: false,
        journal_pk: journal.id,
        content: convertToRaw(editorState.getCurrentContent())
      }
      httpPost(BACKEND_URL + '/journal_entry/', data);
    }

    setAction(event.target.name)
  }



  return (
    <>
         <div className="bg-dark" style={{width:"100%"}}>
           <div className="bg-dark p-3" style={{width:"100%"}}>
              <Button name="addEntry" onClick={onChangeAction} variant="warning">Add entry</Button>
              <Button name="showEntries" onClick={onChangeAction} className="mx-3" variant="success">Entries</Button>
              <Button name="readJournal" onClick={onChangeAction} variant="info">Read</Button>
              <Button name="deleteJournal" onClick={onChangeAction} className="mx-3" variant="danger">Delete journal</Button>
           </div>
            { action == "showEntries" && <JournalTimeline journal={journal}/> }
            { action == "addEntry" && <> 

            <Form.Control style={{width: "40%", border: "none"}} onChange={(event) => { setTitle(event.target.value) }} className="bg-dark text-light m-3" type="text" placeholder="Title..."/>
            <Editor
              
              wrapperClassName="bg-dark h-100"
              editorClassName="text-light p-5"
              toolbarClassName="my-toolbar border-dark"
              onEditorStateChange={onChangeEditor}
            /></> }

        </div>
    </>
  )


}


export function Journals(props){
    
  const journalContext = useContext(JournalContext);
    /*

    Journals are meant to be a nice way to keep any number and types of different journals. You create a journal
    and then you are able add, update and delete entries in it. the entries themselves are "appended" to the days that
    you wrote them. Each journal entry will have it's own page and will be edited with a nice editor.


    Best ever: https://jpuri.github.io/react-draft-wysiwyg/#/docs


    TODO:
    - Add, delete and read full journal
    - Ctrl-S update 
    - Select a journal as "main", which will be used to add entries from the timeEditor. This could be called, 'progress journal', or similar.
    - Add journal title in timeline and when adding entry.
    - Add "are you sure you want to delete?"
    - When adding entry, change button to "Submit entry" if you've clicked it once and started writing title or data, once submitted, implement standard update and auto-update. 

    */

                    // return <Button onClick={onSelectJournal} name={obj.id} variant="dark"><p className="text-light">{obj.name}</p></Button>;
    return (
      <>
      <div className="d-flex justify-content-center bg-dark" style={{width: "100%", height: "100%"}}>
      <Card style={{width: "40%"}} className="bg-dark text-light">
        <Card.Body>
          <Card.Title style={{textAlign: "center", fontSize: "23px"}}>Journals</Card.Title>
          <Card.Text>
             <div style={{height: "100vh"}} className="bg-dark text-light d-flex flex-column">
                  { journalContext.data && journalContext.data.length > 0 && journalContext.data.map((obj) => {
                    return <Nav.Link className="align-self-center w-100 d-flex justify-content-center" href={`journals/${obj.id}`}><Button className="w-100" variant="dark">{obj.name}</Button></Nav.Link>
                  }) }
            </div>
          </Card.Text>
          <Button variant="primary">Go somewhere</Button>
        </Card.Body>
      </Card>         
      </div>

      </>
  )
}

