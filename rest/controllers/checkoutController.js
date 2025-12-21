
import checkoutService from '../../src/services/checkoutService.js';
import userService from '../../src/services/userService.js';
import products from '../../src/models/product.js';

// Simulação de pedidos em memória
const pedidosPorUsuario = {};

const listProducts = (req, res) => {
  res.status(200).json(products);
};

const getProductById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
  res.status(200).json(product);
};

const checkout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const userData = userService.verifyToken(token);
  if (!userData) return res.status(401).json({ error: 'Token inválido' });

  const { items, freight = 0, paymentMethod = 'boleto', cardData } = req.body;
  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Itens do checkout não podem estar vazios' });
    }
    const result = checkoutService.checkout(userData.id, items, freight, paymentMethod, cardData);
    // Salva pedido em memória
    const pedido = {
      order: {
        id: Date.now(),
        userId: userData.id,
        items: result.items,
        total: result.total,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
    };
    if (!pedidosPorUsuario[userData.id]) pedidosPorUsuario[userData.id] = [];
    pedidosPorUsuario[userData.id].push(pedido.order);
    res.status(201).json(pedido);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listOrders = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const userData = userService.verifyToken(token);
  if (!userData) return res.status(401).json({ error: 'Token inválido' });
  const pedidos = pedidosPorUsuario[userData.id] || [];
  res.status(200).json(pedidos);
};

export default { checkout, listProducts, getProductById, listOrders };
