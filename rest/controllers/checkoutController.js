import checkoutService from '../../src/services/checkoutService.js';
import userService from '../../src/services/userService.js';

const checkout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const userData = userService.verifyToken(token);
  if (!userData) return res.status(401).json({ error: 'Token inválido' });

  const { items, freight, paymentMethod, cardData } = req.body;
  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Itens do checkout não podem estar vazios' });
    }
    const result = checkoutService.checkout(userData.id, items, freight, paymentMethod, cardData);
    res.status(200).json({ success: true, valorFinal: result.total, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export default { checkout };
