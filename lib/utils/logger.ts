interface Props {
  debug?: boolean
}

// 美化打印实现方法
class PrettyLogger {
  private debugger: boolean = false
  init(props: Props) {
    const { debug = false } = props
    this.debugger = debug
  }

  private isEmpty(value: any): boolean {
    return value === null || value === undefined || value === ''
  }

  private prettyPrint(title: string, text: string, color: string): void {
    if (!this.debugger) return
    console.log(
      `%c ${title} %c ${text} %c`,
      `background:${color};border:1px solid ${color}; padding: 1px; border-radius: 2px 0 0 2px; color: #fff;`,
      `padding: 1px; border-radius: 0 2px 2px 0; color: ${color};`,
      'background:transparent'
    )
  }

  info(textOrTitle: string, content = ''): void {
    const title = this.isEmpty(content) ? 'Info' : textOrTitle
    const text = this.isEmpty(content) ? textOrTitle : content
    this.prettyPrint(title, text, 'black')
  }

  error(textOrTitle: string, content = ''): void {
    const title = this.isEmpty(content) ? 'Error' : textOrTitle
    const text = this.isEmpty(content) ? textOrTitle : content
    this.prettyPrint(title, text, 'red')
  }

  warning(textOrTitle: string, content = ''): void {
    const title = this.isEmpty(content) ? 'Warning' : textOrTitle
    const text = this.isEmpty(content) ? textOrTitle : content
    this.prettyPrint(title, text, 'orange')
  }

  success(textOrTitle: string, content = ''): void {
    const title = this.isEmpty(content) ? 'Success ' : textOrTitle
    const text = this.isEmpty(content) ? textOrTitle : content
    this.prettyPrint(title, text, 'green')
  }

  table(): void {
    const data = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
      { id: 3, name: 'Charlie', age: 35 },
    ]
    console.log(
      '%c id%c name%c age',
      'color: white; background-color: black; padding: 2px 10px;',
      'color: white; background-color: black; padding: 2px 10px;',
      'color: white; background-color: black; padding: 2px 10px;'
    )

    data.forEach((row: any) => {
      console.log(
        `%c ${row.id} %c ${row.name} %c ${row.age} `,
        'color: black; background-color: lightgray; padding: 2px 10px;',
        'color: black; background-color: lightgray; padding: 2px 10px;',
        'color: black; background-color: lightgray; padding: 2px 10px;'
      )
    })
  }

  picture(url: string, scale = 1): void {
    if (!this.debugger) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      const ctx = c.getContext('2d')
      if (ctx) {
        c.width = img.width
        c.height = img.height
        ctx.fillStyle = 'red'
        ctx.fillRect(0, 0, c.width, c.height)
        ctx.drawImage(img, 0, 0)
        const dataUri = c.toDataURL('image/png')

        console.log(
          `%c sup?`,
          `font-size: 1px;
          padding: ${Math.floor((img.height * scale) / 2)}px ${Math.floor(
            (img.width * scale) / 2
          )}px;
          background-image: url(${dataUri});
          background-repeat: no-repeat;
          background-size: ${img.width * scale}px ${img.height * scale}px;
          color: transparent;`
        )
      }
    }
    img.src = url
  }
}

// 创建打印对象
const logger = new PrettyLogger()

export { logger }
