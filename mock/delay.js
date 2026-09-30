// 模拟网络延迟 200~600ms
export const delay = () => {
  const ms = 200 + Math.floor(Math.random() * 400)
  return new Promise((resolve) => setTimeout(resolve, ms))
}
