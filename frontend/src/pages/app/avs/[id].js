import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { GetCombinedOperatorsData } from '../../../services/eigenlayer';
import Layout from '../../../app/layout'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from 'next/image';
import { GetOperatorData } from '../../../services/nodezilla';

const AVSDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const [operatorData, setOperatorData] = useState([]);
  const [avsName, setAvsName] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchOperatorsData = useCallback(async (operatorAddress) => {
    try {
      setLoading(true);
      const data = await GetOperatorData(operatorAddress);

      setOperatorData(data);
    } catch (error) {
      console.error("Error fetching operators' data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchOperatorsData(id);
    }
  }, [id, fetchOperatorsData]);


  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const formatNumber = (number, format) => {
    return new Intl.NumberFormat('en-US', format).format(number);
  };

  return (
    <Layout>
      <Container fluid>
        <Row>
          <Col>
            <h1 className="text-center my-4">AVS Explorer</h1>
            <h2 className="text-center my-4">Operators for AVS {avsName}</h2>
            
            <div className="table-responsive">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Operator Logo</th>
                    <th>Operator Name</th>
                    <th>Operator Website</th>
                    <th>Operator Twitter</th>
                    <th>Registered Time</th>
                    <th>Total TVL</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Current # of Stakers</th>
                  </tr>
                </thead>
                <tbody>
                  {operatorData.map((operator, index) => (
                    <tr key={index}>
                      <td>
                        <Image src={operator.logo} alt={`${operator.operator_name} logo`} width={50} height={50} />
                      </td>
                      <td>{operator.operator_name}</td>
                      <td><a href={operator.website} target="_blank" rel="noopener noreferrer">Website</a></td>
                      <td><a href={operator.twitter} target="_blank" rel="noopener noreferrer">Twitter</a></td>
                      <td>{formatDate(operator.registered_time)}</td>
                      <td>{formatNumber(operator.total_TVL, { style: 'decimal', maximumFractionDigits: 2 })}</td>
                      <td>{formatNumber(operator.num_stakers, { style: 'decimal', maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default AVSDetail;
