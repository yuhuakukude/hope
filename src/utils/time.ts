export function CoverTime(time: number) {
  const data = new Date(time)
  return `${data.getFullYear()}-${data.getMonth() + 1}-${data.getDay()}`
}
