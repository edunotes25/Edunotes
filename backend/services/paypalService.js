const paypal = require('@paypal/checkout-server-sdk');

// Configurar PayPal
const environment = process.env.PAYPAL_MODE === 'live'
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);

const client = new paypal.core.PayPalHttpClient(environment);

class PayPalService {
  // Crear orden de pago
  static async createOrder(invoiceId, amount, description) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: invoiceId,
        description: description,
        amount: {
          currency_code: 'EUR',
          value: amount.toFixed(2)
        }
      }],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`
      }
    });

    try {
      const order = await client.execute(request);
      return { success: true, orderId: order.result.id, links: order.result.links };
    } catch (error) {
      console.error('Error creando orden PayPal:', error);
      return { success: false, error: error.message };
    }
  }

  // Capturar pago
  static async captureOrder(orderId) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const capture = await client.execute(request);
      return { success: true, capture: capture.result };
    } catch (error) {
      console.error('Error capturando pago:', error);
      return { success: false, error: error.message };
    }
  }

  // Crear suscripción
  static async createSubscription(planId, subscriberEmail, subscriberName, customId) {
    const request = new paypal.subscriptions.SubscriptionsCreateRequest();
    request.requestBody({
      plan_id: planId,
      subscriber: {
        email_address: subscriberEmail,
        name: {
          given_name: subscriberName
        }
      },
      custom_id: customId,
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/subscription-success`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription-cancel`
      }
    });

    try {
      const subscription = await client.execute(request);
      return { success: true, subscriptionId: subscription.result.id, links: subscription.result.links };
    } catch (error) {
      console.error('Error creando suscripción:', error);
      return { success: false, error: error.message };
    }
  }

  // Cancelar suscripción
  static async cancelSubscription(subscriptionId, reason = 'Cancelado por el usuario') {
    const request = new paypal.subscriptions.SubscriptionsCancelRequest(subscriptionId);
    request.requestBody({
      reason: reason
    });

    try {
      await client.execute(request);
      return { success: true };
    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener detalles de suscripción
  static async getSubscriptionDetails(subscriptionId) {
    const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionId);

    try {
      const subscription = await client.execute(request);
      return { success: true, subscription: subscription.result };
    } catch (error) {
      console.error('Error obteniendo suscripción:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = PayPalService;