import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    // Vai validar o code
    const bodySchema = z.object({
      code: z.string(),
    })

    // Pego o code do body e valido
    const { code } = bodySchema.parse(request.body)

    // Requisição ao github para obter o accesstoken
    const accessTokenResponse = await axios.post(
      'https:github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID, // id do client
          client_secret: process.env.GITHUB_CLIENT_SECRET, // id do client secret
          code, // code
        },
        headers: {
          Accept: 'application/json', // dizendo que quer que retorne em json
        },
      },
    )
    const { access_token } = accessTokenResponse.data // pego o access_token e retorna

    // Faço requisição ao github para pegar um usuarios passando o accesstoken
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    // Valido dados do usuario
    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string(),
      avatar_url: z.string().url(),
    })

    // Passo o usuario do body e valido
    const userInfo = userSchema.parse(userResponse.data)

    // verifico se usuario existi
    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id,
      },
    })

    // se usuario não existir salvo no banco
    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url,
        },
      })
    }

    const token = app.jwt.sign(
      {
        // dados que será retornando, sempre retornar somente dados publicos
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        // ao que o token será atribuido, no caso o id do usario, e o tempo que ele expira
        sub: user.id,
        expiresIn: '30 days',
      },
    )

    return {
      token,
    }
  })
}
