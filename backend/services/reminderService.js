class ReminderService {
  static async checkAndSendReminders(db) {
    try {
      const today = new Date();
      const invoicesRef = db.collection('facturas');
      const snapshot = await invoicesRef.where('status', '==', 'pending').get();

      for (const doc of snapshot.docs) {
        const invoice = { id: doc.id, ...doc.data() };
        const dueDate = new Date(invoice.dueDate);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        // Aquí puedes agregar lógica para enviar recordatorios
        if (daysUntilDue === 7 && !invoice.reminder_7d_sent) {
          console.log(`📧 Recordatorio 7 días para factura ${invoice.number}`);
          await doc.ref.update({ reminder_7d_sent: true });
        }
        
        if (daysUntilDue === 3 && !invoice.reminder_3d_sent) {
          console.log(`📧 Recordatorio 3 días para factura ${invoice.number}`);
          await doc.ref.update({ reminder_3d_sent: true });
        }
        
        if (daysUntilDue === 1 && !invoice.reminder_1d_sent) {
          console.log(`📧 Recordatorio 1 día para factura ${invoice.number}`);
          await doc.ref.update({ reminder_1d_sent: true });
        }
      }
    } catch (error) {
      console.error('Error en recordatorios:', error);
    }
  }
}

module.exports = ReminderService;