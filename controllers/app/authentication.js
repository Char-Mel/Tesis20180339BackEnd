const router = require('express').Router()
const USER = require('../../models/user')
const jwt = require('jsonwebtoken')
const { generateAccessToken, authenticateToken } = require('../utils/jwt')

router.route('/login')
  .post(async (req, res) => {

    try {

      const { correo,contrasena } = req.body

      const user = await USER.findOne({ correo })

      if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado' })
      }

      if (correo!==contrasena) {
        return res.status(401).json({ message: 'Verifica que las credenciales son correctas' })
      }

      const _usuario = { _id: user._id }
      const accessToken = generateAccessToken(_usuario)

      return res.status(200).json({
        accessToken,
        user: {
          nombre: user.nombre,
          apellidoPaterno: user.apellidoPaterno,
          apellidoMaterno: user.apellidoMaterno,
          correo: user.correo,
          estado: user.estado,
          rol: user.rol
        }
      })

    } catch (e) {
      console.error('Error: ', e)
      return res.status(500).json({ message: 'Encountered a server error' })
    }
  });

router.route('/personal')
  .get(authenticateToken, async (req, res) => {

    try {
      const { _id } = req.user

      const usuario = await USER.findOne({ _id })

      if (!usuario) return res.status(401).json({ message: 'Invalid auth token' })

      const { correo, ...data } = await usuario.toJSON()

      const user = data
      return res.status(200).json({ user })
    } catch (e) {
      console.error('Error: ', e)
      return res.status(500).json({ message: 'Encountered a server error' })
    }
  });

// router.route('/verify')
//   .get(authenticateToken, async (req, res) => {

//     try {
//       const { _id } = req.user


//       return res.status(200).json({ user })
//     } catch (e) {
//       console.error('Error: ', e)
//       return res.status(500).json({ message: 'Encountered a server error' })
//     }
//   });

module.exports = router;