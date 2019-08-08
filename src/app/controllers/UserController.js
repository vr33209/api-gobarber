import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async create(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(4),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).send({ error: 'Erro de Validação!' });
    }

    const userExits = await User.findOne({ where: { email: req.body.email } });

    if (userExits) {
      return res.status(400).send({ error: 'Usúario já cadastrado!' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.send({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(4),
      password: Yup.string()
        .min(4)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).send({ error: 'Erro de Validação!' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExits = await User.findOne({
        where: { email: req.body.email },
      });

      if (userExits) {
        return res.status(400).send({ error: 'Usúario já cadastrado!' });
      }
    }

    if (oldPassword && !(await user.checkPassowrd(oldPassword))) {
      return res.status(400).send({ error: 'Senha invalida !' });
    }
    await user.update(req.body);
    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
    });
    return res.send({
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new UserController();
