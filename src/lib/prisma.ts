import { PrismaClient } from '@prisma/client'

// como sera utilizado em varios arquivos o prismacliente
// importa 1 vez aqui e posso utilizar nos outros arquivos
export const prisma = new PrismaClient({
  log: ['query'], // log de todas as requisições feita ao banco
})
