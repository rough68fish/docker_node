import { Ollama } from 'ollama';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <form action="/ask" method="post">
      <label for="question">Question:</label>
      <input type="text" id="question" name="question">
      <button type="submit">Ask</button>
    </form>
  `);
});

app.post('/ask', async (req, res) => {
  const question = req.body.question;

  try {
    const ollama = new Ollama({ host: 'http://host.docker.internal:11434' });
    const response = await ollama.chat({
      model: 'nous-hermes2',
      messages: [{ role: 'user', content: question }],
    });
    const answer = response.message.content;
    res.send(`
      <p>The answer to "${question}" is:</p>
      <p>${answer}</p>
      <a href="/">Ask another question</a>
    `);
  } catch (error) {
    res.send(`
      <p>Error communicating with Ollama: ${error}</p>
      <a href="/">Try again</a>
    `);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});