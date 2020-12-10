import React from 'react';
import Layout from '@theme/Layout';
import Redocusaurus from '../components/Redocusaurus';

function APIDocs() {
  return (
  <Layout
    title={`API Docs`}
    description={`Open API Reference Docs for the API`}
  >
    <Redocusaurus spec="http://127.0.0.1:8887/FW-openapi.json" />
  </Layout>
  );
}

export default APIDocs;