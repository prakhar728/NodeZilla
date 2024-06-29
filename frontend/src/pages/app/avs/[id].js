import React from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import Layout from '../../../app/layout'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import LineComponent from "../../../components/Line";

const AVSDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <Container fluid>
        <Row>
          <Col>
            <h1 className="text-center my-4">AVS Explorer</h1>
            <h2 className="text-center my-4">Operator {id}</h2>
            
            {id &&
            <LineComponent operatorAddress={id}/>
            }
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default AVSDetail;
