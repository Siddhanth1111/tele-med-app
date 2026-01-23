import amqp from 'amqplib';

const RABBITMQ_URL = "amqp://admin:password123@rabbitmq:5672"; 

async function startService() {
  try {
    console.log("⏳ Notification Service connecting...");
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    const queue = "appointments";
    // We just assert existence here; configuration matches the publisher
    await channel.assertQueue(queue, { 
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dlx_exchange', 
        'x-dead-letter-routing-key': 'refund_key' 
      }
    });

    console.log("✅ Notification Service Waiting for messages...");

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          
          console.log("---------------------------------");
        console.log("📧 NEW EVENT RECEIVED!");
        console.log(`TYPE: ${data.type}`);
        console.log(`TO: Patient ID ${data.patientId}`);
        console.log(`MSG: Your appointment with Dr. ${data.doctorId} is confirmed.`);
        console.log("---------------------------------");

          // SUCCESS: Delete message
          channel.ack(msg);

        } catch (error: any) {
          console.error("❌ PROCESSING FAILED:", error.message);
          console.warn("⚠️ Sending message to DLQ (Triggering Refund)...");
          
          // FAILURE: Reject message. 
          // false = do NOT requeue (send to DLQ instead)
          channel.nack(msg, false, false); 
        }
      }
    });

  } catch (error) {
    console.error("RabbitMQ Connection Failed", error);
    setTimeout(startService, 5000);
  }
}

startService();