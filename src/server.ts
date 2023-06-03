import 'dotenv/config'
import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'
import { uploadRoutes } from './routes/upload'
import { resolve } from 'node:path'

const app = fastify() // criando um servidor

app.register(multipart)

// qual pasta ficará publica
app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'), // caminho
  prefix: '/uploads', // rota
})

app.register(cors, {
  origin: true, // estou dizendo que todas urls irão acessar o back
})

//
app.register(jwt, {
  secret: 'spacetime', // secret é o que diferenciar os jwt gerados por esse banco de outros bancos
})

app.register(authRoutes) // as rotas para autenticação
app.register(uploadRoutes) // as rotas para enviar imagem
app.register(memoriesRoutes) // as rodas que serão utilizadas no caso as que estão no arquivo memories

// definindo configuração do servidor
app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('🚀HTTP server runing on http://localhost:3333')
  })
