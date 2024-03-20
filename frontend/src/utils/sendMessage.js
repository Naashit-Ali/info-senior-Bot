// // export const sendMessage = async (messages) => {
// //     try {
// //         const response = await fetch('/api/createMessage', {
// //             method: 'POST',
// //             headers: {
// //                 'Content-Type': 'application/json',
// //             },
// //             body: JSON.stringify({ messages }),
// //         });

// //         return await response.json();
// //     } catch (error) {
// //         console.log(error);
// //     }  
// // };


import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = "YOUR_API_KEY";

export const sendMessage = async (messages, context = {}) => {
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyDeweDNOx-zVsLqNfE0FdcjnTwbfPxarRk");
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });


    const generationConfig = {
      temperature: 0.5,
      topK: 90,
      topP: 0.1,
      maxOutputTokens: 2048,
    };


    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      // Add additional categories as needed (e.g., defamation, bias)
    ];
    
    const recentUserMessage = messages.reduce((latest, message) => {
      if (message.role === 'user') {
        return message;
      }
      return latest;
    }, null);

    let userMessageContent = recentUserMessage ? recentUserMessage.parts : '';

    const nursingHomeKeywords = ["nursingHomenew", "inHomeCare", "inpatientrehabilitiations", "memoryCare"];
    const keywordVariations = {
      nursingHomenew: ['nursing home', 'nursing homes', 'home nursing'],
      inHomeCare: ['home care', 'in home service', 'inhome service care', 'in home care', 'in home care service'],
      memoryCare: ['memory care', 'memory service', 'memory care service'],
      inpatientrehabilitiations: ['inpatientrehabilitiations service', 'inpatientrehabilitiations care', 'in patient rehabilitiations', 'in patient rehabilitiations service', 'in patient rehab care', 'in patient rehab', 'inpatient rehab','patient rehab']
    };

    const matchKeywords = (messageContent, keywords) => {
      const normalizedMessage = messageContent.toLowerCase();
      for (const keyword of keywords) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          return true;
        }
      }
      return false;
    };

    const collectionKeyword = nursingHomeKeywords.find(keyword => {
      if (userMessageContent.toLowerCase().includes(keyword.toLowerCase())) {
        return true;
      }
      if (keywordVariations[keyword]) {
        return matchKeywords(userMessageContent, keywordVariations[keyword]);
      }
      return false;
    });
    

    const fetchDataAndFormatResponse = async (apiUrl, collectionKeyword) => {
      try {
          const apiResponse = await fetch(apiUrl);
          const apiData = await apiResponse.json();
          if (apiData.length === 0) {
              return {
                  data: {
                      choices: [{
                          message: "It seems like we couldn't find a match for your search in our records.",
                      }],
                  },
              };
          }
          if (Array.isArray(apiData)) {
              const formattedResults = apiData.map((result, index) =>
                  `
                  ${index + 1}:-  ${result.name}
      
                  Details:
                  City: ${result.city}
                  Zip: ${result.zipCode}
                  State: ${result.state}
                  Address: ${result.fullAddress}
                  ----------------
                  `
              ).join('\n');
              const replyMessage = {
                  role: 'model',
                  parts: `Here are the details for ${collectionKeyword}:\n${formattedResults}`,
              };
              const newMessages = [...messages, replyMessage];
              return {
                  data: {
                      choices: [{
                          message: `Sure, These are the few top results:\n${formattedResults}`
                      }]
                  }
              };
          } else {
              console.error("Invalid API response format");
              return {
                  data: {
                      choices: [{
                          message: "Error retrieving data from the server."
                      }]
                  }
              };
          }
      } catch (error) {
          console.error("Error fetching data from the server:", error);
          return {
              data: {
                  choices: [{
                      message: "An error occurred while retrieving data from the server."
                  }]
              }
          };
      }
  };

    const zipCodeRegex = /\b(\d{5})\b/;
    const cityRegex = /\b(?:city|cities)[^\S,]*([a-zA-Z\s]+)\b/i;
    const stateRegex = /\b(?:state|states)[^\S,]*([a-zA-Z\s]+)\b/i;
    const addressRegex = /\b(?:in|of|at)\s*address\s*(.*?)(?:\.$|$)/i;


    const addressMatch = userMessageContent.match(addressRegex);
    const cityMatch = userMessageContent.match(cityRegex);
    const stateMatch = userMessageContent.match(stateRegex);
    const zipCodeMatch = userMessageContent.match(zipCodeRegex);

    // Function to extract name before comma
    const extractNameBeforeComma = (text) => {
      const commaIndex = text.indexOf(',');
      return commaIndex !== -1 ? text.substring(0, commaIndex).trim() : text.trim();
    };

    if (collectionKeyword) {
      if (cityMatch && cityMatch[1] && stateMatch && stateMatch[1] && zipCodeMatch && zipCodeMatch[1]) {
        const city = extractNameBeforeComma(cityMatch[1]);
        const state = extractNameBeforeComma(stateMatch[1]);
        const zipCode = extractNameBeforeComma(zipCodeMatch[1]);
        const apiUrl = `http://localhost:5000/api/${collectionKeyword}/search?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&zipCode=${encodeURIComponent(zipCode)}`;
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword);
        return { data, messages: newMessages || [] };
      }
      else if (addressMatch && addressMatch[1]) {        
        const fullAddress=addressMatch[1].trim()
        const apiUrl = `http://localhost:5000/api/${collectionKeyword}/fullAddress?fullAddress=${encodeURIComponent(fullAddress)}`;   
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword);
        return { data, messages: newMessages || [] };
      }
      else if ((cityMatch && cityMatch[1]) && (stateMatch && stateMatch[1])) {
        const city = extractNameBeforeComma(cityMatch[1]);
        const state = extractNameBeforeComma(stateMatch[1]);
        const apiUrl = `http://localhost:5000/api/${collectionKeyword}/city_state?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword);
        return { data, messages: newMessages || [] };
      }
      // Check for city or zipCode matches
      else if (cityMatch && cityMatch[1]) {
        const city = cityMatch[1].trim();
        const apiUrl = `http://localhost:5000/api/${collectionKeyword}/city/${encodeURIComponent(city)}`;
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword);
        return { data, messages: newMessages || [] };
      }
      else if (stateMatch && stateMatch[1]) {
        const state = stateMatch[1].trim();
        const apiUrl = `http://localhost:5000/api/${collectionKeyword}/state/${encodeURIComponent(state)}`;
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword);
        return { data, messages: newMessages || [] };
      } else if (zipCodeMatch && zipCodeMatch[1]) {
        const zipCode = zipCodeMatch[1]?.trim();
        const apiUrl = `http://localhost:5000/api/${collectionKeyword}/zipCode/${encodeURIComponent(zipCode)}`;
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword);
        return { data, messages: newMessages || [] };
      }
      else {
        const apiUrl = `http://localhost:5000/api/${collectionKeyword}`;
        const { data, newMessages } = await fetchDataAndFormatResponse(apiUrl, collectionKeyword);
        return { data, messages: newMessages || [] };
      }
    }
    else {
      const userMessages = messages.filter((message) => message.role === "user");

      
      const intro = {
        text: `I'm David, assistant for Info Senior Care. I trained by Info Senior Care to provide you best assitance! Ask me anything about our company, industry, or how I can help you.`,
      };

      const companyInfo = [
        { text: "Company info: Info Senior Care is a platform where we connect seniors and their families with a variety of senior care facilities and in-home care services" },
        { text: "Mission: Our mission is to provide a seamless and compassionate experience, ensuring the highest quality care for the seniors in a comfortable and nurturing environment." },
        { text: "Vision Statement: We understand that looking for senior care options can be challenging and tedious. To revolutionize how technology serves humanity, building bridges of opportunity through empowering solutions that drive progress and prosperity." },
        { text: "We Provide: Info Senior Care makes the process simpler for you, our user-friendly platform provides a comprehensive database of senior care facilities and in-home care providers located throughout the United States." },
        { text: "Categories Options: We offer Four Searching categories. 1- Nursing Homes, 2- In Home Care, 3- Memory Care, 4- Patient Rehabilitiations" },
      ];

      const location = [
        { text: "Info Senior Care Located at 20 Eastbourne Terrace London W2 6LG , London UK." },
      ];

      const contact = [
        { text: "For more information, Contact us at Email: info@senior.care and Phone No: (+55) 654 - 545 - 5418 , (+55) 654 - 545 - 1235" },
      ];
      const screening = [
        { text: "We also offer multiple Screening test to monitor you health. Diebetic, Elderly Nutritional, Stroke, Depressive, Elderly Fall, Cognitive Test, Frailty Screemings. To find more visit https://infosenior.care/screening.php " },
      ];
      const YouNeverProvides = [
        { text: "If someone ask irrelavant to Info Senior Care, You give sorry Response that you are not trained for this purpose! You should never provide references of your search. Only Give reference of this https://infosenior.care . And never give name of Google Gemini name!!!" },
      ];

      let parts;
      if (context.companyInfo) {
        parts = companyInfo;
      }
      if (context.intro) {
        parts = intro;
      }
      if (context.location) {
        parts = location;
      }
      if (context.contact) {
        parts = contact;
      }
      if (context.screening) {
        parts = screening;
      }
      else {
        parts = [
          intro,
          ...companyInfo,
          ...location,
          ...contact,
          ...screening,
          { text: `How can I be of assistance today?` },
        ];
      }
      
      const chat = model.startChat({
        history: [
          { role: "user", parts: userMessageContent },
          { role: "model", parts: parts.map((part) => part.text).join(" ") },
        ],
        generationConfig,
        safetySettings,
      });
      
      const result = await chat.sendMessage(userMessageContent);
      const response = await result.response;
      const reply = response.text();
      let updatedContext = { ...context };

      if (reply.includes("Info Senior Care")) {
        updatedContext = { companyInfo: true };
      }
      if (reply.includes("Who train")) {
        updatedContext = { intro: true };
      }
      if (reply.includes("contact")) {
        updatedContext = { contact: true };
      }
      if (reply.includes("situated or located")) {
        updatedContext = { location: true };
      }
      if (reply.includes("services offer")) {
        updatedContext = { companyInfo: false };
      }
      if (reply.includes("screening offer")) {
        updatedContext = { screening: false };
      }
      const replyMessage = {
        role: 'model',
        parts: reply,
      };

      const newMessages = [...messages, replyMessage];
      return { data: { choices: [{ message: reply }], context: updatedContext } };
    }
  } catch (error) {
    console.error(error);
    showToast({ message: 'An error occurred', type: 'error' });
    return { data: { choices: [{ message: 'An error occurred' }] } };
  }
};