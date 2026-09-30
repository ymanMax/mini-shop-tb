// 模拟网络延迟：随机 200~600ms
function delay() {
  const ms = 200 + Math.random() * 400
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = delay
