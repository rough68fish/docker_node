const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Question: ', (question) => {
  rl.close();

  const answer = `The answer to ${question} is: 42`;
  console.log(answer);
});
