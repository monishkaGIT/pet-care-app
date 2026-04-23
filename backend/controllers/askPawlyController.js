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

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        message: 'Ask Pawly is temporarily unavailable. OPENAI_API_KEY is not configured yet.'
      });
    }

    if (!process.env.OPENAI_MODEL) {
      return res.status(503).json({
        message: 'Ask Pawly is temporarily unavailable. OPENAI_MODEL is not configured yet.'
      });
    }

    let OpenAI;
    try {
      OpenAI = require('openai');
    } catch (importError) {
      return res.status(503).json({
        message: 'Ask Pawly is temporarily unavailable. OpenAI SDK is not installed.'
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL;

    const completion = await openai.chat.completions.create({
      model,
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

    const reply = completion?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        message: 'Pawly could not generate a response right now. Please try again.'
      });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('OpenAI Error:', error);
    const providerMessage = error?.error?.message || error?.message;
    res.status(500).json({
      message: providerMessage || 'Failed to connect to Pawly. Please try again later.'
    });
  }
};

module.exports = {
  getPawlyResponse
};
