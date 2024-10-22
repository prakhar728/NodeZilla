import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Form, Stack } from 'react-bootstrap';
import { FaChartLine, FaChartPie } from "react-icons/fa6";
import Layout from '../../../app/layout'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import LineComponent from "../../../components/Line";
import PieChartComponent from '../../../components/Pie';

const AVSDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [currentChart, setCurrentChart] = useState('Line');
  const [name, setname] = useState('');

  return (
    <Layout>
      <Container fluid>
        <Row>
          <Col>
            <h1 className="text-center my-4">Metric Explorer</h1>
            <h2 className="text-center my-4">Operator {name}</h2>
            
            <div className='toggle-switch'>
              <FaChartLine />
              <div className='switch-container'>
                <Form>
                  <Form.Check
                    type="switch"
                    id="custom-switch"
                    onChange={() => {
                      setCurrentChart(currentChart == 'Line' ? 'Pie' : 'Line')
                    }}
                  />
                </Form>
              </div>
              <FaChartPie />
            </div>
            <div className='charts'>
              {id && (currentChart == 'Line' ? 
                <LineComponent operatorAddress={id} setname={setname}/> :
                <PieChartComponent operatorAddress={id} setname={setname}/>
                )
              }
           
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default AVSDetail;
