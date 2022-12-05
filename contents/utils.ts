import { DateTime } from 'luxon'
import TurndownService from 'turndown'

const turndownService = new TurndownService({ bulletListMarker: '-' })

function getContentNodes(avatarDiv: Element) {
  return Array.from(avatarDiv.parentElement.parentElement.children).find(
    (item: Element) => !item.className.includes('ConversationItem__Role')
  )
}

function createCodeBlock(code: Element) {
  const hljsLang = Array.from(code.classList).find((className) =>
    className.includes('language')
  )
  const language = hljsLang?.split('-')?.at(-1) || ''

  const block = `\`\`\``
  // this weird formatting is because I'm too lazy to sanitize it properly
  // prettier-ignore
  return ` 
\n${block}${language}
${code.textContent.trim()}
${block}\n`
}

export function getConversationThread(conversationItems: Element[]) {
  let thread = []
  for (let item of conversationItems) {
    const avatar = item.querySelector('[class*="Avatar__Wrapper"]')
    if (avatar) {
      const contentNodes = getContentNodes(avatar)

      const content = Array.from(contentNodes.children).find(
        ({ className }) =>
          !className.includes('ConversationItem__ActionButtons')
      )

      thread.push({
        sender: 'User',
        content: content.textContent
      })
    } else {
      const messageItem = Array.from(item.children).find(({ className }) =>
        className.includes('ConversationItem__Message')
      )

      const contentNodes = Array.from(messageItem.children).find(
        ({ className }) => !className.includes('ConversationItem__Role')
      )

      const content = Array.from(contentNodes.children).find(
        ({ className }) =>
          !className.includes('ConversationItem__ActionButtons')
      )

      const textContentNodes = Array.from(content.children[0].children)

      let textContent = ``

      for (let textNode of textContentNodes) {
        const codeBlock = textNode.querySelector('.hljs')

        console.log(turndownService.turndown(textNode.outerHTML))
        textContent += codeBlock
          ? createCodeBlock(codeBlock)
          : turndownService.turndown(textNode.outerHTML) + '\n'
      }
      thread.push({
        sender: 'ChatGPT',
        content: textContent
      })
    }
  }
  return thread
}

export function downloadFile(markdownString: string) {
  const blob = new Blob([markdownString], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  const date = DateTime.now().toFormat('yyyy-LL-dd_HH-mm')

  link.download = `ChatGPT-${date}.txt`
  link.href = url
  link.click()
}
