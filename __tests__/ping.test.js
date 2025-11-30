const { ping } = require('../ping');

// Teste para a funcionalidade do ping
describe('Ping module', () => {
  test('Deve retornar PONG', () => {
    const resultado = ping();
    expect(resultado).toBe('PONG');
  });
});