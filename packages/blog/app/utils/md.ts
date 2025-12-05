import MarkdownIt from 'markdown-it'

const md = MarkdownIt({
  html: true, // 允许 html 标签
  linkify: true, // 自动识别链接
  typographer: true, // 智能引号、破折号等
})

export function renderMarkdown(src: string): string {
  return md.render(src || '')
}
