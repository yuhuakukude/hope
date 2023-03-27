export type IFunction = (...args: unknown[]) => void
export enum Topic {
  LOGOUT,
  LOGIN
}

export class Emiter<Topic extends number> {
  private listeners: Map<Topic, IFunction[]>

  constructor () {
    this.listeners = new Map()
  }

  on = (name: Topic, callback: IFunction) => {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, [])
    }
    this.listeners.get(name)?.push(callback)

    return () => {
      this.listeners.get(name)?.filter((fn) => fn !== callback)
    }
  }

  emit = (name: Topic, ...args: Array<unknown>) => {
    this.listeners.get(name)?.forEach((fn) => fn(...args))
  }
}
