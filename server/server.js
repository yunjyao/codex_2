import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

// console.log(process.env.OPENAI_API_KEY)

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(function setCommonHeaders(req, res, next) {
  res.set("Access-Control-Allow-Private-Network", "true");
  next();
});
app.use(cors())
app.use(express.json())

app.get('/api', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!'
  })
})
const conversations = [];

app.post('/api', async (req, res) => {
  try {
    console.log('posting to server')
    const prompt = req.body.prompt;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0301",
      messages: [
        { "role": "system", "content": "You are a helpful assistant." },
        ...conversations,
        { "role": "user", "content": prompt },
      ],
      // temperature: 0, 
      max_tokens: 3000,
      // top_p: 1, 
      // frequency_penalty: 0.5, 
      // presence_penalty: 0, 
    });
    // Concatenate the text from all the choices in the completion data
    let responseChain = '';
    for (const choice of response.data.choices) {
      responseChain += choice.message.content;
    }
    // Save the conversation
    conversations.push({ "role": "user", "content": prompt }, { "role": "system", "content": responseChain });
    // Reply the message
    res.status(200).send({
      bot: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(7001, () => console.log('AI server started on http://localhost:7001'))