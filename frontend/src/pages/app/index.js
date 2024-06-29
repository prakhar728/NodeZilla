import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Table, Container, Row, Col, Button } from 'react-bootstrap';
import { GetCombinedAVSData } from '../../services/nodezilla';
import Layout from '../../app/layout'; // Import the Layout component
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../app/globals.css';

const HomePage = ({ allNodes }) => {
  const router = useRouter();
  const [avsList, setAvsList] = useState( allNodes || []);

  
  const handleNumOperatorsClick = (avs) => {
    if (avs.status == 'active')
      router.push(`/app/avs/${avs.operator_contract_address}`);
  };


  const fetchAllOperators = async() => {
    const allNodes = await GetCombinedAVSData();

    setAvsList(allNodes);
  }


  useEffect(() => {
    fetchAllOperators()
  }, [])


  return (
    <Layout>  {/* Wrap the content with Layout */}
      <Container fluid>
        <Row>
          <Col md={12}>
            <h1 className="text-center my-4">AVS Explorer</h1>
            <p className="text-center mb-4">
              Welcome to the AVS Explorer, your one-stop destination to explore actively validated services. Discover detailed information about various services, their descriptions, and how to connect with them.
            </p>
            <div className="table-responsive">
              <Table striped bordered hover responsive className="avs-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Twitter</th>
                    <th>Website</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {avsList.map(avs => (
                    <tr key={avs.operator_contract_address} onClick={() => handleNumOperatorsClick(avs)} className='clickable-cell'>
                      <td>
                        <img src={avs.logo} alt={`${avs.operator_name} logo`} width={50} height={50} />
                      </td>
                      <td>{avs.operator_name}</td>
                      <td>{avs.description}</td>
                      <td><a href={avs.twitter} target="_blank" rel="noopener noreferrer">Twitter</a></td>
                      <td><a href={avs.website} target="_blank" rel="noopener noreferrer">Website</a></td>
                      <td>
                        {avs.status}
                      </td>
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

export async function getStaticProps() {
  try {
    const allNodes = await GetCombinedAVSData();

    return { props: { allNodes: allNodes } };
  } catch (error) {
    console.error('Error fetching AVS data:', error);
    return { props: { allNodes: [] } };
  }
}

export default HomePage;
