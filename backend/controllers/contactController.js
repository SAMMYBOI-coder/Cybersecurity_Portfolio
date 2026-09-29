const messages = [];

const submitContactMessage = (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email and message are required",
    });
  }

  const contactMessage = {
    id: messages.length + 1,
    name,
    email,
    message,
    createdAt: new Date(),
  };

  messages.push(contactMessage);

  res.status(201).json({
    success: true,
    message: "Message received successfully",
  });
};

module.exports = {
  submitContactMessage,
};
