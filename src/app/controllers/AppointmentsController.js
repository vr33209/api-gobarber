import * as Yup from 'yup';
import User from '../models/User';
import Appointments from '../models/Appointments';

class AppointmentController {
  async create(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).send({ error: 'Erro de Validação!' });
    }
    const { provider_id, date } = req.body;

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });
    if (!isProvider) {
      return res
        .status(400)
        .send({ error: 'Voçê não pode criar um agendamento!' });
    }

    const appointment = await Appointments.create({
      user_id: req.userId,
      provider_id,
      date,
    });
    return res.send(appointment);
  }
}

export default new AppointmentController();
