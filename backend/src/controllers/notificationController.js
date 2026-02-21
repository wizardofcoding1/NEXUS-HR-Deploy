const Notification = require("../models/notifiactionModel");

exports.getMyNotifications = async (req, res) => {
    const notifications = await Notification.find({
        recipient: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: notifications,
    });
};

exports.markAsRead = async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, {
        isRead: true,
    });

    res.json({ success: true });
};

exports.clearMyNotifications = async (req, res) => {
    await Notification.deleteMany({
        recipient: req.user.userId,
    });

    res.json({ success: true });
};
