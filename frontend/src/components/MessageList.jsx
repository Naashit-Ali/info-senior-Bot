
import React from 'react';
import { useMessages } from 'utils/useMessages';

const MessagesList = () => {
  const { messages, isLoadingAnswer } = useMessages();

  const parseText = (text) => {
    const lines = text.split('\n');

    return lines.map((line, index) => {
      const boldBulletRegex = /\* \*\*(.*?)\*\*/;
      const boldTextRegex = /\*\*(.*?)\*\*/;
      const numberedBulletRegex = /^(\d+)\.\s/;

      let parts = [];
      let lastIndex = 0;

      // Check for * ** and apply bold formatting
      let match = line.match(boldBulletRegex);
      while (match) {
        const [fullMatch, content] = match;
        parts.push(line.substring(lastIndex, match.index));
        parts.push(<i key={index}>{content}</i>);
        lastIndex = match.index + fullMatch.length;
        match = line.substring(lastIndex).match(boldBulletRegex);
      }
      parts.push(line.substring(lastIndex));

      // Check for ** and apply bold formatting
      parts = parts.flatMap((part, innerIndex) => {
        if (typeof part === 'string') {
          const match = part.match(boldTextRegex);
          if (match) {
            const [fullMatch, content] = match;
            return [
              part.substring(0, match.index),
              <strong key={index + innerIndex}>{content}</strong>,
              part.substring(match.index + fullMatch.length),
            ];
          }
        }
        return part;
      });

      // Check for numbered bullets and maintain numbering
      const numberedMatch = line.match(numberedBulletRegex);
      if (numberedMatch) {
        const number = numberedMatch[1];
        parts = [<span key={index}>{number}. </span>, ...parts.slice(1)];
      }

      return <p key={index}>{parts}</p>;
    });
  };
  return (
    <div className="pb-64 relative overflow-auto max-w-3xl mx-auto pt-8 my-auto z-0">
      {messages?.map((message, i) => {
        const isUser = message.role === 'user';
        if (message.role === 'system') return null;
        return (
          <div
            id={`message-${i}`}
            className={`flex mb-4 fade-up ${isUser ? 'justify-end' : 'justify-start'} ${i === 1 ? 'max-w-md' : ''}`}
            key={message.parts}
          >
            {!isUser && (
              <img
                src="../../img/Bot.jpg"
                className="w-11 h-11 rounded-full"
                alt="avatar"
              />
            )}
            <div
              style={{ maxWidth: 'calc(100% - 45px)' }}
              className={`group relative px-3 py-2 rounded-lg ${isUser
                ? 'mr-2 bg-gradient-to-br from-primary-700 to-primary-600 text-white'
                : 'ml-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
              }`}
            >
              {parseText(message.parts)}
            </div>
            {isUser && (
              <img
                src="../../img/user.jpg"
                className="w-11 h-11 rounded-full cursor-pointer"
                alt="avatar"
              />
            )}
          </div>
        );
      })}
      {isLoadingAnswer && messages && messages.length > 0 && (
        <div className="flex justify-end mt-2 mb-4">
          {/* loader */}
          <div className="loader p-2.5 px-4 bg-gray-200 dark:bg-gray-800 rounded-full space-x-1.5 flex justify-between items-center relative">
            <span className="block w-3 h-3 rounded-full"></span>
            <span className="block w-3 h-3 rounded-full"></span>
            <span className="block w-3 h-3 rounded-full"></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesList;