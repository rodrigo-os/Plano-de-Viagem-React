import './App.css';
import { 
  AiFillEnvironment,AiOutlineEnvironment,
  AiOutlineArrowRight,AiOutlineHourglass, 
  AiOutlineCar,AiFillDelete,AiFillEdit,
} from "react-icons/ai";

import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';


function App() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
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
        <div className="travels">
          <div className='travel'>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header className='Accordion-Header'>
                  <div className='from'>
                    <span>
                      <AiFillEnvironment size={20}></AiFillEnvironment>
                    </span>
                    <p>Canoinhas, SC</p>
                  </div>
                  <span className='arrowIcon'>
                    <AiOutlineArrowRight size={20}></AiOutlineArrowRight>
                  </span>
                  <div className='to'>
                    <span>
                      <AiOutlineEnvironment size={20}></AiOutlineEnvironment>
                    </span>
                    <p>Ponta Grossa, PR</p>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="Accordion-Body">
                  <Card>
                    <Card.Body class="AccordionCardBody">
                      <Card.Title class="AccordionCardTitle">
                        <div className='distance'>
                          <AiOutlineCar size={19}></AiOutlineCar>
                          <p>Distância: 167,2 KM</p>
                        </div>
                        
                        <div className="duration">
                          <AiOutlineHourglass size={19}></AiOutlineHourglass>
                          <p>Tempo de viagem: 3H</p>
                        </div>
                      </Card.Title>
                      <Card.Text class="AccordionCardText">
                        <button className='deleteButton'>
                          <AiFillDelete size={19}></AiFillDelete>
                        </button>
                        <button variant="outline-dark" className='updateButton'>
                          <AiFillEdit size={19}></AiFillEdit>
                        </button>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
          <div className='travel'>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header className='Accordion-Header'>
                  <div className='from'>
                    <span>
                      <AiFillEnvironment size={20}></AiFillEnvironment>
                    </span>
                    <p>Mafra, SC</p>
                  </div>
                  <span className='arrowIcon'>
                    <AiOutlineArrowRight size={20}></AiOutlineArrowRight>
                  </span>
                  <div className='to'>
                    <span>
                      <AiOutlineEnvironment size={20}></AiOutlineEnvironment>
                    </span>
                    <p>Itu, SP</p>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="Accordion-Body">
                  <Card>
                    <Card.Body class="AccordionCardBody">
                      <Card.Title class="AccordionCardTitle">
                        <div className='distance'>
                          <AiOutlineCar size={19}></AiOutlineCar>
                          <p>Distância: 526,9 KM</p>
                        </div>
                        
                        <div className="duration">
                          <AiOutlineHourglass size={19}></AiOutlineHourglass>
                          <p>Tempo de viagem: 7H 50 min</p>
                        </div>
                      </Card.Title>
                      <Card.Text class="AccordionCardText">
                        <button className='deleteButton'>
                          <AiFillDelete size={19}></AiFillDelete>
                        </button>
                        <button variant="outline-dark" className='updateButton'>
                          <AiFillEdit size={19}></AiFillEdit>
                        </button>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </div> 

        <Modal></Modal>
        <button onClick={handleShow} class ="createTravelBtn">Nova Viagem</button>
      </header>
    </div>
  );
}

export default App;
