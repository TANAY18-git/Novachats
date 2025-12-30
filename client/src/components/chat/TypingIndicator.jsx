const TypingIndicator = ({ username }) => {
    return (
        <div className="flex justify-start mb-2">
            <div className="bg-dark-100 dark:bg-dark-700 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;
