import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointments';
import User from '../models/User';

class SchenduleController {
  async list(req, res) {
    const checkUSerProvider = User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUSerProvider) {
      return res
        .status(401)
        .send({ error: 'Usuario não é prestador de serviço!' });
    }

    const { date } = req.query;
    const parseDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        id: req.userId,
        canceled_at: null,
        date: { [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)] },
      },
      order: ['date'],
    });
    return res.send(appointments);
  }
}

export default new SchenduleController();
