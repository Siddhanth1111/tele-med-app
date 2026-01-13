import amqp from 'amqplib';

// Use admin:password123
const RABBITMQ_URL = "amqp://admin:password123@rabbitmq:5672"; // 'rabbitmq' is the docker service name

async function startService() {
  try {
    console.log("⏳ Connecting to RabbitMQ...");
    // 1. Connect to the Message Broker
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // 2. Assert Queue (Create it if it doesn't exist)
    const queue = "appointments";
    await channel.assertQueue(queue, { durable: true });

    console.log("✅ Notification Service Waiting for messages...");

    // 3. Consume Messages
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        
        console.log("---------------------------------");
        console.log("📧 NEW EVENT RECEIVED!");
        console.log(`TYPE: ${data.type}`);
        console.log(`TO: Patient ID ${data.patientId}`);
        console.log(`MSG: Your appointment with Dr. ${data.doctorId} is confirmed.`);
        console.log("---------------------------------");

        // Acknowledge (Tell RabbitMQ we finished processing so it can delete the msg)
        channel.ack(msg);
      }
    });

  } catch (error) {
    console.error("RabbitMQ Connection Failed", error);
    // Retry logic could go here
    setTimeout(startService, 5000);
  }
}

startService();