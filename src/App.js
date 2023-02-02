import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { 
  AiFillEnvironment,AiOutlineEnvironment,
  AiOutlineArrowRight,AiOutlineHourglass, 
  AiOutlineCar,AiFillDelete,AiFillEdit,
} from "react-icons/ai";

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
    console.log(type)
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
  }

  useEffect(()=>{
    initMapScript().then(()=>initAutocomplete());
    getTravels();
  },[]);

  const Travels = ({travels}) =>{
    return (
      <div className='travels'>
        {travels.map(travel =>{
          return (
            <div className='travel'>
              <Accordion>
                <Accordion.Item eventKey="0">
                  <Accordion.Header className='Accordion-Header'>
                    <div className='from'>
                      <span>
                        <AiFillEnvironment size={20}></AiFillEnvironment>
                      </span>
                      <p>{`${travel.travel.from.city}, ${travel.travel.from.state}`}</p>
                    </div>
                    <span className='arrowIcon'>
                      <AiOutlineArrowRight size={20}></AiOutlineArrowRight>
                    </span>
                    <div className='to'>
                      <span>
                        <AiOutlineEnvironment size={20}></AiOutlineEnvironment>
                      </span>
                      <p>{`${travel.travel.to.city}, ${travel.travel.to.state}`}</p>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="Accordion-Body">
                    <Card>
                      <Card.Body class="AccordionCardBody">
                        <Card.Title class="AccordionCardTitle">
                          <div className='distance'>
                            <AiOutlineCar size={19}></AiOutlineCar>
                            <p>{`Distância: ${travel.travel.distance}`}</p>
                          </div>
                          <div className="duration">
                            <AiOutlineHourglass size={19}></AiOutlineHourglass>
                            <p>{`Tempo de viagem: ${travel.travel.duration}`}</p>
                          </div>
                        </Card.Title>
                        <Card.Text class="AccordionCardText">
                          <button onClick = {()=>deleteTravel(travel)}className='deleteButton'>
                            <AiFillDelete size={19}></AiFillDelete>
                          </button>
                          <button className='updateButton'>
                            <AiFillEdit size={19}></AiFillEdit>
                          </button>
                        </Card.Text>
                      </Card.Body>
                    </Card>
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
        <Modal.Header closeButton>
          <Modal.Title>
            Viagem</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input className="inputModal" id={"from"} ref={fromSearchInput} type="text" placeholder='Origem'></input>
          <input className="inputModal" id={"to"} ref={toSearchInput} type="text" placeholder="Destino"></input>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Fechar
          </Button>
          <Button onClick={()=>{
            traceRoute("create")
          }} variant="primary">Salvar</Button>
        </Modal.Footer>
      </Modal>
      <header className="container_travels">
        <div className="header_travels">
          <h1>PLANO DE VIAGEM</h1>
        </div>
        <Travels travels={travels}></Travels>
        <Modal></Modal>
        <button onClick={()=>{
          handleShow();
          initMapScript().then(()=>initAutocomplete());
        }} class ="createTravelBtn">
          Nova Viagem
        </button>
      </header>
    </div>
  );
}
export default App;