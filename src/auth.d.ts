import '@fastify/jwt'

declare module '@fastify/jwt' {
  // Informando as variaveis e tipos que retornarar no jwt
  export interface FastifyJWT {
    user: {
      sub: string
      name: string
      avatarUrl: string
    }
  }
}
