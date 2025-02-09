// ai sandbox


import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

async function main() {
  const completion = await openai.chat.completions.create({
    model: "nvidia/llama-3.1-nemotron-70b-instruct",
    messages: [{"role":"user","content":"Write a limerick about the wonders of GPU computing."}],
    temperature: 0.5,
    top_p: 1,
    max_tokens: 1024,
    stream: true,
  })
   
  for await (const chunk of completion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '')
  }
  
}

main();