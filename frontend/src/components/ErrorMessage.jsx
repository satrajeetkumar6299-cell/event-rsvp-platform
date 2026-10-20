function ErrorMessage({ message }) {
    if (!message) return null;
    return (
        <p className="message message-error" role="alert">
            {message}
        </p>
    );
}

export default ErrorMessage;