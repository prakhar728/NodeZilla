import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Table, Container, Row, Col, Button, Form } from 'react-bootstrap';
import Fuse from 'fuse.js'

import { GetCombinedAVSData } from '../../services/nodezilla';
import Layout from '../../app/layout'; // Import the Layout component
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../app/globals.css';
import Loading from '../../components/Loading';

const HomePage = ({ allNodes }) => {
  const router = useRouter();
  const [avsList, setAvsList] = useState(allNodes || []);
  const [operators, setoperators] = useState(allNodes || []);
  const [loading, setloading] = useState(true);
  const [searchKey, setsearchKey] = useState("");

  const options = {
    threshold: 0.3,
    keys: ['operator_name', 'operator_contract_address']
  }

  const fuse = new Fuse(allNodes, options);

  const handleNumOperatorsClick = (avs) => {
    if (avs.status == 'active')
      router.push(`/app/avs/${avs.operator_contract_address}`);
  };

  const fetchAllOperators = async () => {
    const allNodes = await GetCombinedAVSData();
    setAvsList(allNodes);
    setoperators(allNodes);
    setloading(false);
  }

  const filterToggle = (val) => {
    let nodes = avsList;

    if (val)
      nodes = nodes.filter(f => f.status == 'active')

    setoperators(nodes)
  }


  const handleSearch = async(e) => {
    if (e.keyCode == 13) {
      e.preventDefault();

      if (!searchKey) {
        setoperators(avsList);
      } else {
        let results = fuse.search(searchKey);
        results= results.map(r => r.item);
  
        setoperators(results)
      }

    }
  }

  useEffect(() => {
    if (allNodes && allNodes.length) {
      setloading(false);
    } else {
      fetchAllOperators();
    }
  }, [allNodes]);
  
  return (
    <Layout>  {/* Wrap the content with Layout */}
      <Container fluid>
        <Row>
          <Col md={12}>
            <h1 className="text-center my-4">Operator Explorer</h1>
            <p className="text-center mb-4">
              Welcome to the Operator Explorer, Explore operator nodes, both active and inactive. Discover and analyse their historic data, visualize their current state, know their description and more!
            </p>

            <div className='form-controls'>
              <Form>
                <Form.Check // prettier-ignore
                  type="switch"
                  id="custom-switch"
                  label="Hide inactive operators"
                  onChange={(e) => filterToggle(e.target.checked)}
                />
              </Form>

              <Form className="mb-3 w-75">
              <Form.Group className="mb-3 w-100" controlId="searchbar">
                <Form.Control type="search" placeholder="Search for Opertor address or Name" onChange={(e) => setsearchKey(e.target.value)} value={searchKey} onKeyDown={handleSearch}/>
              </Form.Group>
          </Form>
            </div>
            
            {loading ? (
              <Loading />
            ) : (
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
                        <td>{avs.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
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
