/**
 * MessageBubble — Individual chat message bubble.
 * Different styling for sender vs receiver.
 */
export default function MessageBubble({ message, isSender }) {
  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`flex items-end gap-2 max-w-[75%] ${isSender ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        {!isSender && (
          <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-700 shrink-0 mb-1">
            <img src={message.avatar} alt={message.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div>
          {/* Name (only for receiver) */}
          {!isSender && (
            <p className="text-[10px] text-gray-500 mb-1 ml-1">{message.name}</p>
          )}

          {/* Bubble */}
          <div
            className={`
              px-4 py-2.5 text-sm leading-relaxed
              ${
                isSender
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl rounded-br-md"
                  : "bg-[#1a1a2e] text-gray-200 border border-gray-700/30 rounded-2xl rounded-bl-md"
              }
            `}
          >
            {message.text}
          </div>

          {/* Timestamp */}
          <p className={`text-[10px] text-gray-600 mt-1 ${isSender ? "text-right mr-1" : "ml-1"}`}>
            {message.time}
          </p>
        </div>
      </div>
    </div>
  );
}
