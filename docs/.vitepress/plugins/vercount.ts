export const loadVercount = () => {
  return new Promise<void>((resolve, reject) => {
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://events.vercount.one/js'
    document.body.appendChild(script)
    script.onload = () => {
      resolve()
    }
    script.onerror = () => {
      reject()
    }
  })
}
