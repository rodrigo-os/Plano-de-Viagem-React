import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';

const apiKey = "AIzaSyDe5Y3eEHSV0KMJO8KqmBa4vofh0ju1VPg";
const mapApiJS = "https://maps.googleapis.com/maps/api/js";

function loadAsyncScript(src) {
  return new Promise(resolve =>{
    const script = document.createElement("script");
    Object.assign(script, {
      type: "text/javascript",
      async: true,
      src
    });
    script.addEventListener("load", ()=> resolve(script));
    document.head.appendChild(script);
  });
}

function App() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [travels, setTravels] = useState([]);
  const [fromAddress, setFromAddress] = useState({});
  const [toAddress, setToAddress] = useState({});
  const fromSearchInput = useRef(null);
  const toSearchInput = useRef(null);
  const [selectedTravel, setSelectedTravel] = useState();
  
  const initMapScript = () => {
    if(window.google) {
      return Promise.resolve();
    }
    const src = `${mapApiJS}?key=${apiKey}&libraries=places&v=weekly`;
    return loadAsyncScript(src);
  }

  const onChangeAddress=(autocomplete, inputType)=>{
    let sample = {
      city: "",
      state: "",
    }
    const place = autocomplete.getPlace();
    const placeType = inputType;
    place.address_components.forEach(addressComponent =>{
      const types = addressComponent.types;
      const long_name = addressComponent.long_name;
      const short_name = addressComponent.short_name;
      if(types.includes("locality")){
        sample.city = long_name;
      }else if(types.includes("administrative_area_level_2")){
        sample.city = long_name;
      }
      if(types.includes("administrative_area_level_1")){
        sample.state = short_name;
      }
    });
    if(placeType == "FROM"){
      setFromAddress(sample);
    }else{
      setToAddress(sample);
    }
  }

  const initAutocomplete=()=>{
    if(!fromSearchInput.current){
      return
    }else{
      const fromAutoComplete = new window.google.maps.places.Autocomplete(fromSearchInput.current);
      fromAutoComplete.setFields(["address_component", "geometry"]);
      fromAutoComplete.addListener("place_changed", ()=> onChangeAddress(fromAutoComplete, "FROM"));
    }
    if(!toSearchInput.current){
      return
    }else{
      const toAutoComplete = new window.google.maps.places.Autocomplete(toSearchInput.current);
      toAutoComplete.setFields(["address_component", "geometry"]);
      toAutoComplete.addListener("place_changed", () => onChangeAddress(toAutoComplete, "TO"));
    }
  }

  function traceRoute(type){
    var service = new window.google.maps.DistanceMatrixService();
    return service.getDistanceMatrix(
      {
        origins: [`${fromAddress.city},${fromAddress.state}`],
        destinations: [`${toAddress.city},${toAddress.state}`],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.metric,
        avoidHighways: false,
        avoidTolls: false,
      },
    )
    .then(response =>{
      var distance = response.rows[0].elements[0].distance;
      var duration = response.rows[0].elements[0].duration;
      if(type == "create"){
        createTravel(distance.text, duration.text);
      }else if(type == "update"){
        updateTravel(distance.text, duration.text);
      }
    });
  }

  async function getTravels() {
    const response = await axios.get("http://localhost:3333/travels")
    setTravels(response.data);
  }

  async function createTravel(distance, duration){
    let travel = {
      from:{
        city: fromAddress.city,
        state: fromAddress.state,
      },
      to:{
        city: toAddress.city,
        state: toAddress.state,
      },
      distance: distance,
      duration: duration,
    }

    await axios.post("http://localhost:3333/travel", {travel:travel});
    getTravels();
    handleClose();
  }

  async function deleteTravel(travel){
    await axios.delete(`http://localhost:3333/travel/${travel._id}`);
    getTravels();
    setSelectedTravel(undefined);
  }

  async function updateTravel(distance, duration){
    let travel = {
      _id:selectedTravel._id,
      from:{
        city: fromAddress.city,
        state: fromAddress.state,
      },
      to:{
        city: toAddress.city,
        state: toAddress.state,
      },
      distance:distance,
      duration:duration,
    }

    await axios.put("http://localhost:3333/travel", {
      travel
    });
    getTravels();
    setSelectedTravel(undefined);
    handleClose();
  }

  async function selectTravel(travel){
    setSelectedTravel(travel);
  }

  useEffect(()=>{
    initMapScript().then(()=>initAutocomplete());
    getTravels();
  },[]);

  const dragItem=React.useRef(null);
  const dragOverItem=React.useRef(null);
  
  const handleSort=()=>{
    let _travels=[...travels];
    const draggedItemContent=_travels.splice(dragItem.current, 1)[0];
    _travels.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current=null;
    dragOverItem.current=null;
    setTravels(_travels);
  }

  async function search(element){
    if(element.target.value.length == 0){
      getTravels();
      document.getElementById("select_options").style.visibility = "visible"
    }else {
      document.getElementById("select_options").style.visibility = "hidden"
      const response = await axios.get(`http://localhost:3333/travels/search/${element.target.value}`);
      setTravels(response.data)
    }
  }

  async function order(){
    const response = await axios.get(`http://localhost:3333/travels/order/${document.getElementById("select_options").value}`);
    setTravels(response.data);
  }

  const Travels = ({travels}) =>{
    return (
      <div className='travels'>
        {travels.map((travel, index) =>{
          return (
            <div className='travel px-1 py-1' draggable={true} 
              onDragStart={(e) => dragItem.current=index}
              onDragEnter={(e)=> dragOverItem.current=index}
              onDragEnd={handleSort}
              onDragOver={(e)=>e.preventDefault()}
            >
              <Accordion className='mx-4'>
                <Accordion.Item className='mt-2' eventKey="0">
                  <Accordion.Button className='shadow-md shadow-slate-400 dark:shadow-slate-900 px-1 sm:px-3 h-10 bg-stone-200 hover:bg-stone-100 dark:hover:bg-slate-200'>
                    <div className='tracking-wider text-sm font-bold grid grid-cols-11 grid-flow-col w-full'>  
                      <div className='ml-1 sm:ml-3 sm:mx-0 w-fit col-start-1 col-end-6 flex flex-row items-center justify-center space-x-2'>
                        <span>
                          <svg className='w-fit dark:text-slate-800 w-0 sm:w-5' fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"></path>
                            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z"></path>
                          </svg>
                        </span>
                        <span className='text-xs sm:text-sm'>{`${travel.travel.from.city}, ${travel.travel.from.state}`}</span>
                      </div>
                      <span className='w-fit col-start-6 col-end-6 flex flex-row items-center justify-center justify-self-start'>
                        <svg className='w-0 sm:w-6 dark:text-slate-800' fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z"></path>
                          <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z"></path>
                          <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"></path>
                        </svg>
                        <svg className='w-7 sm:w-0 dark:text-slate-800' fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"></path>
                        </svg>
                      </span>
                      <div className='w-fit col-start-8 col-end-12 flex flex-row items-center justify-center space-x-2'>
                        <span>
                          <svg className='text-slate-800 w-0 sm:w-5' fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"></path>
                          </svg>
                        </span>
                        <span className='text-xs sm:text-sm'>{`${travel.travel.to.city}, ${travel.travel.to.state}`}</span>
                      </div>
                    </div>
                  </Accordion.Button>
                  <Accordion.Body className='bg-gray-100 dark:bg-slate-100 rounded-b border-t border-gray-200 dark:border-gray-200'>
                    <div className='card'>
                      <div className='card_body'>
                        <div className='flex flex-row items-center justify-start space-x-2'>
                          <svg className='w-0 sm:w-5' fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                          </svg>
                          <span>
                            <span className='text-xs sm:text-sm font-semibold italic tracking-widest'>Distância</span>
                            <span className='text-xs sm:text-sm font-bold font-mono'>{`: ${travel.travel.distance} `}<span className='font-semibold italic tracking-widest'>km</span></span>
                          </span>
                        </div>
                        <div className="flex flex-row items-center justify-start space-x-2">
                          <svg className='w-0 sm:w-5' fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>
                            <span className='text-xs sm:text-sm font-semibold italic tracking-widest'>Tempo de viagem</span>
                            <span className='text-xs sm:text-sm font-bold font-mono'>{`: ${travel.travel.duration}`}</span>
                          </span>
                        </div>
                      </div>
                      <div className='card_footer'>
                        <button onClick = {()=>deleteTravel(travel)}>
                          <svg className='w-5 text-gray-800 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300' fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          </button>
                          <button onClick = {()=>{
                          selectTravel(travel)
                          handleShow();
                          initMapScript().then(()=>initAutocomplete());
                          }}>
                          <svg className='w-5 text-gray-800 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300' fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          )
        })}
      </div>
    )
  }
  return (
    <div className="App">
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <div className='card_header grid grid-cols-3 rounded-t-md'>
          <span className='select-none w-fit col-start-1 col-end-1 uppercase text-xl font-bold tracking-widest'>Viagem</span>
          <div className='hover:cursor-pointer col-start-3 col-end-3 place-self-end' onClick={()=>{
            handleClose();
            setSelectedTravel(undefined);
          }}>
            <svg className='btn_base rounded-full p-1 w-8' fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path clip-rule="evenodd" fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"></path>
            </svg>
          </div>
        </div>
        <div className='card_body bg-gray-100 dark:bg-slate-700 flex flex-col items-center gap-2 sm:grid sm:grid-cols-9'>
          <input className="shadow-md hover:shadow-slate-400 dark:hover:shadow-slate-800 ring-1 px-2 col-start-1 col-end-5 justify-self-start w-60 sm:w-56 h-fit rounded-md dark:bg-slate-800 dark:text-slate-200 p-1 m-0 font-semibold tracking-wide" id={"from"} ref={fromSearchInput} type="text" placeholder='Origem'></input>
          <input className="shadow-md hover:shadow-slate-400 dark:hover:shadow-slate-800 ring-1 px-2 col-start-6 col-end-10 justify-self-end w-60 sm:w-56 h-fit  rounded-md dark:bg-slate-800 dark:text-slate-200 p-1 m-0 font-semibold tracking-wide" id={"to"} ref={toSearchInput} type="text" placeholder="Destino"></input>
        </div>
        <div className='select-none card_footer dark:border-slate-500 rounded-b-md grid grid-cols-3'>
          <button className='text-center tracking-widest col-start-1 btn_base px-3 rounded-full bg-green-200 active:bg-green-300 hover:bg-green-100 w-fit dark:bg-green-800 dark:active:bg-green-900 dark:hover:bg-green-700' onClick={()=>{
              selectedTravel
                ? traceRoute("update")
                : traceRoute("create")
            }}>
              Salvar
          </button>
          <button className='select-none text-center tracking-widest col-start-3 btn_base px-3 rounded-full bg-red-200 active:bg-red-300 hover:bg-red-100 dark:bg-red-800 dark:active:bg-red-900 dark:hover:bg-red-700 justify-self-end w-fit' onClick={()=>{
            handleClose();
            setSelectedTravel(undefined);
          }}>
            Fechar
          </button>
        </div>
      </Modal>
      <div className="travels_container">  
        <div className='travels_header'>
          <h1 className='text-2xl sm:text-4xl text-center font-bold tracking-widest text-gray-700 dark:text-slate-100 select-none rounded bg-gradient-to-l from-transparent shadow-md shadow-slate-500 dark:shadow-slate-900 px-1 py-2 w-5/6 lg:w-128 font-mono'>PLANO DE VIAGEM</h1>
        </div>
        <div className='travels_body'>
          <div className='filtering_container'>
            <div className='filtering_order'>
              <select onChange = {order} id={"select_options"}>
                <option disabled>Distância</option>
                <option className='font-semibold'>Menor</option>
                <option className='font-semibold'>Maior</option>
              </select>
            </div>
            <div className='filtering_search group w-fit justify-self-end rounded-full hover:cursor-pointer'>
              <svg onClick={(()=>{document.getElementById('search_input').focus();})}className='text-gray-600 dark:text-slate-300 w-0 sm:w-8' fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M8.25 10.875a2.625 2.625 0 115.25 0 2.625 2.625 0 01-5.25 0z"></path>
                <path clip-rule="evenodd" fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.125 4.5a4.125 4.125 0 102.338 7.524l2.007 2.006a.75.75 0 101.06-1.06l-2.006-2.007a4.125 4.125 0 00-3.399-6.463z"></path>
              </svg>
              <input onChange={(event) => {search(event)}} id='search_input' className='shadow-md group-hover:shadow-slate-400 dark:group-hover:shadow-slate-800 select-none' placeholder='Pesquisar'></input>
            </div>
          </div>
          <Travels travels={travels}></Travels>
          <div className='new_travel'>
            <button className='btn_primary' onClick={()=>{
              handleShow();
              initMapScript().then(()=>initAutocomplete());
              }}>
              Nova Viagem
            </button>
          </div>
        </div>
        <div className='travels_footer'></div>
      </div>
    </div>
  );
}
export default App;