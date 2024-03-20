// // // import fetch from 'isomorphic-unfetch';

// export default async function createMessage(req, res) {
//   const { messages } = req.body
//   const apiKey = process.env.OPENAI_API_KEY
//   const url = 'https://api.openai.com/v1/chat/completions'

//   const body = JSON.stringify({
//     messages,
//     model: 'gpt-3.5-turbo-16k',
//     stream: false,
//     temperature:0.3
//   })

//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${apiKey}`
//       },
//       body
//     })

//     const data = await response.json()
//     res.status(200).json({ data })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }
