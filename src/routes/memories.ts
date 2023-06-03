import { FastifyInstance } from 'fastify'
import { z } from 'zod' // faz validação do id
import { prisma } from '../lib/prisma'

export async function memoriesRoutes(app: FastifyInstance) {
  // preHandler -> antes excutar as funcções verifica se o usuario tem o autenticado
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify() // verifica se nessa requisição esta vindo o token
  })
  // HTTP ethod: GET, POST, PUT, PATCH, DELETE, HEAD, OPOTION
  // Listagem de memory
  app.get('/memories', async (request) => {
    // FindMany buscando memories, na ordem asc no campo createAt
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createAt: 'asc',
      },
    })
    // retornando as memory, mas dizendo quais campos quer que seja retornado
    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'), // retornar somente 115 caractres da description e concatena com ...
        createAt: memory.createAt,
      }
    })
  })

  // Buscando memory pelo id
  app.get('/memories/:id', async (request, reply) => {
    // const { id } = request.params
    const paramsSchema = z.object({
      id: z.string().uuid(), // dizendo que o id é string e uuid
    })
    // pega o request.params passa pro paramsSchema para o zod fazer a validação
    const { id } = paramsSchema.parse(request.params)
    // Bucando somente uma memory espercifica com o findUniqueOrThrow
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    // verifica se memoria é publica e se petence ao usuario
    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    return memory
  })

  // Criação de uma memory
  app.post('/memories', async (request) => {
    // fazendo a validação do body da requisição
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false), // coerce converte o valor 0 ou 1 para boolean
    })
    // pedo o corpo da requisição, valido os dados e guardo nas variaveis
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)
    // Salvo no banco de dados
    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
      },
    })
    return memory
  })

  // Editar memory
  app.put('/memories/:id', async (request, reply) => {
    // Valido o id
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    // Passo o id
    const { id } = paramsSchema.parse(request.params)
    // Valido o corpo
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })
    // Passando os dados do body
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    // buscando memory espercifica
    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    // verifica se memory que quer editar foi criada por outro user
    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }
    // altero a memory com os dados passado pelo body
    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })

  // Delitar memory espercifica
  app.delete('/memories/:id', async (request, reply) => {
    // Valido o id
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    // Passo o id
    const { id } = paramsSchema.parse(request.params)
    // buscando memory espercifica
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    // verifica se memory que quer remover foi criada por outro user
    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }
    // deleto a memory que tem esse id
    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
