const OpenAI = require('openai');

// Initialize OpenAI conditionally, it will use process.env.OPENAI_API_KEY by default
const openai = new OpenAI();

/**
 * @desc    Get an answer from Ask Pawly assistant
 * @route   POST /api/ask-pawly
 * @access  Public (or Private depending on auth needs, keeping public for now)
 */
const getPawlyResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Pawly, a friendly, knowledgeable, and helpful pet care assistant. Answer questions clearly and concisely about pet care, food, vaccines, and training. Maintain a cheerful tone."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 300,
    });

    const reply = completion.choices[0].message.content;

    res.status(200).json({ reply });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ message: 'Failed to connect to Pawly. Please try again later.' });
  }
};

module.exports = {
  getPawlyResponse
};
