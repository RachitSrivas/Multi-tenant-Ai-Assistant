require('dotenv').config({ path: '.env' });
const { embedMany } = require('ai');
const { createMistral } = require('@ai-sdk/mistral');

async function run() {
  try {
    const mistral = createMistral({ apiKey: process.env.MISTRAL_API_KEY });
    const { embeddings } = await embedMany({
      model: mistral.embedding('mistral-embed'),
      values: ["Hello world", "This is a test document."],
    });
    console.log("Embeddings shape:", embeddings.length, embeddings[0].length);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
