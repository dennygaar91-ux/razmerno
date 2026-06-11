export type ServerlessRequest = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  socket: { remoteAddress?: string }
  body: unknown
}

export type ServerlessResponse = {
  setHeader(name: string, value: string): void
  status(code: number): {
    json(payload: unknown): void
    end(): void
  }
}
