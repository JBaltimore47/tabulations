import './App.css';

import React,{useState, useEffect} from 'react';


import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";



import {
  Nav,
  Navbar,
} from "react-bootstrap";


import { httpGet, useForceUpdate } from './util.js';

import { Activities, ActivityContext } from './components/activities.js';
import { JournalContext, JournalEntryContext } from './components/journals.js';
import { Counts, CountContext } from './components/counts.js';
import { Scales, ScaleContext } from './components/scales.js';
import { Checklists, ChecklistContext } from './components/checklists.js';
import { Times, TimeContext } from './components/times.js';
import { TimeEditor } from './components/editor.js'
import { Dashboard } from './components/dashboard.js';
import { Phase } from './components/phase.js';
import { Journals, JournalSingular, JournalEntry } from './components/journals.js';

export const BACKEND_URL = "http://127.0.0.1:8000";
export const FRONTEND_URL = "http://127.0.0.1:3000";

function MyNavbar(props){
  return (
  <>
    <Navbar bg="dark" variant="dark" expand="md" className="d-flex justify-content-between">

      <Navbar.Brand className="text-light mx-3" href="/home"><h1>Tabulations</h1></Navbar.Brand>

      <Nav variant="pills" className="d-flex justify-content-around pl-4" style={{paddingRight: "20px", width: "50%"}}>

      <div className="d-flex justify-content-around w-100 ms-2">



        <div className="d-flex justify-content-begin">
          <Nav.Link className="align-self-center" href="/activities">Activities</Nav.Link>
          <Nav.Link className="align-self-center" href="/checklists">Checklists</Nav.Link>
          <Nav.Link className="align-self-center" href="/times">Times</Nav.Link>
          <Nav.Link className="align-self-center" href="/counts">Counts</Nav.Link>
          <Nav.Link className="align-self-center" href="/journals">Journals</Nav.Link>
        </div>

        <div className="d-flex">
          <Nav.Link className="align-self-center text-light" href="/editor">Time editor</Nav.Link>
          <Nav.Link className="align-self-center text-light" href="/phase">Phase</Nav.Link>
          <Nav.Link className="align-self-center text-light" href="/dashboard">Dashboard</Nav.Link>
        </div>


      </div>
      </Nav>


    </Navbar>
  </>
);
}

export const DayContext = React.createContext();

const ReloadAppContext = React.createContext();

function App() {

  const forceUpdate = useForceUpdate();
  const [activities, setActivities] = useState([]);
  const [counts, setCounts] = useState([]);
  const [times, setTimes] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [scales, setScales] = useState([]);
  const [days, setDays] = useState([]);
  const [journals, setJournals] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    
    async function setData(){
         await httpGet(BACKEND_URL + "/activity/").then(data => setActivities(data) );
         await httpGet(BACKEND_URL + "/count/").then(data => setCounts(data));
         await httpGet(BACKEND_URL + "/time/").then(data => setTimes(data));
         await httpGet(BACKEND_URL + "/checklist/").then(data => setChecklists(data));
         await httpGet(BACKEND_URL + "/scale/").then(data => setScales(data));
         await httpGet(BACKEND_URL + "/day/").then(data => setDays(data));  
         await httpGet(BACKEND_URL + "/journal/").then(data => setJournals(data));
         await httpGet(BACKEND_URL + "/journal_entry/").then(data => setJournalEntries(data));
          
         setIsLoading(false);
    };
     
    setData();

  }, []);

  if (!isLoading){

    return (
      <>
      <JournalContext.Provider value={{"data": journals, "setData": setJournals}}>
      <JournalEntryContext.Provider value={{"data": journalEntries, "setData": setJournalEntries}}>

      <ActivityContext.Provider value={{"data": activities, "setData": setActivities}}>
      <CountContext.Provider value={{"data": counts, "setData": setCounts}}>
      <TimeContext.Provider value={{"data": times, "setData": setTimes}}>
      <ChecklistContext.Provider value={{"data": checklists, "setData": setChecklists}}>
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
          <Route path="/checklists" element={<Checklists/>} />
          <Route path="/phase" element={<Phase/>} />
          <Route path="/journals" element={<Journals/>}/>
          <Route path="/journals/:journalId" element={<JournalSingular/>} />
          <Route path="/entries/:entryId" element={<JournalEntry />} />
        </Routes>

      </Router>

    </ReloadAppContext.Provider>


    </DayContext.Provider>
    </ScaleContext.Provider>
    </ChecklistContext.Provider>
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
