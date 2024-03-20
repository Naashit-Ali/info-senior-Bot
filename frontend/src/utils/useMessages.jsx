// import { useToast } from '@apideck/components';
// import ChatCompletionRequestMessage from 'openai';
// import { createContext, useContext, useEffect, useState } from 'react';
// import { sendMessage } from './sendMessage';

// const ChatsContext = createContext({} );

// export function MessagesProvider({ children }) {
//   const { addToast } = useToast();
//   const [messages, setMessages] = useState([]);
//   const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);

//   useEffect(() => {
//     const initializeChat = () => {
//       const systemMessage = {
//         role: 'system',
//         content: 'I am Info Senior Care personalized bot , a large language model trained by Info Senior Care.',
//       };
//       const welcomeMessage = {
//         role: 'assistant',
//         content: 'Hi, How can I help you today?',
//       };
//       setMessages([systemMessage, welcomeMessage]);
//     };

//     if (!messages?.length) {
//       initializeChat();
//     }
//   }, [messages?.length, setMessages]);

//   const addMessage = async (content) => {
//     setIsLoadingAnswer(true);
//     try {
//       const newMessage = {
//         role: 'user',
//         content,
//       };
//       const newMessages = [...messages, newMessage];
//       setMessages(newMessages);

//       const { data } = await sendMessage(newMessages);

//       const reply = data.response;
//       setMessages([...newMessages, reply]);
//     } catch (error) {
//       console.log('An error occurred',error)
//       addToast({ title: 'An error occurred', type: 'error' });
//     } finally {
//       setIsLoadingAnswer(false);
//     }
//   };

//   return (
//     <ChatsContext.Provider value={{ messages, addMessage, isLoadingAnswer }}>
//       {children}
//     </ChatsContext.Provider>
//   );
// }

// export const useMessages = () => {
//   return useContext(ChatsContext);
// };

//Gemini
import { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@apideck/components';
import { sendMessage } from './sendMessage';

const ChatsContext = createContext({});

export function MessagesProvider({ children }) {
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);

  useEffect(() => {
    const initializeChat = () => {
      const systemMessage = {
        role: "system",
        parts: "Hi, I am Info Senior Care Assistant. I am here to assist you to provide accurate and helpful information!",
      };
      const welcomeMessage = {
        role: 'model',
        parts: 'I am David, personalized assistant of Info Senior Care. Here you to provide best assitance! Ask me anything about our company, industry, or how can I help you?',
      };
      setMessages([systemMessage, welcomeMessage]);
    };

    if (!messages?.length) {
      initializeChat();
    }
  }, [messages?.length, setMessages]);

  const addMessage = async (parts) => {
    setIsLoadingAnswer(true);
    try {
      const newMessage = {
        role: 'user',
        parts,
      };
      const newMessages = [...messages, newMessage];
      setMessages(newMessages);

      const { data } = await sendMessage(newMessages);
      const reply = data.choices[0].message;
      setMessages([...newMessages, { role: 'model', parts: reply }]);
    } catch (error) {
      addToast({ title: 'An error occurred', type: 'error' });
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  return (
    <ChatsContext.Provider value={{ messages, addMessage, isLoadingAnswer }}>
      {children}
    </ChatsContext.Provider>
  );
}

export const useMessages = () => {
  return useContext(ChatsContext);
};
