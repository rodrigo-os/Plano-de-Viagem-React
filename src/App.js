import './App.css';
import React, { useState, useEffect } from 'react';
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

function App() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [travels, setTravels] = useState([]);
  
  async function getTravels() {
    const response = await axios.get("http://localhost:3333/travels")
    setTravels(response.data);
  }

  useEffect(()=>{
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
                            <p>{`Distância: ${travel.travel.travel_distance}`}</p>
                          </div>
                          <div className="duration">
                            <AiOutlineHourglass size={19}></AiOutlineHourglass>
                            <p>{`Tempo de viagem: ${travel.travel.travel_duration}`}</p>
                          </div>
                        </Card.Title>
                        <Card.Text class="AccordionCardText">
                          <button className='deleteButton'>
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
          <Modal.Title>Viagem</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         <input className="inputModal" placeholder='Origem'></input>
         <input className="inputModal" placeholder="Destino"></input>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Fechar
          </Button>
          <Button variant="primary">Salvar</Button>
        </Modal.Footer>
      </Modal>

      <header className="container_travels">
        <div className="header_travels">
          <h1>PLANO DE VIAGEM</h1>
        </div>
        <Travels travels={travels}></Travels>
        <Modal></Modal>
        <button onClick={handleShow} class ="createTravelBtn">Nova Viagem</button>
      </header>
    </div>
  );
}

export default App;