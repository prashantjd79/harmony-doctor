const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const { sendEmail } = require('./utils/email'); // Adjust the path based on your project structure
const patientRoutes = require('./routes/patientRoutes');
const managerRoutes = require('./routes/managerRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const chatRoutes = require('./routes/chatRoutes');




const path = require('path');
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/chats', chatRoutes);
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
    });
});
app.post('/api/test-email', async (req, res) => {
    try {
        const { to, subject, message } = req.body;

        // Send email
        await sendEmail({ to, subject, text: message });

        // Success response
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Email error:', error.message);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
