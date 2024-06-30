import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Table, Container, Row, Col, Button, Form } from 'react-bootstrap';
import { GetCombinedAVSData } from '../../services/nodezilla';
import Layout from '../../app/layout'; // Import the Layout component
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../app/globals.css';

const HomePage = ({ allNodes }) => {
  const router = useRouter();
  const [avsList, setAvsList] = useState( allNodes || []);
  const [operators, setoperators] = useState(allNodes || []);

  
  const handleNumOperatorsClick = (avs) => {
    if (avs.status == 'active')
      router.push(`/app/avs/${avs.operator_contract_address}`);
  };


  const fetchAllOperators = async() => {
    const allNodes = await GetCombinedAVSData();

    setAvsList(allNodes);
  }

  const filterToggle = (val) => {
    let nodes = avsList;

    if (val)
      nodes = nodes.filter(f => f.status == 'active')

    setoperators(nodes)
  }


   return (
    <Layout>  {/* Wrap the content with Layout */}
      <Container fluid>
        <Row>
          <Col md={12}>
            <h1 className="text-center my-4">Operator Explorer</h1>
            <p className="text-center mb-4">
              Welcome to the Operator Explorer, Explore operator nodes, both active and inactive. Discover and analyse their historic data, visualize their current state, know their description and more!
            </p>

            <div className='operator-switch'>
            <Form>
              <Form.Check // prettier-ignore
                type="switch"
                id="custom-switch"
                label="Hide inactive operators"
                onChange={(e) => filterToggle(e.target.checked)}
              />
          </Form>
            </div>
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
                  {operators.map(avs => (
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
