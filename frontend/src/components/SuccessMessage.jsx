function SuccessMessage({ message }) {
    if (!message) return null;
    return (
        <p className="message message-success" role="status">
            {message}
        </p>
    );
}

export default SuccessMessage;