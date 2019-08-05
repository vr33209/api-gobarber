import User from '../models/User';
import Notification from '../schemas/Notifications';

class NotificationController {
  async list(req, res) {
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkIsProvider) {
      return res.status(400).send({
        error: 'Apenas prestadores de serviço podem carregar notificações!',
      });
    }
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);
    return res.send(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        read: true,
      },
      { new: true }
    );

    return res.send(notification);
  }
}

export default new NotificationController();
