import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import Auth from '../../config/auth';

class SessionController {
  async create(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).send({ error: 'Erro de Validação!' });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).send({ error: 'Usuario não encontrado !' });
    }

    if (!(await user.checkPassowrd(password))) {
      return res.status(400).send({ error: 'Senha invalida!!' });
    }

    const { id, name } = user;

    return res.send({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, Auth.secret, {
        expiresIn: Auth.expiresIn,
      }),
    });
  }
}

export default new SessionController();
