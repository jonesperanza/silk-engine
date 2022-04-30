import { EachMessagePayload, KafkaMessage } from 'kafkajs';
import Agent from '../kafka/models/agent.js';
import MessageData from '../kafka/models/messageData.js';

class Data extends MessageData {
  ordertime!: number;
  orderid!: number;
  orderida!: number;
  orderids!: number;
  orderidd!: number;
  orderidf!: number;
  orderidg!: number;
  orderidh!: number;
  orderidj!: number;
  orderidk!: number;
}

const agent = new Agent('mock-topic', new Data(), async (messageData: Data): Promise<void> => {
  /* await app.db.set('order-id', message.orderid); */
  // use redis cache
});

const mockAgents = [agent, agent, agent, agent, agent];
const mockMessage: EachMessagePayload = {
  topic: 'mock-topic',
  partition: 4,
  message: {
    key: Buffer.from('18'),
    value: Buffer.from(
      '{"orderid": 18, "ordertime": 23, "orderida": 1, "orderids": 1, "orderidd": 1, "orderidf": 1, "orderidg": 1, "orderidh": 1, "orderidj": 1, "orderidk": 1}',
    ),
    timestamp: '202023920',
    size: 12,
    attributes: 1,
    offset: '60',
  } as KafkaMessage,
  heartbeat: async () => {},
};

let avg = 0;

async function handleMessage(messagePayload: EachMessagePayload): Promise<void> {
  const start = performance.now();
  const { topic, partition, message } = messagePayload;
  const jsonData = JSON.parse(String(message.value)); // message.value into generic object
  /* this.kafkaLogger.kafka({
    prefix: `${topic}[${partition} | ${message.offset}]`,
    key: String(message.key),
    value: jsonData, // remove bc sensitive data
  }); */
  await Promise.all(
    mockAgents.map(async agent => {
      // run async agents in parallel
      if (topic === agent.topic && jsonData != undefined) {
        await agent.executeAgent(jsonData);
      }
    }),
  );
  const end = performance.now();
  const time = end - start;
  avg += time;
}

for (let i = 0; i < 100; i++) {
  await handleMessage(mockMessage);
}
// eslint-disable-next-line no-console
console.log(
  'average time for each message consumed (' +
    mockAgents.length +
    ' agent(s), 1 job each):' +
    (avg / 100).toFixed(3) +
    'ms',
);