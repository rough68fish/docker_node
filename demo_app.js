import { Ollama } from 'ollama';
import readline from 'readline';
import util from 'util';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Question: ', async (question) => {
  rl.close();

  try {
    const ollama = new Ollama({ host: 'http://host.docker.internal:11434' });
    const response = await ollama.chat({
        model: 'nous-hermes2',
        messages: [{ role: 'user', content: question }],
      })
    
    console.log('Full response:', util.inspect(response, { showHidden: false, depth: null, colors: true }));
    const answer = response.message.content;
    console.log(`The answer to ${question} is: \n ${answer}`);
  } catch (error) {
    console.error('Error communicating with Ollama:', error);
  }
});