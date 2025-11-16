const User = require('../models/User');
const Joi = require('joi');

class UserController {
  static async getProfile(req, res) {
    try {
      // O middleware de autenticação já anexa o usuário ao req
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
      }
      // Remove o hash da senha antes de enviar
      delete user.password_hash;
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar perfil.', error: error.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const profileSchema = Joi.object({
        name: Joi.string().min(3).required().messages({
          'string.empty': 'O nome é obrigatório.',
          'string.min': 'O nome deve ter pelo menos 3 caracteres.',
        }),
        ftp: Joi.number().integer().min(50).max(600).allow(null, ''),
        max_heart_rate: Joi.number().integer().min(100).max(250).allow(null, ''),
        weight: Joi.number().min(30).max(200).allow(null, ''),
      });

      const { error } = profileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const userId = req.user.id;
      const { name, ftp, max_heart_rate, weight } = req.body;

      const updatedUser = await User.update(userId, {
        name,
        ftp,
        max_heart_rate,
        weight,
      });

      delete updatedUser.password_hash;

      res.json({ success: true, data: updatedUser, message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar perfil.', error: error.message });
    }
  }
}

module.exports = UserController;