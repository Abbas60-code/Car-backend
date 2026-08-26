import Contact from '../Models/Contact.js';

export const handleContactSubmit = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields.',
      });
    }

    const newContact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your message has been sent successfully.',
      data: newContact,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending contact message.',
      error: error.message,
    });
  }
};
