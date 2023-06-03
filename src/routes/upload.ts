import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'
import { FastifyInstance } from 'fastify'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { URL } from 'node:url'

// pipeline permiti aguardar o processo de upload de uma stream finalizar
const pump = promisify(pipeline)

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    // variavel que vai guardar a imagens
    const upload = await request.file({
      limits: {
        fileSize: 5_242_880, // 5mb tamanho maximo permititdo
      },
    })

    // Se usuario não tiver enviado nenhma imagem, despara um erro 400
    if (!upload) {
      return reply.status(400).send()
    }

    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/ // Mimetype que arquivos de video e fotos retornam
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype) // verifica se o arquivo que usaurio enviou em foto ou video

    // Se arquivo não for foto ou imagem ele retorna status 400
    if (!isValidFileFormat) {
      return reply.status(400).send()
    }

    const fileId = randomUUID() // Gerar ID
    const extension = extname(upload.filename) // pegando a extensão do arquivo

    const fileName = fileId.concat(extension) // criando um novo nome pro arquivo, com o id gerado e a extensão

    // Salvar o arquivo aos poucos
    // Mas essa não é a maneira correta de salvar arquivos
    // Aqui estou salvando arquivos diretamente no projeto
    const writeStream = createWriteStream(
      // resolve -> padronizar o caminho do arquivo que de um Sistema Operacional para outro o caminho pode ser diferente
      // __dirname retorna qual o diretorio que o arquivo upload.ts está
      resolve(__dirname, '../../uploads/', fileName),
    )

    await pump(upload.file, writeStream) // aguarda o processo de upload do arquivo finalizar

    const fullUrl = request.protocol.concat('://').concat(request.hostname) // pegando a url padrão no caso o localhost
    // criando a url para o arquivo
    // digo qual é o arquivo
    // qual sera a url que sera concatenada com ele e converto para string
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()
    return { fileUrl }
  })
}
