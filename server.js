
require('dotenv').config();
const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const emailjs = require('emailjs-com');
const cors = require('cors');

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

// Endpoint para crear sesión de pago
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Planificador StartSmart - PDF',
            },
            unit_amount: 299,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.CANCEL_URL,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware para verificar webhook Stripe
app.post('/webhook', bodyParser.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Aquí enviamos el email con EmailJS
    sendEmail(session.customer_details.email);
  }

  res.status(200).json({ received: true });
});

// Enviar email con EmailJS (usar fetch)
function sendEmail(toEmail) {
  const fetch = require('node-fetch');
  const serviceID = process.env.EMAILJS_SERVICE_ID;
  const templateID = process.env.EMAILJS_TEMPLATE_ID;
  const userID = process.env.EMAILJS_PUBLIC_KEY;

  const templateParams = {
    to_email: toEmail,
    product_link: process.env.PRODUCT_DRIVE_LINK
  };

  fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceID,
      template_id: templateID,
      user_id: userID,
      template_params: templateParams
    })
  }).then(res => {
    if (res.ok) {
      console.log('Email enviado a:', toEmail);
    } else {
      console.error('Error enviando email:', res.statusText);
    }
  }).catch(console.error);
}

app.get("/", (req, res) => {
  res.send("Servidor activo. ¡Hola desde el backend!");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
