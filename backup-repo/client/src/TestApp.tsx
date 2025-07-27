import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>✅ React está funcionando!</h1>
      <p>Esta é uma aplicação de teste simples para verificar se o React está renderizando corretamente.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <strong>Status:</strong> Aplicação carregada com sucesso!
      </div>
    </div>
  );
}

export default TestApp;