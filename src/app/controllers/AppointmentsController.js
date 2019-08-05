import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import Appointments from '../models/Appointments';
import File from '../models/File';
import Notification from '../schemas/Notifications';

import Mail from '../../lib/mail';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointments.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.send(appointments);
  }

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

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).send({ error: 'Data não permitida!' });
    }

    const checkAvailability = await Appointments.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).send({ error: 'Agendmento não está valido!' });
    }

    const appointment = await Appointments.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    const user = await User.findByPk(req.userId);
    const formatDate = format(hourStart, "' dia 'dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} realizado para o ${formatDate} !`,
      user: provider_id,
    });

    return res.send(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointments.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });
    if (appointment.user_id !== req.userId) {
      return res.status(401).send({
        error: 'Voçê não tem permissão para excluir esse agendamento !',
      });
    }
    const dateWithSub = subHours(Appointments.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).send({
        error:
          'Voçê só pode cancelar o agendamento com duas horas de antecendência !',
      });
    }

    appointment.canceled_at = new Date();
    await appointment.save();

    Mail.sendEmail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancelation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(appointment.date, "' dia 'dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });
    return res.send(appointment);
  }
}

export default new AppointmentController();
